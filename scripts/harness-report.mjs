#!/usr/bin/env node
/**
 * Gera o snapshot do harness-score consumido pela página /quality.
 *
 * Roda no `prebuild`, portanto também no build da Vercel: o número publicado é
 * sempre o resultado de uma varredura real do repositório que está sendo
 * construído, não um artefato commitado que envelhece em silêncio.
 *
 * Se a varredura falhar, cai para `quality/baseline.json` e avisa no log — a
 * página nunca quebra o build de produção por causa de uma ferramenta externa.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE_PATH = join(ROOT, 'quality', 'baseline.json');
const OUTPUT_PATH = join(ROOT, 'src', 'data', 'harness-score.json');
const HISTORY_PATH = join(ROOT, 'data', 'harness-history.json');

/**
 * Baseline determinístico, independente de onde a varredura rodou.
 *
 * O relatório traz `root` com o caminho absoluto do diretório escaneado, que é
 * `/home/runner/work/...` no CI e outra coisa em cada máquina. Sem normalizar,
 * todo build na branch principal produzia um commit cujo único diff era esse
 * caminho — ruído que, pior que poluir o histórico, esconde a mudança real
 * quando ela acontece.
 */
function toBaseline(report) {
  return { ...report, root: '.' };
}

/** Projeção estável do relatório: só o que a página /quality realmente usa. */
function toSnapshot(report, source) {
  return {
    source,
    scannedAt: new Date().toISOString(),
    tool: {
      name: report.tool?.name ?? 'harness-score',
      version: report.tool?.version ?? 'desconhecida',
    },
    level: {
      index: report.level?.index ?? 0,
      name: report.level?.name ?? 'desconhecido',
      nextLevelGaps: report.level?.nextLevelGaps ?? [],
    },
    score: {
      earned: report.score?.earned ?? 0,
      max: report.score?.max ?? 0,
      percent: report.score?.percent ?? 0,
    },
    dimensions: (report.dimensions ?? []).map((dimension) => ({
      id: dimension.id,
      title: dimension.title,
      earned: dimension.earned,
      max: dimension.max,
      percent: dimension.percent,
    })),
    checks: (report.checks ?? []).map((check) => ({
      id: check.id,
      dimension: check.dimension,
      title: check.title,
      points: check.points,
      earned: check.earned,
      passed: check.passed,
      evidence: check.evidence ?? '',
      remediation: check.remediation ?? '',
    })),
  };
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function scan() {
  const stdout = execFileSync('npx', ['--no-install', 'harness-score', '--json'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    // --min-level não é usado aqui: quem reprova é o CI, não o build do site.
  });
  return JSON.parse(stdout);
}

function updateHistory(snapshot) {
  const entry = {
    date: snapshot.scannedAt.slice(0, 10),
    level: snapshot.level.index,
    levelName: snapshot.level.name,
    percent: snapshot.score.percent,
  };

  const history = existsSync(HISTORY_PATH) ? readJson(HISTORY_PATH) : [];
  const last = history.at(-1);

  if (last && last.level === entry.level && last.percent === entry.percent) {
    return { history, changed: false };
  }

  return { history: [...history, entry], changed: true };
}

/**
 * Escreve o snapshot apenas quando o resultado muda.
 *
 * `scannedAt` mudaria a cada build, deixando a árvore de trabalho suja sem que
 * nada tenha mudado de fato. Comparando tudo menos o carimbo de tempo, o
 * arquivo commitado só é reescrito quando a medição realmente mudou — e o
 * carimbo passa a significar "quando este resultado passou a valer".
 */
function writeSnapshotIfChanged(snapshot) {
  if (existsSync(OUTPUT_PATH)) {
    const current = readJson(OUTPUT_PATH);
    const { scannedAt: _previous, ...currentRest } = current;
    const { scannedAt: _next, ...nextRest } = snapshot;

    if (JSON.stringify(currentRest) === JSON.stringify(nextRest)) {
      console.log('[quality] resultado inalterado; snapshot mantido.');
      return;
    }
  }

  writeJson(OUTPUT_PATH, snapshot);
  console.log('[quality] snapshot atualizado.');
}

function main() {
  const shouldWriteHistory = process.argv.includes('--update-history');
  const shouldWriteBaseline = process.argv.includes('--write-baseline');
  let snapshot;
  let report;

  try {
    report = scan();
    snapshot = toSnapshot(report, 'scan');
    console.log(
      `[quality] ${snapshot.level.name} (L${snapshot.level.index}) — ` +
        `${snapshot.score.earned}/${snapshot.score.max} pontos (${snapshot.score.percent}%)`
    );
  } catch (error) {
    if (!existsSync(BASELINE_PATH)) {
      console.error('[quality] varredura falhou e não há baseline para usar como fallback.');
      throw error;
    }
    snapshot = toSnapshot(readJson(BASELINE_PATH), 'baseline');
    console.warn(
      `[quality] varredura falhou (${error.message}). Usando quality/baseline.json. ` +
        'A página /quality vai indicar que o dado não é da execução atual.'
    );
  }

  writeSnapshotIfChanged(snapshot);

  if (shouldWriteBaseline && report) {
    writeJson(BASELINE_PATH, toBaseline(report));
    console.log('[quality] baseline atualizado.');
  }

  if (shouldWriteHistory && snapshot.source === 'scan') {
    const { history, changed } = updateHistory(snapshot);
    if (changed) {
      writeJson(HISTORY_PATH, history);
      console.log(`[quality] histórico atualizado (${history.length} pontos).`);
    } else {
      console.log('[quality] nível e percentual inalterados; histórico mantido.');
    }
  }
}

main();
