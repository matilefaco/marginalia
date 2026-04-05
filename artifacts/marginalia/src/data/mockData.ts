import type { SpoilerPreference, MarginType, SpoilerLevel, Visibility } from "./constants";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  username: string;
  city: string;
  email: string;
  bio: string;
  initials: string;
  preferredGenres: string[];
  spoilerPreference: SpoilerPreference;
  favoriteAuthors: string[];
  readingSignature: string;
  compatibilityScore?: number;
  stats: {
    booksRead: number;
    totalMargins: number;
    totalHighlights: number;
    debates: number;
  };
}

export interface Book {
  id: number;
  title: string;
  author: string;
  genres: string[];
  totalPages: number;
  totalChapters: number;
  description: string;
  communityStats: {
    activeReaders: number;
    totalMargins: number;
    debates: number;
    savedBy: number;
  };
  trendingScore: number;
}

export interface BookProgress {
  id: string;
  userId: string;
  bookId: number;
  status: "reading" | "completed" | "wishlist" | "abandoned" | "favorite";
  currentPage: number;
  currentChapter: string;
  currentPercent: number;
  lastOpenedAt: string;
}

export interface Margin {
  id: number;
  userId: string;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  excerpt: string;
  referenceType: "page" | "chapter" | "percent" | "none";
  page?: number;
  chapter?: string;
  percent?: number;
  postType: MarginType;
  commentary: string;
  spoilerLevel: SpoilerLevel;
  visibility: Visibility;
  reactions: Record<string, number>;
  commentsCount: number;
  createdAt: string;
  userName: string;
  userInitials: string;
}

export interface Comment {
  id: number;
  postId: number;
  userId: string;
  userName: string;
  userInitials: string;
  body: string;
  spoilerLevel: SpoilerLevel;
  createdAt: string;
}

export interface Collection {
  id: number;
  title: string;
  description: string;
  marginIds: number[];
  isPublic: boolean;
  isEditorial?: boolean;
}

export interface Notification {
  id: number;
  userId: string;
  type: "reaction" | "comment" | "echo_unlocked" | "debate" | "follow";
  body: string;
  isRead: boolean;
  createdAt: string;
}

export const MOCK_BOOKS: Book[] = [
  {
    id: 1,
    title: "A Hora da Estrela",
    author: "Clarice Lispector",
    genres: ["Romance literário", "Literatura brasileira"],
    totalPages: 144,
    totalChapters: 10,
    description: "A história de Macabéa, uma nordestina ingênua que tenta sobreviver no Rio de Janeiro.",
    communityStats: { activeReaders: 347, totalMargins: 892, debates: 64, savedBy: 1203 },
    trendingScore: 0.95,
  },
  {
    id: 2,
    title: "Grande Sertão: Veredas",
    author: "João Guimarães Rosa",
    genres: ["Romance literário", "Literatura brasileira", "Clássicos"],
    totalPages: 624,
    totalChapters: 1,
    description: "O monólogo de Riobaldo, um ex-jagunço que reflete sobre sua vida e sobre um pacto com o diabo.",
    communityStats: { activeReaders: 189, totalMargins: 543, debates: 91, savedBy: 876 },
    trendingScore: 0.88,
  },
  {
    id: 3,
    title: "Middlemarch",
    author: "George Eliot",
    genres: ["Romance literário", "Clássicos", "Literatura estrangeira"],
    totalPages: 880,
    totalChapters: 86,
    description: "Um retrato magistral de uma cidade inglesa do século XIX.",
    communityStats: { activeReaders: 213, totalMargins: 1104, debates: 87, savedBy: 2341 },
    trendingScore: 0.82,
  },
  {
    id: 4,
    title: "O Processo",
    author: "Franz Kafka",
    genres: ["Clássicos", "Ficção contemporânea", "Literatura estrangeira"],
    totalPages: 228,
    totalChapters: 12,
    description: "Josef K. é preso numa manhã sem razão aparente.",
    communityStats: { activeReaders: 156, totalMargins: 421, debates: 55, savedBy: 987 },
    trendingScore: 0.79,
  },
  {
    id: 5,
    title: "Memórias Póstumas de Brás Cubas",
    author: "Machado de Assis",
    genres: ["Romance literário", "Literatura brasileira", "Clássicos"],
    totalPages: 208,
    totalChapters: 160,
    description: "Narrado por um defunto autor, Brás Cubas conta sua vida sem piedade.",
    communityStats: { activeReaders: 278, totalMargins: 763, debates: 72, savedBy: 1567 },
    trendingScore: 0.91,
  },
  {
    id: 6,
    title: "Dom Casmurro",
    author: "Machado de Assis",
    genres: ["Romance literário", "Literatura brasileira", "Clássicos"],
    totalPages: 256,
    totalChapters: 148,
    description: "Bentinho e Capitu: uma história de amor e ciúme.",
    communityStats: { activeReaders: 412, totalMargins: 1089, debates: 134, savedBy: 2890 },
    trendingScore: 0.97,
  },
  {
    id: 7,
    title: "Água Viva",
    author: "Clarice Lispector",
    genres: ["Romance literário", "Literatura brasileira", "Poesia"],
    totalPages: 96,
    totalChapters: 0,
    description: "Um texto poético e experimental sobre o instante vivo.",
    communityStats: { activeReaders: 98, totalMargins: 287, debates: 19, savedBy: 543 },
    trendingScore: 0.71,
  },
];

