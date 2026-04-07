import type { Margin, BookProgress } from "./mockData";

export interface Arquetipo {
  id: string;
  numero: string;
  nome: string;
  frase: string;
  tracos: string[];
  cor: string;
  corTexto: string;
  corAccent: string;
  corTraco: string;
  textura: "dots" | "wave" | "cross" | "grain" | "lines";
  marginTypes: string[];
}

export const ARQUETIPOS: Arquetipo[] = [
  {
    id: "observador",
    numero: "01",
    nome: "O Observador",
    frase: "Você percebe o que ninguém disse.",
    tracos: ["silêncio", "atenção", "precisão"],
    cor: "#2C2C3E",
    corTexto: "#E8E8F4",
    corAccent: "#A8A8C8",
    corTraco: "#7878A8",
    textura: "dots",
    marginTypes: ["insight"],
  },
  {
    id: "sensivel",
    numero: "02",
    nome: "O Sensível",
    frase: "Você sente antes de entender.",
    tracos: ["emoção", "instinto", "pele"],
    cor: "#3D2630",
    corTexto: "#F4E0E4",
    corAccent: "#C8909A",
    corTraco: "#A86878",
    textura: "wave",
    marginTypes: ["reaction", "favorite_quote"],
  },
  {
    id: "analitico",
    numero: "03",
    nome: "O Analítico",
    frase: "Você desmonta o texto.",
    tracos: ["estrutura", "lógica", "padrão"],
    cor: "#1E2E3A",
    corTexto: "#D8ECF8",
    corAccent: "#7AA8C8",
    corTraco: "#5888A8",
    textura: "cross",
    marginTypes: ["theory", "critique", "question"],
  },
  {
    id: "intenso",
    numero: "04",
    nome: "O Intenso",
    frase: "Você vive o livro.",
    tracos: ["fogo", "visceral", "total"],
    cor: "#3A1E1A",
    corTexto: "#F4DED8",
    corAccent: "#D4826A",
    corTraco: "#B46050",
    textura: "grain",
    marginTypes: ["reaction", "personal_connection"],
  },
  {
    id: "contemplativo",
    numero: "05",
    nome: "O Contemplativo",
    frase: "Você lê devagar — e sente mais.",
    tracos: ["silvo", "tempo", "raiz"],
    cor: "#1E2A22",
    corTexto: "#D8ECD8",
    corAccent: "#7AA888",
    corTraco: "#5A8A68",
    textura: "dots",
    marginTypes: ["symbolic_reading", "personal_connection"],
  },
  {
    id: "conector",
    numero: "06",
    nome: "O Conector",
    frase: "Tudo te lembra alguma coisa.",
    tracos: ["memória", "elo", "eco"],
    cor: "#2A2218",
    corTexto: "#F4ECD4",
    corAccent: "#C8A870",
    corTraco: "#A88850",
    textura: "lines",
    marginTypes: ["personal_connection", "favorite_quote"],
  },
  {
    id: "interpretador",
    numero: "07",
    nome: "O Interpretador",
    frase: "Você transforma leitura em significado.",
    tracos: ["símbolo", "sentido", "camadas"],
    cor: "#261E30",
    corTexto: "#E8DCF4",
    corAccent: "#A888C8",
    corTraco: "#8868A8",
    textura: "cross",
    marginTypes: ["symbolic_reading", "insight"],
  },
  {
    id: "imersivo",
    numero: "08",
    nome: "O Imersivo",
    frase: "Você desaparece dentro da história.",
    tracos: ["fundo", "oceano", "perda"],
    cor: "#1A2830",
    corTexto: "#D4ECF4",
    corAccent: "#6AB4C8",
    corTraco: "#4A94A8",
    textura: "wave",
    marginTypes: ["reaction", "favorite_quote"],
  },
  {
    id: "curioso",
    numero: "09",
    nome: "O Curioso",
    frase: "Você quer entender tudo.",
    tracos: ["pergunta", "busca", "luz"],
    cor: "#302A1A",
    corTexto: "#F4ECD0",
    corAccent: "#C8B068",
    corTraco: "#A89048",
    textura: "grain",
    marginTypes: ["question", "theory"],
  },
  {
    id: "seletivo",
    numero: "10",
    nome: "O Seletivo",
    frase: "Você guarda só o que importa.",
    tracos: ["essência", "filtro", "rigor"],
    cor: "#222222",
    corTexto: "#E8E8E8",
    corAccent: "#909090",
    corTraco: "#707070",
    textura: "lines",
    marginTypes: ["favorite_quote", "insight"],
  },
  {
    id: "introspectivo",
    numero: "11",
    nome: "O Introspectivo",
    frase: "Você lê para se encontrar.",
    tracos: ["espelho", "dentro", "névoa"],
    cor: "#241E2E",
    corTexto: "#E4DCF4",
    corAccent: "#9888B8",
    corTraco: "#7868A0",
    textura: "dots",
    marginTypes: ["personal_connection", "symbolic_reading"],
  },
  {
    id: "estetico",
    numero: "12",
    nome: "O Estético",
    frase: "Você se apaixona pela forma.",
    tracos: ["beleza", "forma", "flor"],
    cor: "#2A1E28",
    corTexto: "#F4DCF0",
    corAccent: "#C888B4",
    corTraco: "#A86898",
    textura: "wave",
    marginTypes: ["favorite_quote"],
  },
];

