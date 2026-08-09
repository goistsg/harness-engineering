import snapshotJson from '@/data/harness-score.json';
import historyJson from '../../data/harness-history.json';

/**
 * Tipos do snapshot do harness-score consumido pela página /quality.
 *
 * O JSON é gerado por scripts/harness-report.mjs no prebuild. As interfaces
 * aqui são o contrato entre o script e a página: mudar a projeção lá sem
 * ajustar aqui quebra o typecheck, que é o comportamento desejado.
 */

export interface DimensionScore {
  readonly id: string;
  readonly title: string;
  readonly earned: number;
  readonly max: number;
  readonly percent: number;
}

export interface CheckResult {
  readonly id: string;
  readonly dimension: string;
  readonly title: string;
  readonly points: number;
  readonly earned: number;
  readonly passed: boolean;
  readonly evidence: string;
  readonly remediation: string;
}

export interface QualitySnapshot {
  /** `scan` = varredura desta build; `baseline` = fallback commitado. */
  readonly source: 'scan' | 'baseline';
  readonly scannedAt: string;
  readonly tool: { readonly name: string; readonly version: string };
  readonly level: {
    readonly index: number;
    readonly name: string;
    readonly nextLevelGaps: readonly string[];
  };
  readonly score: { readonly earned: number; readonly max: number; readonly percent: number };
  readonly dimensions: readonly DimensionScore[];
  readonly checks: readonly CheckResult[];
}

export interface HistoryEntry {
  readonly date: string;
  readonly level: number;
  readonly levelName: string;
  readonly percent: number;
}

export const snapshot = snapshotJson as QualitySnapshot;

/**
 * Série histórica commitada, alimentada pelo workflow de qualidade na branch
 * principal. Começa vazia num repositório novo — a asserção é necessária
 * porque o TypeScript infere `never[]` para um array literal vazio em JSON.
 */
export const history = historyJson as HistoryEntry[];

/** Coordenadas do sparkline de histórico, num viewBox de 100x30. */
export function sparklinePoints(entries: readonly HistoryEntry[]): string {
  return entries
    .map((entry, index) => {
      const x = entries.length === 1 ? 50 : (index / (entries.length - 1)) * 100;
      const y = 30 - (entry.percent / 100) * 28 - 1;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}
