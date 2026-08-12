/**
 * Fonte única de verdade sobre identidade, autoria e taxonomia editorial.
 *
 * Tudo que aparece publicamente (schema.org, RSS, sitemap, <head>, /about)
 * lê daqui. Trocar autoria, domínio ou eixos é uma edição neste arquivo.
 *
 * Regra: nada de placeholder. Campo sem valor real fica string vazia e o
 * componente correspondente não renderiza — ver src/test/site-config.test.ts.
 */

export interface Author {
  /** Nome exibido e usado como `author` no JSON-LD. */
  readonly name: string;
  /** Headline curta (cargo/posicionamento). Vazio = não renderiza. */
  readonly headline: string;
  /** Parágrafo biográfico de /about. Vazio = seção não renderiza. */
  readonly bio: string;
  /** Perfis públicos — viram `sameAs` no schema.org. */
  readonly sameAs: readonly string[];
}

export interface EditorialAxis {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

export const AUTHOR: Author = {
  name: 'Tiago Gois',
  headline: '',
  bio: '',
  sameAs: ['https://github.com/goistsg'],
};

/**
 * Os três eixos temáticos do journal. O `id` é o valor aceito pelo frontmatter
 * dos artigos (validado pelo schema Zod em src/content.config.ts), então mudar
 * um `id` aqui quebra o build até que os artigos sejam atualizados — que é
 * exatamente o comportamento desejado.
 */
export const EDITORIAL_AXES = [
  {
    id: 'lideranca-squads',
    label: 'Liderança & Squads',
    description:
      'Como times de software realmente funcionam: autonomia, ritmo, contratos entre squads e o custo de coordenação.',
  },
  {
    id: 'ia-na-pratica',
    label: 'IA na Prática',
    description:
      'Uso de modelos e agentes em produção — harness, avaliação, guardrails e o que sobrevive ao contato com usuários reais.',
  },
  {
    id: 'arquitetura-seguranca',
    label: 'Arquitetura & Segurança',
    description:
      'Decisões estruturais e suas consequências: limites de sistema, falhas previsíveis e segurança como propriedade de design.',
  },
] as const satisfies readonly EditorialAxis[];

export type AxisId = (typeof EDITORIAL_AXES)[number]['id'];

export const AXIS_IDS = EDITORIAL_AXES.map((axis) => axis.id) as [AxisId, ...AxisId[]];

export function getAxis(id: AxisId): EditorialAxis {
  const axis = EDITORIAL_AXES.find((candidate) => candidate.id === id);
  if (!axis) {
    throw new Error(`Eixo editorial desconhecido: ${id}`);
  }
  return axis;
}

export const SITE = {
  url: 'https://harnessengineering.com.br',
  name: 'Harness Engineering',
  title: 'Harness Engineering — journal técnico de engenharia, squads e IA em produção',
  description:
    'Journal técnico sobre engenharia de software, liderança de squads e uso de IA em produção. Escrito por Tiago Gois.',
  language: 'pt-BR',
  locale: 'pt_BR',
  repository: 'https://github.com/goistsg/harness-engineering',
  /** Contato de disclosure responsável — espelha o SECURITY.md. */
  securityContact: 'goistsg@gmail.com',
} as const;

export const NAV_LINKS = [
  { href: '/journal', label: 'Journal' },
  { href: '/about', label: 'Sobre' },
  { href: '/quality', label: 'Qualidade' },
] as const;

export interface Locale {
  /** Código BCP 47, igual ao que vai no atributo `lang`. */
  readonly code: string;
  /** Rótulo curto do seletor no header. Duas letras, caixa alta. */
  readonly short: string;
  /** Nome do idioma no próprio idioma — lido por quem não entende português. */
  readonly label: string;
  /** Prefixo de rota. Vazio no idioma padrão: pt-BR mora na raiz (ADR 0003). */
  readonly pathPrefix: string;
  /** `false` enquanto não existir tradução publicada — o item não vira link. */
  readonly available: boolean;
}

/**
 * Idiomas do seletor do header, na Fase 1 do i18n.
 *
 * Inglês e espanhol aparecem no seletor com `available: false`: o componente os
 * mostra desabilitados, marcados como "em breve", em vez de linkar para rotas
 * que ainda não existem. Publicar um link para `/en/` hoje seria publicar um
 * 404 — ver a regra 3 do AGENTS.md. Quando a tradução entrar, o único ajuste é
 * virar a flag aqui.
 *
 * A ordem dos prefixos segue o ADR 0003: o idioma padrão fica sem prefixo.
 */
export const LOCALES = [
  { code: 'pt-BR', short: 'PT', label: 'Português', pathPrefix: '', available: true },
  { code: 'en', short: 'EN', label: 'English', pathPrefix: '/en', available: false },
  { code: 'es', short: 'ES', label: 'Español', pathPrefix: '/es', available: false },
] as const satisfies readonly Locale[];

export const DEFAULT_LOCALE: Locale = LOCALES[0];