const FRASES_COMBINADAS: Record<string, string> = {
  "observador+sensivel":          "Você percebe o que ninguém disse\ne sente o que ninguém explica.",
  "observador+analitico":         "Você vê nas entrelinhas\ne entende o que o autor escondeu.",
  "observador+intenso":           "Você nota cada detalhe\ne vive cada página como se fosse a última.",
  "observador+contemplativo":     "Você lê devagar o suficiente\npara ver o que passa despercebido.",
  "sensivel+intenso":             "Você sente antes de pensar\ne vive o livro com o corpo inteiro.",
  "sensivel+introspectivo":       "Você sente o texto na pele\ne encontra a si mesmo em cada página.",
  "sensivel+estetico":            "Você se apaixona pelas palavras\ne sente beleza onde outros veem texto.",
  "analitico+curioso":            "Você desmonta o texto\ne quer entender cada engrenagem.",
  "analitico+interpretador":      "Você enxerga a estrutura\ne transforma padrões em significado.",
  "intenso+imersivo":             "Você vive o livro inteiro\ne só respira de novo quando acaba.",
  "contemplativo+introspectivo":  "Você lê devagar\ne cada frase vira espelho.",
  "conector+interpretador":       "Tudo te lembra alguma coisa\ne você transforma conexões em sentido.",
  "curioso+analitico":            "Você quer entender tudo\ne não descansa enquanto não acha a resposta.",
  "estetico+sensivel":            "Você se apaixona pela forma\ne sente cada frase como música.",
  "imersivo+intenso":             "Você desaparece dentro da história\ne só sai completamente diferente.",
  "seletivo+observador":          "Você guarda só o que importa\ne percebe exatamente o que isso é.",
};

export function getFraseCombinada(id1: string, id2: string): string | null {
  return (
    FRASES_COMBINADAS[`${id1}+${id2}`] ??
    FRASES_COMBINADAS[`${id2}+${id1}`] ??
    null
  );
}

export interface ArquetipoResult {
  arquetipo: Arquetipo;
  score: number;
}

interface UserReadingData {
  margins: Margin[];
  progress: BookProgress[];
  userReactions: Record<string, string>;
}