export const MOCK_PROGRESS: BookProgress[] = [
  {
    id: "p1",
    userId: "user_me",
    bookId: 1,
    status: "reading",
    currentPage: 87,
    currentChapter: "IX",
    currentPercent: 60,
    lastOpenedAt: "2026-04-05T19:00:00Z",
  },
  {
    id: "p2",
    userId: "user_me",
    bookId: 2,
    status: "reading",
    currentPage: 142,
    currentChapter: "III",
    currentPercent: 23,
    lastOpenedAt: "2026-04-03T14:00:00Z",
  },
  {
    id: "p3",
    userId: "user_me",
    bookId: 3,
    status: "reading",
    currentPage: 542,
    currentChapter: "XLII",
    currentPercent: 67,
    lastOpenedAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "p4",
    userId: "user_me",
    bookId: 4,
    status: "wishlist",
    currentPage: 0,
    currentChapter: "",
    currentPercent: 0,
    lastOpenedAt: "",
  },
  {
    id: "p5",
    userId: "user_me",
    bookId: 5,
    status: "completed",
    currentPage: 208,
    currentChapter: "CLX",
    currentPercent: 100,
    lastOpenedAt: "2026-03-15T21:00:00Z",
  },
];

export const MOCK_MARGINS: Margin[] = [
  {
    id: 1,
    userId: "user_ana",
    bookId: 1,
    bookTitle: "A Hora da Estrela",
    bookAuthor: "Clarice Lispector",
    excerpt: "Macabéa era tão discreta que nem ela mesma sabia que existia.",
    referenceType: "chapter",
    chapter: "IX",
    percent: 60,
    postType: "insight",
    commentary: "A invisibilidade como forma de existência. Clarice encontra a solidão mais absoluta — e faz dela arte.",
    spoilerLevel: "none",
    visibility: "public",
    reactions: { "Isso mudou minha visão": 4, "Me atravessou": 3, "Me identifiquei profundamente": 12 },
    commentsCount: 5,
    createdAt: "2026-04-04T10:30:00Z",
    userName: "Ana Clara",
    userInitials: "AC",
  },
  {
    id: 2,
    userId: "user_rafael",
    bookId: 1,
    bookTitle: "A Hora da Estrela",
    bookAuthor: "Clarice Lispector",
    excerpt: "Ela era irreal como um pensamento, e real como um fato.",
    referenceType: "chapter",
    chapter: "V",
    percent: 35,
    postType: "reaction",
    commentary: "Que paradoxo brutal. Clarice consegue fazer o impossível caber numa frase.",
    spoilerLevel: "none",
    visibility: "public",
    reactions: { "Belo demais": 6, "Preciso pensar mais nisso": 3 },
    commentsCount: 3,
    createdAt: "2026-04-03T15:00:00Z",
    userName: "Rafael M.",
    userInitials: "RM",
  },
  {
    id: 3,
    userId: "user_ana",
    bookId: 1,
    bookTitle: "A Hora da Estrela",
    bookAuthor: "Clarice Lispector",
    excerpt: "Quero escrever movimento puro. A passagem de um dia para outro.",
    referenceType: "chapter",
    chapter: "III",
    percent: 20,
    postType: "favorite_quote",
    commentary: "Essa frase define a missão estética de Clarice inteira.",
    spoilerLevel: "none",
    visibility: "public",
    reactions: { "Belo demais": 9, "Isso abriu uma teoria": 2 },
    commentsCount: 1,
    createdAt: "2026-04-02T08:00:00Z",
    userName: "Ana Clara",
    userInitials: "AC",
  },
  {
    id: 4,
    userId: "user_bianca",
    bookId: 2,
    bookTitle: "Grande Sertão: Veredas",
    bookAuthor: "João Guimarães Rosa",
    excerpt: "O sertão está em todo lugar.",
    referenceType: "page",
    page: 23,
    percent: 4,
    postType: "symbolic_reading",
    commentary: "Nonada. Rosa inaugura a obra com uma declaração que transcende o regionalismo — o sertão é uma condição metafísica.",
    spoilerLevel: "none",
    visibility: "public",
    reactions: { "Isso mudou minha visão": 5, "Isso abriu uma teoria": 8 },
    commentsCount: 4,
    createdAt: "2026-04-04T14:00:00Z",
    userName: "Bianca S.",
    userInitials: "BS",
  },
  {
    id: 5,
    userId: "user_me",
    bookId: 2,
    bookTitle: "Grande Sertão: Veredas",
    bookAuthor: "João Guimarães Rosa",
    excerpt: "Minha vida não era uma coisa acontecida — era uma coisa acontecendo.",
    referenceType: "chapter",
    chapter: "III",
    percent: 20,
    postType: "insight",
    commentary: "Rosa trata o passado como presente. O narrador existe num eterno gerúndio.",
    spoilerLevel: "none",
    visibility: "public",
    reactions: { "Belo demais": 3, "Me atravessou": 7 },
    commentsCount: 2,
    createdAt: "2026-04-01T11:00:00Z",
    userName: "Leitor",
    userInitials: "LT",
  },
  {
    id: 6,
    userId: "user_julia",
    bookId: 3,
    bookTitle: "Middlemarch",
    bookAuthor: "George Eliot",
    excerpt: "If we had a keen vision of all that is ordinary in human life, it would be like hearing the grass grow and the squirrel's heart beat.",
    referenceType: "percent",
    percent: 67,
    postType: "favorite_quote",
    commentary: "George Eliot define aqui a missão da grande literatura. Essa frase me acompanha.",
    spoilerLevel: "none",
    visibility: "public",
    reactions: { "Belo demais": 11, "Isso mudou minha visão": 4, "Quero reler esse trecho": 6 },
    commentsCount: 8,
    createdAt: "2026-04-03T09:00:00Z",
    userName: "Julia S.",
    userInitials: "JS",
  },
  {
    id: 7,
    userId: "user_rafael",
    bookId: 6,
    bookTitle: "Dom Casmurro",
    bookAuthor: "Machado de Assis",
    excerpt: "Era Capitu? Era o destino?",
    referenceType: "page",
    page: 210,
    percent: 82,
    postType: "theory",
    commentary: "Machado não resolve porque não há resolução. A ambiguidade é o ponto. Bentinho é o narrador não confiável arquetípico.",
    spoilerLevel: "major",
    visibility: "public",
    reactions: { "Isso mudou minha visão": 14, "Isso abriu uma teoria": 9 },
    commentsCount: 12,
    createdAt: "2026-04-05T08:00:00Z",
    userName: "Rafael M.",
    userInitials: "RM",
  },
  {
    id: 8,
    userId: "user_bianca",
    bookId: 5,
    bookTitle: "Memórias Póstumas de Brás Cubas",
    bookAuthor: "Machado de Assis",
    excerpt: "Ao verme que primeiro roeu as frias carnes do meu cadáver dedico como saudosa lembrança estas memórias póstumas.",
    referenceType: "chapter",
    chapter: "I",
    percent: 2,
    postType: "critique",
    commentary: "A dedicatória mais irônica da literatura brasileira. Machado estabelece o tom de tudo em três linhas.",
    spoilerLevel: "none",
    visibility: "public",
    reactions: { "Belo demais": 7, "Isso abriu uma teoria": 5 },
    commentsCount: 3,
    createdAt: "2026-04-02T16:00:00Z",
    userName: "Bianca S.",
    userInitials: "BS",
  },
];

