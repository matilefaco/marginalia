export const GENRES = [
  "Romance literário",
  "Clássicos",
  "Ficção contemporânea",
  "Poesia",
  "Filosofia",
  "Drama",
  "Fantasia",
  "Ficção científica",
  "Terror",
  "Não ficção",
  "Biografia",
  "Ensaios",
  "Feminismo",
  "Psicanálise",
  "Espiritualidade",
  "Literatura brasileira",
  "Literatura estrangeira",
  "Outros",
] as const;

export const SPOILER_PREFERENCES = [
  {
    id: "all",
    label: "Ver tudo",
    description: "Veja todo o conteúdo público, inclusive trechos e discussões além do seu progresso.",
  },
  {
    id: "progress_only",
    label: "Ver só o que eu já li",
    description: "Mostrar apenas conteúdos dentro do meu progresso informado.",
  },
  {
    id: "protected",
    label: "Modo protegido",
    description: "Ocultar automaticamente conteúdos potencialmente sensíveis até eu liberar.",
  },
] as const;

export type SpoilerPreference = "all" | "progress_only" | "protected";

export const MARGIN_TYPES = [
  { id: "insight", label: "Insight", icon: "💡" },
  { id: "theory", label: "Teoria", icon: "🔭" },
  { id: "critique", label: "Crítica", icon: "⚡" },
  { id: "question", label: "Pergunta", icon: "❓" },
  { id: "reaction", label: "Reação", icon: "💭" },
  { id: "favorite_quote", label: "Citação favorita", icon: "✦" },
  { id: "personal_connection", label: "Conexão pessoal", icon: "◎" },
  { id: "symbolic_reading", label: "Leitura simbólica", icon: "⌖" },
] as const;

export type MarginType = typeof MARGIN_TYPES[number]["id"];

export const SPOILER_LEVELS = [
  { id: "none", label: "Sem spoiler" },
  { id: "light", label: "Spoiler leve" },
  { id: "major", label: "Spoiler importante" },
  { id: "ending", label: "Final / revelação central" },
] as const;

export type SpoilerLevel = "none" | "light" | "major" | "ending";

export const VISIBILITY_OPTIONS = [
  { id: "public", label: "Pública" },
  { id: "friends", label: "Só amigos" },
  { id: "private", label: "Privada" },
] as const;

export type Visibility = "public" | "friends" | "private";

export const REACTION_TYPES = [
  "Isso mudou minha visão",
  "Me atravessou",
  "Belo demais",
  "Preciso pensar mais nisso",
  "Me identifiquei profundamente",
  "Quero reler esse trecho",
  "Discordo, mas amei ler",
  "Isso abriu uma teoria",
] as const;

export type ReactionType = typeof REACTION_TYPES[number];

export const LIBRARY_STATUSES = [
  { id: "all", label: "Todos" },
  { id: "reading", label: "Lendo" },
  { id: "completed", label: "Concluídos" },
  { id: "wishlist", label: "Quero ler" },
  { id: "abandoned", label: "Abandonados" },
  { id: "favorite", label: "Favoritos" },
] as const;

export const REFERENCE_TYPES = [
  { id: "page", label: "Página" },
  { id: "chapter", label: "Capítulo" },
  { id: "percent", label: "Porcentagem" },
  { id: "none", label: "Sem referência exata" },
] as const;
