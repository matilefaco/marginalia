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

export const EMOJI_REACTIONS = [
  { emoji: "🖤", label: "me tocou", category: "sensível" },
  { emoji: "💥", label: "forte", category: "emocional" },
  { emoji: "🤔", label: "me fez pensar", category: "reflexivo" },
  { emoji: "✨", label: "bonito", category: "sensível" },
  { emoji: "📌", label: "quero guardar", category: "memorável" },
  { emoji: "😵", label: "impacto", category: "emocional" },
] as const;

export const REACTION_TYPES = EMOJI_REACTIONS.map((r) => r.emoji) as unknown as readonly string[];

export type EmojiReactionCategory = "sensível" | "emocional" | "reflexivo" | "memorável";

export const REACTION_CATEGORY_CONFIG: Record<EmojiReactionCategory | "default", { color: string; label: string }> = {
  emocional: { color: "#B85450", label: "🔥 Pico emocional" },
  reflexivo: { color: "#697962", label: "💭 Pico reflexivo" },
  sensível:  { color: "#AE8F7D", label: "🖤 Pico sensível" },
  memorável: { color: "#5A5A5A", label: "📌 Pico memorável" },
  default:   { color: "#BDAB9C", label: "" },
};

export const READER_ARCHETYPES = [
  {
    id: "analista",
    label: "O Analista",
    description: "Você desmonta tudo antes de aceitar qualquer coisa.",
    marginTypes: ["critique", "theory"],
  },
  {
    id: "detetive",
    label: "O Detetive",
    description: "Você lê procurando o que ninguém explicou direito.",
    marginTypes: ["question", "insight"],
  },
  {
    id: "rebelde",
    label: "O Rebelde",
    description: "Você não aceita a história do jeito que ela foi escrita.",
    marginTypes: ["critique"],
  },
  {
    id: "intenso",
    label: "O Intenso",
    description: "Quando você lê, você sente tudo mais forte.",
    marginTypes: ["reaction", "personal_connection"],
  },
  {
    id: "interpretador",
    label: "O Interpretador",
    description: "Você sempre encontra um significado além do óbvio.",
    marginTypes: ["symbolic_reading", "insight"],
  },
  {
    id: "observador",
    label: "O Observador",
    description: "Você percebe coisas que passam despercebidas.",
    marginTypes: ["personal_connection", "favorite_quote"],
  },
  {
    id: "questionador",
    label: "O Questionador",
    description: "Você não lê sem duvidar.",
    marginTypes: ["question"],
  },
  {
    id: "imersivo",
    label: "O Imersivo",
    description: "Você entra no livro e demora pra sair.",
    marginTypes: ["favorite_quote", "reaction"],
  },
  {
    id: "editor",
    label: "O Editor Mental",
    description: "Você lê como se estivesse reescrevendo.",
    marginTypes: ["symbolic_reading", "theory"],
  },
  {
    id: "teorico",
    label: "O Teórico",
    description: "Você transforma tudo em hipótese.",
    marginTypes: ["theory"],
  },
] as const;

export type ReaderArchetypeId = typeof READER_ARCHETYPES[number]["id"];

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