export const MOCK_USERS: User[] = [
  {
    id: "user_me",
    firstName: "Leitor",
    lastName: "",
    name: "Leitor",
    username: "@leitor",
    city: "São Paulo",
    email: "leitor@marginalia.app",
    bio: "Leitor compulsivo de margens e anotações.",
    initials: "LT",
    preferredGenres: ["Romance literário", "Literatura brasileira", "Filosofia"],
    spoilerPreference: "progress_only",
    favoriteAuthors: ["Clarice Lispector", "João Guimarães Rosa"],
    readingSignature: "Você marca mais momentos de silêncio e perda.",
    stats: { booksRead: 12, totalMargins: 37, totalHighlights: 18, debates: 9 },
  },
  {
    id: "user_ana",
    firstName: "Ana",
    lastName: "Clara",
    name: "Ana Clara",
    username: "@anaclara",
    city: "Rio de Janeiro",
    email: "ana@example.com",
    bio: "Leitora de Clarice, Neruda e qualquer coisa que me faça chorar no metrô.",
    initials: "AC",
    preferredGenres: ["Romance literário", "Poesia", "Filosofia"],
    spoilerPreference: "progress_only",
    favoriteAuthors: ["Clarice Lispector", "Pablo Neruda"],
    readingSignature: "Você submerge nos personagens e raramente emerge.",
    compatibilityScore: 87,
    stats: { booksRead: 34, totalMargins: 156, totalHighlights: 89, debates: 23 },
  },
  {
    id: "user_rafael",
    firstName: "Rafael",
    lastName: "Mourão",
    name: "Rafael Mourão",
    username: "@rafaelm",
    city: "Belo Horizonte",
    email: "rafael@example.com",
    bio: "Teoria literária e café. Não necessariamente nessa ordem.",
    initials: "RM",
    preferredGenres: ["Clássicos", "Ficção contemporânea", "Ensaios"],
    spoilerPreference: "all",
    favoriteAuthors: ["Machado de Assis", "James Joyce"],
    readingSignature: "Você lê para argumentar. E isso é lindo.",
    compatibilityScore: 74,
    stats: { booksRead: 89, totalMargins: 312, totalHighlights: 201, debates: 78 },
  },
  {
    id: "user_julia",
    firstName: "Julia",
    lastName: "Siqueira",
    name: "Julia Siqueira",
    username: "@julias",
    city: "São Paulo",
    email: "julia@example.com",
    bio: "Ainda estou processando Middlemarch. E provavelmente sempre estarei.",
    initials: "JS",
    preferredGenres: ["Romance literário", "Clássicos", "Literatura estrangeira"],
    spoilerPreference: "protected",
    favoriteAuthors: ["George Eliot", "Virginia Woolf"],
    readingSignature: "Você lê devagar, com reverência.",
    compatibilityScore: 91,
    stats: { booksRead: 21, totalMargins: 87, totalHighlights: 54, debates: 11 },
  },
  {
    id: "user_bianca",
    firstName: "Bianca",
    lastName: "Santos",
    name: "Bianca Santos",
    username: "@biancas",
    city: "Curitiba",
    email: "bianca@example.com",
    bio: "Leitora entre gêneros. Machado me criou e Clarice me desfez.",
    initials: "BS",
    preferredGenres: ["Literatura brasileira", "Clássicos", "Feminismo"],
    spoilerPreference: "progress_only",
    favoriteAuthors: ["Machado de Assis", "Carolina Maria de Jesus"],
    readingSignature: "Você subverte enquanto lê.",
    compatibilityScore: 82,
    stats: { booksRead: 56, totalMargins: 189, totalHighlights: 112, debates: 34 },
  },
];

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: 1,
    title: "Livros que devastaram leitores esta semana",
    description: "Margens que pararam leitores no meio da página.",
    marginIds: [1, 2, 4, 6],
    isPublic: true,
    isEditorial: true,
  },
  {
    id: 2,
    title: "Trechos mais sublinhados",
    description: "O que a comunidade não consegue deixar passar.",
    marginIds: [3, 5, 8],
    isPublic: true,
    isEditorial: true,
  },
  {
    id: 3,
    title: "Frases que fizeram leitores parar",
    description: "Quando o livro te força a fechar e respirar.",
    marginIds: [6, 1, 7],
    isPublic: true,
    isEditorial: true,
  },
  {
    id: 4,
    title: "Leituras para quem amou Clarice",
    description: "Se Lispector te fisgou, essas vozes vão te completar.",
    marginIds: [3, 5],
    isPublic: true,
    isEditorial: true,
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    userId: "user_me",
    type: "reaction",
    body: "Ana Clara reagiu à sua margem em Grande Sertão: Veredas",
    isRead: false,
    createdAt: "2026-04-05T18:00:00Z",
  },
  {
    id: 2,
    userId: "user_me",
    type: "echo_unlocked",
    body: "3 novos ecos liberados em A Hora da Estrela dentro do seu progresso",
    isRead: false,
    createdAt: "2026-04-05T12:00:00Z",
  },
  {
    id: 3,
    userId: "user_me",
    type: "comment",
    body: "Rafael M. respondeu no debate sobre Grande Sertão",
    isRead: true,
    createdAt: "2026-04-04T09:00:00Z",
  },
  {
    id: 4,
    userId: "user_me",
    type: "reaction",
    body: "Julia S. salvou sua margem sobre Middlemarch",
    isRead: true,
    createdAt: "2026-04-03T16:00:00Z",
  },
];