export function calcularArquetipos(data: UserReadingData): ArquetipoResult[] {
  const { margins, progress, userReactions } = data;

  const typeCounts: Record<string, number> = {};
  margins.forEach((m) => {
    typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
  });
  const totalMargins = margins.length || 1;

  const completedBooks = progress.filter((p) => p.status === "completed").length;
  const readingBooks = progress.filter((p) => p.status === "reading").length;
  const totalBooks = progress.length || 1;
  const percentCompleted = completedBooks / totalBooks;

  const reactionEmojis = Object.values(userReactions);
  const intenseEmojis = ["🔥", "😭"];
  const usaEmojiIntensidade = reactionEmojis.some((e) => intenseEmojis.includes(e));
  const usaPrimeiraPessoa = margins.some((m) =>
    m.commentary?.toLowerCase().includes(" eu ") ||
    m.commentary?.toLowerCase().startsWith("eu ") ||
    m.excerpt?.toLowerCase().includes(" eu ")
  );

  const scores: Record<string, number> = {};
  ARQUETIPOS.forEach((a) => { scores[a.id] = 0; });

  const m = typeCounts;
  const t = totalMargins;

  scores.observador  += ((m.insight || 0) / t) * 40;
  scores.observador  += usaPrimeiraPessoa ? 0 : 30;
  scores.observador  += Math.min(margins.length * 2, 30);

  scores.sensivel    += ((m.reaction || 0) / t) * 35;
  scores.sensivel    += ((m.favorite_quote || 0) / t) * 25;
  scores.sensivel    += usaEmojiIntensidade ? 40 : 0;

  scores.analitico   += ((m.theory || 0) / t) * 35;
  scores.analitico   += ((m.critique || 0) / t) * 30;
  scores.analitico   += ((m.question || 0) / t) * 35;

  scores.intenso     += Math.min(margins.length * 4, 50);
  scores.intenso     += usaEmojiIntensidade ? 30 : 0;
  scores.intenso     += readingBooks > 2 ? 20 : 0;

  scores.contemplativo += percentCompleted < 0.3 ? 50 : 10;
  scores.contemplativo += ((m.symbolic_reading || 0) / t) * 30;
  scores.contemplativo += ((m.personal_connection || 0) / t) * 20;

  scores.conector    += usaPrimeiraPessoa ? 30 : 0;
  scores.conector    += ((m.personal_connection || 0) / t) * 50;
  scores.conector    += ((m.favorite_quote || 0) / t) * 20;

  scores.interpretador += ((m.symbolic_reading || 0) / t) * 60;
  scores.interpretador += ((m.insight || 0) / t) * 40;

  scores.imersivo    += percentCompleted > 0.5 ? 50 : 10;
  scores.imersivo    += ((m.favorite_quote || 0) / t) * 30;
  scores.imersivo    += completedBooks > 3 ? 20 : 0;

  scores.curioso     += ((m.question || 0) / t) * 50;
  scores.curioso     += ((m.theory || 0) / t) * 30;
  scores.curioso     += ((m.insight || 0) / t) * 20;

  scores.seletivo    += margins.length < 10 ? 40 : 0;
  scores.seletivo    += ((m.favorite_quote || 0) / t) * 35;
  scores.seletivo    += ((m.insight || 0) / t) * 25;

  scores.introspectivo += usaPrimeiraPessoa ? 50 : 0;
  scores.introspectivo += ((m.personal_connection || 0) / t) * 50;

  scores.estetico    += ((m.favorite_quote || 0) / t) * 60;
  scores.estetico    += reactionEmojis.filter((e) => e === "✨").length * 10;

  const maxScore = Math.max(...Object.values(scores), 1);
  const normalized: Record<string, number> = {};
  Object.keys(scores).forEach((k) => {
    normalized[k] = Math.round((scores[k] / maxScore) * 100);
  });

  return Object.entries(normalized)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id, score]) => ({
      arquetipo: ARQUETIPOS.find((a) => a.id === id)!,
      score,
    }));
}

export const DNA_TRAITS = [
  {
    id: "sensivel",
    label: "Sensível",
    archetipoIds: ["sensivel", "introspectivo", "estetico", "contemplativo"],
  },
  {
    id: "analitico",
    label: "Analítico",
    archetipoIds: ["analitico", "observador", "interpretador", "curioso"],
  },
  {
    id: "intenso",
    label: "Intenso",
    archetipoIds: ["intenso", "imersivo", "conector"],
  },
  {
    id: "curioso",
    label: "Curioso",
    archetipoIds: ["curioso", "analitico", "seletivo"],
  },
] as const;

export function calcularDnaTrait(
  traitArchetypeIds: readonly string[],
  topArquetipos: ArquetipoResult[]
): number {
  const relevant = topArquetipos.filter((r) =>
    traitArchetypeIds.includes(r.arquetipo.id)
  );
  if (relevant.length === 0) return 0;
  return Math.round(relevant.reduce((acc, r) => acc + r.score, 0) / relevant.length);
}

export function getTexturaStyle(textura: Arquetipo["textura"]): string {
  switch (textura) {
    case "dots":
      return "radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)";
    case "wave":
      return "radial-gradient(ellipse 60% 20% at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 100%)";
    case "cross":
      return "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 0, transparent 50%)";
    case "grain":
      return "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)";
    case "lines":
      return "repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(255,255,255,0.06) 18px, rgba(255,255,255,0.06) 19px)";
  }
}
