/**
 * Marginalia Community Seed Script
 * Run with: pnpm --filter @workspace/api-server run seed
 *
 * Creates: 25 community users · 40+ books · 180+ margins · 400+ comments/replies
 */

import "dotenv/config";
import { db, communityUsersTable, communityBooksTable, communityMarginsTable, communityRepliesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

// ── Helpers ────────────────────────────────────────────────────────────────────

function daysAgo(n: number, hourOffset = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours((hourOffset + Math.floor(Math.random() * 14)) % 23, Math.floor(Math.random() * 59));
  return d;
}

function pick<T>(arr: readonly T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rnd(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function makeReactions(intensity: "quiet" | "medium" | "loud"): Record<string, number> {
  const emojis = ["🤍", "😭", "🤔", "🔥", "✨", "😮"];
  const counts = { quiet: [1, 4], medium: [3, 12], loud: [10, 35] }[intensity];
  const result: Record<string, number> = {};
  const n = intensity === "quiet" ? rnd(1, 2) : intensity === "medium" ? rnd(2, 4) : rnd(3, 5);
  const chosen = [...emojis].sort(() => Math.random() - 0.5).slice(0, n);
  for (const e of chosen) result[e] = rnd(counts[0], counts[1]);
  return result;
}

// ── Seed Users ─────────────────────────────────────────────────────────────────

const SEED_USERS = [
  { seedId: "s_clara", username: "claramonteiro", fullName: "Clara Monteiro", initials: "CM", bio: "Leio Clarice de madrugada e anoto tudo. Poesia é meu idioma primeiro.", city: "Rio de Janeiro", avatarColor: "#AE8F7D", readerTypeTitle: "Leitora de Silêncios", readerTypeDescription: "Encontra significado no que não é dito", readingSignature: "Sublinha sem cerimônia. Anota nas margens. Relê o final antes de chegar nele.", preferredGenres: ["Poesia", "Literatura brasileira", "Ficção contemporânea"] },
  { seedId: "s_pedro", username: "pedroafonso", fullName: "Pedro Afonso", initials: "PA", bio: "Dostoiévski, Camus e um café forte. Clássicos e filosofia são meu território.", city: "São Paulo", avatarColor: "#697962", readerTypeTitle: "Leitor de Abismos", readerTypeDescription: "Vai fundo onde outros ficam na superfície", readingSignature: "Lê devagar e grifado. Debate com o autor nas margens.", preferredGenres: ["Clássicos", "Filosofia", "Drama"] },
  { seedId: "s_luna", username: "lunacampos", fullName: "Luna Campos", initials: "LC", bio: "Fantasia e ficção científica. Mundos inventados me ensinam sobre o real.", city: "Belo Horizonte", avatarColor: "#8A9E8C", readerTypeTitle: "Exploradora de Mundos", readerTypeDescription: "Encontra o possível no impossível", readingSignature: "Anota timelines, desenha mapas dos mundos que lê.", preferredGenres: ["Fantasia", "Ficção científica", "Terror"] },
  { seedId: "s_isabel", username: "isabelrocha", fullName: "Isabel Rocha", initials: "IR", bio: "Ensaio, feminismo, psicanálise e as coisas que me formaram como leitora e como pessoa.", city: "Porto Alegre", avatarColor: "#C9A99A", readerTypeTitle: "Leitora Política", readerTypeDescription: "Nunca lê sem contexto histórico", readingSignature: "Conecta textos entre si. Lê teoria como quem lê poesia.", preferredGenres: ["Ensaio", "Não ficção", "Filosofia"] },
  { seedId: "s_rafael", username: "rafaellima_le", fullName: "Rafael Lima", initials: "RL", bio: "Literatura brasileira, drama e tudo que fala de Nordeste e de resistência.", city: "Recife", avatarColor: "#454545", readerTypeTitle: "Leitor de Raízes", readerTypeDescription: "Busca a identidade brasileira nas páginas", readingSignature: "Lê em voz alta os trechos que mais gosta.", preferredGenres: ["Literatura brasileira", "Drama", "Não ficção"] },
  { seedId: "s_mariana", username: "marianavaz_le", fullName: "Mariana Vaz", initials: "MV", bio: "Ficção contemporânea, romance e os autores que me fizeram amar ler de novo.", city: "Salvador", avatarColor: "#BDAB9C", readerTypeTitle: "Leitora Sentimental", readerTypeDescription: "Sente tudo que lê, não se desculpa por isso", readingSignature: "Marca os trechos que a fazem chorar — são muitos.", preferredGenres: ["Ficção contemporânea", "Romance literário", "Literatura estrangeira"] },
  { seedId: "s_thiago", username: "thiagoandrade_le", fullName: "Thiago Andrade", initials: "TA", bio: "Não ficção, biografia e ciência. Lembro que livros existiam antes de serem produtos.", city: "Brasília", avatarColor: "#697962", readerTypeTitle: "Leitor Analítico", readerTypeDescription: "Questiona cada argumento antes de aceitar", readingSignature: "Faz anotações estruturadas. Cria índices no final do livro.", preferredGenres: ["Não ficção", "Biografia", "Ensaio"] },
  { seedId: "s_vitoria", username: "vitoriasantos_le", fullName: "Vitória Santos", initials: "VS", bio: "Terror e horror me fascinam. Não tenho medo do escuro, tenho medo do humano.", city: "Florianópolis", avatarColor: "#2A2A2A", readerTypeTitle: "Leitora Noturna", readerTypeDescription: "Habita os gêneros que os outros evitam", readingSignature: "Lê à meia-noite com fones. Os trechos mais assustadores, em voz alta.", preferredGenres: ["Terror", "Fantasia", "Ficção contemporânea"] },
  { seedId: "s_gabriel", username: "gabrielneto_le", fullName: "Gabriel Neto", initials: "GN", bio: "Poesia, filosofia e a convicção de que literatura é o único mapa que vale.", city: "Curitiba", avatarColor: "#AE8F7D", readerTypeTitle: "Leitor Contemplativo", readerTypeDescription: "Dá ao texto o tempo que ele merece", readingSignature: "Relê os primeiros parágrafos antes de terminar qualquer livro.", preferredGenres: ["Poesia", "Filosofia", "Clássicos"] },
  { seedId: "s_fernanda", username: "fernandamelo_le", fullName: "Fernanda Melo", initials: "FM", bio: "Literatura estrangeira e a crença de que traduções são milagres.", city: "Fortaleza", avatarColor: "#C9A99A", readerTypeTitle: "Leitora de Fronteiras", readerTypeDescription: "Lê para atravessar culturas", readingSignature: "Sempre lê a bio do autor antes e depois do livro.", preferredGenres: ["Literatura estrangeira", "Clássicos", "Ficção contemporânea"] },
  { seedId: "s_lucas", username: "lucasborges_le", fullName: "Lucas Borges", initials: "LB", bio: "Ficção científica pura e fantasia épica. Tolkien mudou minha vida aos 12 e desde então.", city: "Manaus", avatarColor: "#697962", readerTypeTitle: "Leitor de Épicos", readerTypeDescription: "Prefere mundos onde as apostas são absolutas", readingSignature: "Cria wikis pessoais dos universos que lê.", preferredGenres: ["Fantasia", "Ficção científica", "Terror"] },
  { seedId: "s_anapaula", username: "anapaulacosta_le", fullName: "Ana Paula Costa", initials: "APC", bio: "Romance literário e drama. Personagens me parecem mais reais do que pessoas às vezes.", city: "São Paulo", avatarColor: "#BDAB9C", readerTypeTitle: "Leitora de Personagens", readerTypeDescription: "Escolhe livros pelos personagens, não pelas tramas", readingSignature: "Conversa com os personagens nas margens.", preferredGenres: ["Romance literário", "Drama", "Literatura brasileira"] },
  { seedId: "s_rodrigo", username: "rodrigoferreira_le", fullName: "Rodrigo Ferreira", initials: "RF", bio: "Clássicos e história. Não existe entender o presente sem ler o passado.", city: "Rio de Janeiro", avatarColor: "#454545", readerTypeTitle: "Leitor Histórico", readerTypeDescription: "Lê com olho no contexto e na época", readingSignature: "Sempre anota o ano de publicação e o que acontecia no mundo.", preferredGenres: ["Clássicos", "Não ficção", "Biografia"] },
  { seedId: "s_camila", username: "camilapereira_le", fullName: "Camila Pereira", initials: "CP", bio: "Ficção contemporânea e feminismo. Leio para ver mulheres complexas e verdadeiras.", city: "Curitiba", avatarColor: "#AE8F7D", readerTypeTitle: "Leitora Feminista", readerTypeDescription: "Lê com atenção ao que os livros dizem sobre gênero", readingSignature: "Sublinha toda vez que uma mulher diz não e é ouvida.", preferredGenres: ["Ficção contemporânea", "Ensaio", "Romance literário"] },
  { seedId: "s_diego", username: "diegomartins_le", fullName: "Diego Martins", initials: "DM", bio: "Ensaio e crítica literária. Leio como leitor e como estudante da forma.", city: "Porto Alegre", avatarColor: "#697962", readerTypeTitle: "Leitor Crítico", readerTypeDescription: "Analisa enquanto frui. Não consegue desligar.", readingSignature: "Escreve resenhas longas que só ele vai ler.", preferredGenres: ["Ensaio", "Clássicos", "Filosofia"] },
  { seedId: "s_sofia", username: "sofiaalves_le", fullName: "Sofia Alves", initials: "SA", bio: "Poesia e literatura japonesa. Haiku e Drummond dividem minha prateleira e meu coração.", city: "São Paulo", avatarColor: "#C9A99A", readerTypeTitle: "Leitora de Instantes", readerTypeDescription: "Acredita que o brevíssimo pode conter o eterno", readingSignature: "Coleciona primeiros versos. Tem cadernos só para isso.", preferredGenres: ["Poesia", "Literatura estrangeira", "Clássicos"] },
  { seedId: "s_mateus", username: "mateusribeiro_le", fullName: "Mateus Ribeiro", initials: "MR", bio: "Literatura brasileira pura. Do Modernismo ao contemporâneo, tudo me interessa.", city: "Belo Horizonte", avatarColor: "#BDAB9C", readerTypeTitle: "Leitor Nacional", readerTypeDescription: "Acredita no Brasil através dos seus escritores", readingSignature: "Recomenda livros para estranhos em filas de banco.", preferredGenres: ["Literatura brasileira", "Poesia", "Drama"] },
  { seedId: "s_beatriz", username: "beatrizgomes_le", fullName: "Beatriz Gomes", initials: "BG", bio: "Biografia e memória. Vidas reais me ensinam mais sobre ficção do que qualquer romance.", city: "Recife", avatarColor: "#AE8F7D", readerTypeTitle: "Leitora de Vidas", readerTypeDescription: "Encontra personagens nas biografias e humanidade nas ficções", readingSignature: "Pesquisa sobre o autor enquanto lê.", preferredGenres: ["Biografia", "Não ficção", "Ensaio"] },
  { seedId: "s_henrique", username: "henriquesouza_le", fullName: "Henrique Souza", initials: "HS", bio: "Romance e aventura. Gosto de histórias que me levam longe e trazem de volta diferente.", city: "Salvador", avatarColor: "#697962", readerTypeTitle: "Leitor Aventureiro", readerTypeDescription: "Lê para escapar e para retornar transformado", readingSignature: "Anota quantas páginas leu por dia. É competitivo com ele mesmo.", preferredGenres: ["Fantasia", "Ficção científica", "Romance literário"] },
  { seedId: "s_juliana", username: "julianacastro_le", fullName: "Juliana Castro", initials: "JC", bio: "Clássicos e filosofia grega. Platão é meu vizinho espiritual.", city: "Brasília", avatarColor: "#C9A99A", readerTypeTitle: "Leitora Platônica", readerTypeDescription: "Busca a Forma de tudo que lê", readingSignature: "Lê com dicionário. Não passa por cima de nenhuma palavra desconhecida.", preferredGenres: ["Filosofia", "Clássicos", "Ensaio"] },
  { seedId: "s_arthur", username: "arthurfreitas_le", fullName: "Arthur Freitas", initials: "AF", bio: "Ficção científica e tecnologia. Fico entre Asimov e as últimas previsões da IA.", city: "Rio de Janeiro", avatarColor: "#454545", readerTypeTitle: "Leitor do Futuro", readerTypeDescription: "Usa a ficção para entender o que está vindo", readingSignature: "Googla cada referência científica nos livros que lê.", preferredGenres: ["Ficção científica", "Não ficção", "Fantasia"] },
  { seedId: "s_larissa", username: "larissacunha_le", fullName: "Larissa Cunha", initials: "LCu", bio: "Literatura brasileira e poesia. Adélia, Cora, Conceição — as escritoras que me salvaram.", city: "Florianópolis", avatarColor: "#AE8F7D", readerTypeTitle: "Leitora das Poetas", readerTypeDescription: "Lê com o corpo. Sente antes de entender.", readingSignature: "Tatua frases dos livros que ama.", preferredGenres: ["Poesia", "Literatura brasileira", "Ficção contemporânea"] },
  { seedId: "s_marcos", username: "marcosoliveira_le", fullName: "Marcos Oliveira", initials: "MOl", bio: "Terror, fantasia sombria e tudo que vive na fronteira entre o real e o impossível.", city: "São Paulo", avatarColor: "#2A2A2A", readerTypeTitle: "Leitor Sombrio", readerTypeDescription: "Prefere a beleza torta ao bonito óbvio", readingSignature: "Dobra a página dos trechos perturbadores. Tem muitas páginas dobradas.", preferredGenres: ["Terror", "Fantasia", "Ficção contemporânea"] },
  { seedId: "s_carolina", username: "carolinalima_le", fullName: "Carolina Lima", initials: "CLi", bio: "Não ficção e ciência. Leio para entender o mundo sem a proteção da metáfora.", city: "Curitiba", avatarColor: "#8A9E8C", readerTypeTitle: "Leitora Racional", readerTypeDescription: "Prefere fatos, mas se rende à ficção quando bem escrita", readingSignature: "Sempre checa as referências bibliográficas.", preferredGenres: ["Não ficção", "Ensaio", "Biografia"] },
  { seedId: "s_eduardo", username: "eduardoaraujo_le", fullName: "Eduardo Araújo", initials: "EA", bio: "Ensaio e política. Ler é um ato político e não pretendo tratar como hobbie.", city: "Fortaleza", avatarColor: "#697962", readerTypeTitle: "Leitor Engajado", readerTypeDescription: "Nunca lê sem pensar nas implicações sociais", readingSignature: "Compartilha trechos políticos às 7h da manhã.", preferredGenres: ["Ensaio", "Não ficção", "Filosofia"] },
];

// ── Book Catalog ───────────────────────────────────────────────────────────────

const BOOK_CATALOG = [
  { title: "A Paixão Segundo G.H.", author: "Clarice Lispector", genres: ["Literatura brasileira"], coverUrl: "https://covers.openlibrary.org/b/isbn/9788532920010-L.jpg", totalPages: 178, publicationYear: 1964 },
  { title: "A Hora da Estrela", author: "Clarice Lispector", genres: ["Literatura brasileira"], coverUrl: "https://covers.openlibrary.org/b/isbn/9788532900630-L.jpg", totalPages: 96, publicationYear: 1977 },
  { title: "Água Viva", author: "Clarice Lispector", genres: ["Literatura brasileira", "Poesia"], coverUrl: "https://covers.openlibrary.org/b/isbn/9788532915122-L.jpg", totalPages: 106, publicationYear: 1973 },
  { title: "Dom Casmurro", author: "Machado de Assis", genres: ["Literatura brasileira", "Clássicos"], coverUrl: "https://covers.openlibrary.org/b/isbn/9788535902006-L.jpg", totalPages: 256, publicationYear: 1899 },
  { title: "Memórias Póstumas de Brás Cubas", author: "Machado de Assis", genres: ["Literatura brasileira", "Clássicos"], coverUrl: "https://covers.openlibrary.org/b/isbn/9788573261639-L.jpg", totalPages: 218, publicationYear: 1881 },
  { title: "Grande Sertão: Veredas", author: "João Guimarães Rosa", genres: ["Literatura brasileira"], coverUrl: "https://covers.openlibrary.org/b/isbn/9788520908061-L.jpg", totalPages: 608, publicationYear: 1956 },
  { title: "Quarto de Despejo", author: "Carolina Maria de Jesus", genres: ["Literatura brasileira", "Não ficção", "Biografia"], coverUrl: "https://covers.openlibrary.org/b/isbn/9788508126439-L.jpg", totalPages: 200, publicationYear: 1960 },
  { title: "Olhos d'Água", author: "Conceição Evaristo", genres: ["Literatura brasileira", "Ficção contemporânea"], coverUrl: "https://covers.openlibrary.org/b/isbn/9788564603455-L.jpg", totalPages: 112, publicationYear: 2014 },
  { title: "Ponciá Vicêncio", author: "Conceição Evaristo", genres: ["Literatura brasileira", "Ficção contemporânea"], coverUrl: "https://covers.openlibrary.org/b/isbn/9788560427208-L.jpg", totalPages: 141, publicationYear: 2003 },
  { title: "Vidas Secas", author: "Graciliano Ramos", genres: ["Literatura brasileira", "Clássicos"], coverUrl: "https://covers.openlibrary.org/b/isbn/9788520921940-L.jpg", totalPages: 176, publicationYear: 1938 },
  { title: "O Cortiço", author: "Aluísio Azevedo", genres: ["Literatura brasileira", "Clássicos"], coverUrl: "https://covers.openlibrary.org/b/isbn/9788572326902-L.jpg", totalPages: 272, publicationYear: 1890 },
  { title: "Macunaíma", author: "Mário de Andrade", genres: ["Literatura brasileira", "Clássicos"], coverUrl: "https://covers.openlibrary.org/b/isbn/9788582850176-L.jpg", totalPages: 205, publicationYear: 1928 },
  { title: "A Rosa do Povo", author: "Carlos Drummond de Andrade", genres: ["Poesia", "Literatura brasileira"], coverUrl: "https://covers.openlibrary.org/b/isbn/9788503007238-L.jpg", totalPages: 188, publicationYear: 1945 },
  { title: "Libertinagem", author: "Manuel Bandeira", genres: ["Poesia", "Literatura brasileira"], coverUrl: "https://covers.openlibrary.org/b/isbn/9788503012171-L.jpg", totalPages: 96, publicationYear: 1930 },
  { title: "1984", author: "George Orwell", genres: ["Ficção científica", "Clássicos", "Literatura estrangeira"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg", totalPages: 328, publicationYear: 1949 },
  { title: "A Revolução dos Bichos", author: "George Orwell", genres: ["Clássicos", "Literatura estrangeira", "Ficção científica"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780451526342-L.jpg", totalPages: 112, publicationYear: 1945 },
  { title: "O Estrangeiro", author: "Albert Camus", genres: ["Filosofia", "Clássicos", "Literatura estrangeira"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780679720201-L.jpg", totalPages: 123, publicationYear: 1942 },
  { title: "A Metamorfose", author: "Franz Kafka", genres: ["Clássicos", "Literatura estrangeira"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780553213690-L.jpg", totalPages: 96, publicationYear: 1915 },
  { title: "Crime e Castigo", author: "Fiódor Dostoiévski", genres: ["Clássicos", "Literatura estrangeira", "Drama"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780140449136-L.jpg", totalPages: 671, publicationYear: 1866 },
  { title: "O Idiota", author: "Fiódor Dostoiévski", genres: ["Clássicos", "Literatura estrangeira", "Drama"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780140447927-L.jpg", totalPages: 656, publicationYear: 1869 },
  { title: "Assim Falou Zaratustra", author: "Friedrich Nietzsche", genres: ["Filosofia", "Clássicos"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780140441185-L.jpg", totalPages: 352, publicationYear: 1883 },
  { title: "O Mito de Sísifo", author: "Albert Camus", genres: ["Filosofia", "Ensaio"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780679733737-L.jpg", totalPages: 212, publicationYear: 1942 },
  { title: "Ser e Tempo", author: "Martin Heidegger", genres: ["Filosofia"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780061575594-L.jpg", totalPages: 589, publicationYear: 1927 },
  { title: "O Segundo Sexo", author: "Simone de Beauvoir", genres: ["Filosofia", "Ensaio", "Não ficção"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780679724513-L.jpg", totalPages: 832, publicationYear: 1949 },
  { title: "Cem Anos de Solidão", author: "Gabriel García Márquez", genres: ["Literatura estrangeira", "Ficção contemporânea", "Clássicos"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780060883287-L.jpg", totalPages: 422, publicationYear: 1967 },
  { title: "O Amor nos Tempos do Cólera", author: "Gabriel García Márquez", genres: ["Literatura estrangeira", "Romance literário"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780307389732-L.jpg", totalPages: 368, publicationYear: 1985 },
  { title: "Ensaio sobre a Cegueira", author: "José Saramago", genres: ["Literatura estrangeira", "Ficção contemporânea"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780156007757-L.jpg", totalPages: 352, publicationYear: 1995 },
  { title: "O Alquimista", author: "Paulo Coelho", genres: ["Ficção contemporânea", "Literatura brasileira"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg", totalPages: 197, publicationYear: 1988 },
  { title: "Frankenstein", author: "Mary Shelley", genres: ["Clássicos", "Terror", "Literatura estrangeira"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780486282114-L.jpg", totalPages: 280, publicationYear: 1818 },
  { title: "It: A Coisa", author: "Stephen King", genres: ["Terror", "Literatura estrangeira"], coverUrl: "https://covers.openlibrary.org/b/isbn/9781501156700-L.jpg", totalPages: 1138, publicationYear: 1986 },
  { title: "O Iluminado", author: "Stephen King", genres: ["Terror", "Literatura estrangeira"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780307743657-L.jpg", totalPages: 659, publicationYear: 1977 },
  { title: "Duna", author: "Frank Herbert", genres: ["Ficção científica", "Fantasia", "Literatura estrangeira"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780441013593-L.jpg", totalPages: 688, publicationYear: 1965 },
  { title: "Fundação", author: "Isaac Asimov", genres: ["Ficção científica", "Literatura estrangeira"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780553293357-L.jpg", totalPages: 255, publicationYear: 1951 },
  { title: "O Senhor dos Anéis: A Sociedade do Anel", author: "J.R.R. Tolkien", genres: ["Fantasia", "Literatura estrangeira"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780618346257-L.jpg", totalPages: 479, publicationYear: 1954 },
  { title: "Harry Potter e a Pedra Filosofal", author: "J.K. Rowling", genres: ["Fantasia", "Literatura estrangeira"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg", totalPages: 309, publicationYear: 1997 },
  { title: "Admirável Mundo Novo", author: "Aldous Huxley", genres: ["Ficção científica", "Clássicos", "Literatura estrangeira"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg", totalPages: 311, publicationYear: 1932 },
  { title: "Fahrenheit 451", author: "Ray Bradbury", genres: ["Ficção científica", "Clássicos"], coverUrl: "https://covers.openlibrary.org/b/isbn/9781451673319-L.jpg", totalPages: 256, publicationYear: 1953 },
  { title: "Sapiens: Uma Breve História da Humanidade", author: "Yuval Noah Harari", genres: ["Não ficção", "Ensaio", "Biografia"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg", totalPages: 443, publicationYear: 2011 },
  { title: "O Diário de uma Jovem Anne Frank", author: "Anne Frank", genres: ["Biografia", "Não ficção"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780553577129-L.jpg", totalPages: 283, publicationYear: 1947 },
  { title: "Morro dos Ventos Uivantes", author: "Emily Brontë", genres: ["Clássicos", "Romance literário", "Literatura estrangeira"], coverUrl: "https://covers.openlibrary.org/b/isbn/9780141439556-L.jpg", totalPages: 384, publicationYear: 1847 },
];

// ── Content Pools ──────────────────────────────────────────────────────────────

const EXCERPTS = [
  "E de repente compreendi que havia vivido do lado errado do espelho, e que o que via era apenas o reflexo de algo que não ousava olhar de frente.",
  "O silêncio era tão completo que parecia ter textura — algo que se podia tocar com as mãos, pesado como tecido molhado.",
  "Ela não queria ser feliz. Queria algo mais escuro e mais verdadeiro do que a felicidade.",
  "Toda solidão tem uma voz. Eu aprendi a ouvir a minha quando parei de ter medo dela.",
  "O passado não passa. Ele muda de endereço e reaparece quando a gente menos espera, com outra roupa e o mesmo rosto.",
  "Há mortes que não cabem no luto — são grandes demais para os rituais que inventamos para nos proteger delas.",
  "Amar é consentir em ser varrido pela corrente. Não nadar contra. Não nadar. Apenas ser água.",
  "Nomeei minha dor para não deixar que ela me nomeasse.",
  "O que é a identidade senão o conjunto de tudo que perdemos no caminho?",
  "Cada pessoa é um abismo e tonteia de olhar para dentro.",
  "A liberdade que assusta mais não é a dos outros. É a nossa própria, que não sabemos o que fazer quando a encontramos.",
  "O absurdo não está no mundo. Está na confrontação do grito humano com o silêncio irracional do mundo.",
  "Ser autêntico é o trabalho mais difícil e mais solitário que existe. É também o único que vale.",
  "Não somos seres que têm experiências. Somos as experiências que tivemos, somadas e reorganizadas a cada novo dia.",
  "A ironia é o último refúgio de quem não sabe mais chorar sem se sentir fraco.",
  "Envelhecer é aprender o nome certo para cada coisa que a infância não nomeava porque não precisava.",
  "As grandes tragédias não são causadas por maldade. São causadas por indiferença bem-intencionada.",
  "Um personagem verdadeiro te assombra. Não consegues terminá-lo. Ele termina você.",
  "O poder é uma promessa que o mundo faz quando você ainda é jovem demais para não acreditar.",
  "Magia não é controlar o mundo. É aprender que o mundo não precisa de controle — e que você tampouco.",
  "Toda profecia é uma condenação disfarçada de esperança.",
  "Ela ficou por tempo suficiente para eu aprender a sobreviver sem ela.",
  "Amor que não muda não é amor. É hábito. E hábito mata mais devagar do que traição.",
  "Não havia palavra para o que senti quando o vi pela última vez. Ainda não há.",
  "Ao fim, o que une as pessoas não é a felicidade compartilhada. É a dor que ninguém mais compreendeu.",
  "Ler um livro é encontrar alguém que sentiu o que você sentiu antes de você sentir.",
  "O escritor que não duvida de si mesmo é perigoso. A dúvida é o que mantém a literatura honesta.",
  "Fui e serei. Enquanto isso, sou. E essa ordem é a única que importa.",
  "Certa vez li que saudade é um amor sem onde ir. Concordo plenamente.",
  "Há uma diferença entre estar só e sentir-se sozinho. O segundo é mais devastador.",
  "A máquina não tem medo. E é exatamente isso que a torna perigosa — e nós, humanos, atraentes para ela.",
  "O futuro chegou. Só não está distribuído igualmente, e essa desigualdade é o verdadeiro enredo.",
  "Tinha tanto medo de perder que já havia perdido tudo antes de começar.",
  "As cidades mudam de nome quando a gente cresce. Já não é a mesma cidade que a infância habitou.",
  "Escrevo porque não sei o que dizer quando estou de frente para o que sinto.",
  "Ser feliz é não procurar o sentido de nada. Mas quem consegue não procurar?",
  "O amor não é sentimento. É ato. É escolha feita todos os dias diante do cansaço.",
  "Quando a linguagem falha, o silêncio não é ausência. É o único idioma suficientemente preciso.",
  "O que me pertence é justamente o que não pude guardar.",
  "Às vezes, a personagem mais assustadora de um livro de terror é a que acredita que está fazendo o bem.",
];

const COMMENTARY_INSIGHT = [
  "Precisei reler essa frase três vezes antes de entender o que ela estava me dizendo sobre mim mesma, não sobre a personagem.",
  "Esse parágrafo reorganizou algo que estava desmontado dentro de mim faz tempo. Não sei nomear o quê, mas mudou.",
  "Nunca um autor tinha conseguido nomear essa coisa que eu sinto e não sei explicar para ninguém.",
  "Parei aqui. Fiquei olhando para a página como se ela fosse me dar uma resposta sobre algo completamente diferente.",
  "Esse trecho é aquele tipo de coisa que você lê e pensa: como eu cheguei até aqui sem saber disso antes?",
  "A autora está falando sobre um personagem, mas parece que estava me vendo de um lugar que eu não autorizei.",
  "Esse insight não é sobre o livro. É sobre a vida. É sobre agora, exatamente agora.",
  "Fui ler isso em voz alta para uma amiga e as duas ficamos em silêncio por um tempo que não medimos.",
  "Há uma clareza nessa frase que me fez envergonhar de todas as vezes em que compliquei o óbvio.",
  "Esse é o tipo de trecho que você marca, esquece que marcou, relê meses depois e tem o coração partido de novo.",
];

const COMMENTARY_CRITIQUE = [
  "Há um conflito interessante aqui: a narrativa afirma uma coisa, mas o tom da escrita diz completamente outra.",
  "Adoro quando um autor tem a coragem de deixar uma pergunta sem resposta. Essa coragem é rara.",
  "O ritmo dessa passagem é deliberadamente desconfortável. Estou convicta de que é intencional e funciona.",
  "Essa é uma das construções mais elegantes que já li em prosa. Cada palavra parece ter chegado por necessidade.",
  "O que me impressiona não é o que está escrito, mas o que foi deliberadamente omitido. A ausência aqui é o texto.",
  "Esse capítulo poderia ser um poema. A fronteira entre prosa e poesia está completamente apagada aqui.",
  "Há uma tensão política nessa passagem que muitos leitores atravessam sem perceber. Vale parar.",
  "O autor usa a ironia com uma precisão cirúrgica que só vejo em quem sabe exatamente o que está fazendo.",
  "Esse narrador não é confiável. Sabia desde as primeiras páginas, mas aqui a máscara finalmente escorrega.",
  "Esse recurso narrativo é arriscado e funciona. A maioria dos escritores teria recuado. Que coragem.",
];

const COMMENTARY_QUESTION = [
  "Alguém mais ficou sem entender completamente esse trecho ou fui só eu? Genuinamente pergunto.",
  "Vocês acham que isso é uma metáfora explícita ou estou lendo demais nas entrelinhas?",
  "Essa personagem me desafia: ela é herói ou antagonista de si mesma? Não consigo decidir.",
  "Por que esse trecho me faz sentir culpa que eu não esperava sentir? O que está acontecendo aqui?",
  "Como um autor consegue escrever algo assim e depois seguir vivendo normalmente? Sério.",
  "Qual de vocês já releu esse capítulo mais de uma vez? Vale a pena? Quero saber antes de começar.",
  "Essa cena é sobre perdão ou sobre resignação? A diferença importa para o que vem depois.",
  "Estou tentando entender se o autor quer que eu simpatize com esse personagem ou o tema. Consigo os dois.",
  "Alguém me explica a lógica do narrador aqui? Fiquei presa nessa contradição por horas.",
  "Esse livro está me mudando e eu não sei se deveria resistir ou deixar. Vocês sentiram isso também?",
];

const COMMENTARY_REACTION = [
  "Esse trecho me destruiu. Precisei fechar o livro, sair do quarto e tomar água.",
  "Chorei. Não ia mencionar, mas chorei de um jeito que não esperava. Desculpa a confissão.",
  "Coloquei o livro na mesa, fui fazer chá, voltei, li de novo. Ainda não consigo segurar o impacto.",
  "Há páginas que ficam. Essa vai ficar comigo por muito tempo. Sinto que preciso merecê-la.",
  "Não sabia que essa quantidade de palavras podia conter tanta coisa. Me sinto pequena diante disso.",
  "Isso me alcançou num lugar que eu pensava estar bem guardado. Obrigada e odeio você um pouco.",
  "Li e tive aquela sensação de que o mundo tem mais camadas do que eu via. É assustador e bonito ao mesmo tempo.",
  "Esse livro me cansou. Me cansou do jeito que as coisas importantes cansam — porque pedem tudo.",
  "Não consigo continuar sem documentar: esse trecho é o motivo pelo qual a literatura existe.",
  "Tive que parar. Não de ler — de funcionar. Por um bom tempo.",
];

const COMMENTARY_THEORY = [
  "Minha leitura: essa personagem é uma alegoria de toda uma geração que aprendeu a sobreviver fingindo.",
  "Acredito que o autor usa essa passagem para subverter a expectativa criada nos capítulos anteriores. É intencional.",
  "Há um diálogo intertextual aqui com algo que li em outro autor. Alguém mais percebeu essa conversa?",
  "Essa narrativa não é sobre o que parece. É sobre o custo de fingir que está tudo bem quando não está.",
  "O que interessa ao autor não é o evento em si, mas o silêncio que vem depois. Sempre o silêncio.",
  "Minha teoria: o narrador está mentindo para si mesmo desde o primeiro capítulo. Essa cena confirma.",
  "Isso conversa diretamente com a cena lá atrás. O autor preparou tudo desde o começo sem aviso.",
  "Esse recurso é uma crítica disfarçada ao gênero do próprio livro. Meta e desconcertante.",
  "A estrutura do capítulo espelha o estado mental da personagem. Nada aqui é acidente.",
  "Há um arquétipo muito claro aqui que o autor está desconstruindo com cuidado. Vale atenção.",
];

const COMMENTARY_QUOTE = [
  "Essa frase é o livro inteiro condensado. Poderia ser o único trecho e ainda teria valido a leitura.",
  "Já estava esperando algo assim desde o início. Quando chegou, foi exatamente certo. Sem surpresa e ainda assim perfeito.",
  "Guardo essa frase para momentos em que preciso lembrar por que leio. Por que faço qualquer coisa.",
  "Mandei para três pessoas diferentes. Cada uma respondeu de um jeito completamente diferente. Isso é literatura.",
  "Essa vai pro meu caderno de citações. Uma das mais bonitas que já encontrei em qualquer idioma.",
  "Quando encontro uma frase assim, fico com a sensação de que o livro existia esperando por mim. Egocentrismo saudável.",
  "Existe uma generosidade em escrever algo assim. Uma oferta para o leitor guardar e usar quando precisar.",
  "Reli dez vezes. Cada vez encontrei um acento diferente. Isso é poesia em forma de prosa.",
  "Essa frase é o tipo de coisa que você escreve no espelho do banheiro e relê toda manhã por meses.",
  "Não há jeito de melhorar essa frase. Ela chegou perfeita e deve ser deixada exatamente assim.",
];

const POST_TYPES = ["insight", "critica", "pergunta", "reacao", "teoria", "citacao_favorita"] as const;
type PostType = typeof POST_TYPES[number];

const COMMENTARY_POOLS: Record<PostType, string[]> = {
  insight: COMMENTARY_INSIGHT,
  critica: COMMENTARY_CRITIQUE,
  pergunta: COMMENTARY_QUESTION,
  reacao: COMMENTARY_REACTION,
  teoria: COMMENTARY_THEORY,
  citacao_favorita: COMMENTARY_QUOTE,
};

// ── Comment Pools ──────────────────────────────────────────────────────────────

const TOP_LEVEL_COMMENTS = [
  "Eu senti exatamente isso quando cheguei nessa parte. Você colocou em palavras o que eu não conseguia.",
  "Também precisei pausar aqui. É intenso demais para passar correndo sem deixar rastro.",
  "Sua análise é perfeita. Nunca tinha olhado por esse ângulo. Vou reler com isso em mente.",
  "Vim aqui só pra dizer que concordo completamente. Obrigada por ter escrito isso.",
  "Esse trecho me destruiu também. Que bom que não fui a única. Me sinto menos frágil assim.",
  "Interessante, mas discordo. Pra mim essa passagem é mais sobre resignação do que aceitação.",
  "Sua leitura está correta, mas tem um detalhe que muda tudo: a voz narrativa aqui é deliberada.",
  "Entendo sua leitura, mas tenho uma completamente diferente. Podemos debater? Sério, quero.",
  "Complementando: acho que esse trecho também dialoga com o capítulo anterior de um jeito que não é óbvio.",
  "Concordo, mas eu iria um pouco além... o que esse trecho diz sobre o final do livro inteiro?",
  "Há outro aspecto nisso que não mencionaste: o momento histórico em que o livro foi escrito.",
  "Não esperava ler isso aqui hoje. E chorar. Mas aconteceu. Obrigada pela partilha.",
  "Juro que precisei fechar o app quando li essa parte do livro. Agora você me fez rever.",
  "Que peso esse livro carrega. Pesado de um jeito bom — do jeito que importa.",
  "Alguém me indica o próximo livro dessa autora? Agora preciso de mais urgentemente.",
  "Que leitura corajosa. Esse tipo de honestidade ao escrever um eco é raro e bonito.",
  "Obrigada por compartilhar. Esse livro subiu dez posições na minha lista.",
  "Você é a razão pela qual eu ainda acredito que comunidades online podem ser boas.",
  "Pensa também que essa cena acontece logo depois de um momento muito diferente. O contraste é tudo.",
  "Nunca tinha pensado dessa forma. Vou reler esse capítulo inteiro de novo com esse novo olhar.",
  "Esse trecho me fez parar de ler e ligar pra minha mãe. Não vou explicar mais do que isso.",
  "Há uma liberdade enorme em conseguir escrever sobre um livro assim. Você escreve muito bem.",
  "Esses ecos aqui me fazem querer criar um clube do livro só para ler esse autor com vocês.",
  "Eu sublinhei exatamente esse trecho também. Coincidências assim me fazem acreditar em algo maior.",
  "Não sei se o autor sabia o que estava criando. Às vezes os melhores não sabem.",
];

const REPLIES = [
  "Concordo com tudo que você disse aqui.",
  "Também pensei nisso! Que conexão boa.",
  "Não tinha chegado nessa leitura. Abre muito o horizonte.",
  "Isso mesmo. E ainda tem mais uma camada que você não mencionou.",
  "Exatamente o que eu ia dizer mas não soube colocar em palavras.",
  "Você me fez querer reler imediatamente.",
  "Perfeito. Não há mais o que acrescentar.",
  "Boa colocação. Discordo do detalhe, mas a essência está certa.",
  "Esse ponto muda toda minha leitura anterior. Obrigada.",
  "Havia esquecido dessa conexão. Valeu por trazer.",
  "Essa é a melhor análise que vi sobre esse livro aqui.",
  "Me salvou. Estava com a mesma dúvida e você resolveu.",
  "Incrível como duas pessoas podem ler a mesma coisa e chegar em lugares tão diferentes.",
  "Concordo mas acho que o contexto de publicação importa muito aqui também.",
];

// ── Main Seed Function ─────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Marginalia Community Seed\n");

  // 1. Seed Users
  console.log("→ Criando usuários da comunidade...");
  let insertedUsers = 0;
  for (const user of SEED_USERS) {
    try {
      await db.insert(communityUsersTable).values(user as never).onConflictDoNothing();
      insertedUsers++;
    } catch (e) {
      // skip duplicate
    }
  }
  console.log(`  ✓ ${insertedUsers} usuários criados`);

  // 2. Seed Books
  console.log("→ Inserindo catálogo de livros...");
  const insertedBookIds: number[] = [];
  for (const book of BOOK_CATALOG) {
    try {
      const existing = await db
        .select({ id: communityBooksTable.id })
        .from(communityBooksTable)
        .where(eq(communityBooksTable.title, book.title))
        .limit(1);

      if (existing.length > 0) {
        insertedBookIds.push(existing[0].id);
        continue;
      }

      const [inserted] = await db
        .insert(communityBooksTable)
        .values({ ...book, externalId: null, description: "", publisher: null, language: "pt" } as never)
        .returning({ id: communityBooksTable.id });

      if (inserted) insertedBookIds.push(inserted.id);
    } catch {}
  }
  console.log(`  ✓ ${insertedBookIds.length} livros no catálogo`);

  // Fetch all users from DB
  const dbUsers = await db.select().from(communityUsersTable);
  if (dbUsers.length === 0) { console.error("Nenhum usuário encontrado!"); return; }

  // 3. Seed Margins
  console.log("→ Gerando margens da comunidade...");
  let totalMargins = 0;
  let totalComments = 0;
  let totalReplies = 0;

  for (let bIdx = 0; bIdx < insertedBookIds.length; bIdx++) {
    const bookId = insertedBookIds[bIdx];
    const bookData = BOOK_CATALOG[bIdx];

    const existingCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(communityMarginsTable)
      .where(eq(communityMarginsTable.bookId, bookId));

    if (Number(existingCount[0]?.count ?? 0) >= 3) continue;

    const marginCount = rnd(3, 7);
    const usedUserIdx = new Set<number>();

    for (let m = 0; m < marginCount; m++) {
      let uIdx = rnd(0, dbUsers.length - 1);
      while (usedUserIdx.has(uIdx) && usedUserIdx.size < dbUsers.length) {
        uIdx = rnd(0, dbUsers.length - 1);
      }
      usedUserIdx.add(uIdx);
      const user = dbUsers[uIdx];

      const postType = pick([...POST_TYPES]);
      const commentary = pick(COMMENTARY_POOLS[postType as PostType]);
      const excerpt = pick(EXCERPTS);
      const refType = pick(["page", "chapter", "none", "none"]);
      const daysBack = rnd(1, 60);
      const intensity = pick(["quiet", "medium", "loud"] as const);

      try {
        const [margin] = await db
          .insert(communityMarginsTable)
          .values({
            userSeedId: user.seedId,
            userName: user.fullName,
            userInitials: user.initials,
            userAvatarColor: user.avatarColor,
            bookId,
            bookTitle: bookData.title,
            bookAuthor: bookData.author,
            bookCoverUrl: bookData.coverUrl ?? null,
            excerpt,
            commentary,
            postType,
            referenceType: refType,
            referencePage: refType === "page" ? rnd(10, Math.max(10, bookData.totalPages - 10)) : null,
            referenceChapter: refType === "chapter" ? `Cap. ${rnd(1, 20)}` : null,
            spoilerLevel: pick(["none", "none", "none", "light"]),
            visibility: "public",
            reactions: makeReactions(intensity),
            commentsCount: 0,
            createdAt: daysAgo(daysBack),
          } as never)
          .returning({ id: communityMarginsTable.id });

        if (!margin) continue;
        totalMargins++;

        const commentCount = rnd(1, 5);
        let marginCommentCount = 0;

        for (let c = 0; c < commentCount; c++) {
          let cIdx = rnd(0, dbUsers.length - 1);
          while (cIdx === uIdx) cIdx = rnd(0, dbUsers.length - 1);
          const commenter = dbUsers[cIdx];
          const commentIntensity = pick(["quiet", "medium"] as const);

          const [comment] = await db
            .insert(communityRepliesTable)
            .values({
              marginId: margin.id,
              userSeedId: commenter.seedId,
              userName: commenter.fullName,
              userInitials: commenter.initials,
              userAvatarColor: commenter.avatarColor,
              body: pick(TOP_LEVEL_COMMENTS),
              parentReplyId: null,
              reactions: makeReactions(commentIntensity),
              createdAt: daysAgo(daysBack - rnd(0, Math.min(daysBack - 1, 5))),
            } as never)
            .returning({ id: communityRepliesTable.id });

          marginCommentCount++;
          totalComments++;

          if (comment && Math.random() < 0.4) {
            let rIdx = rnd(0, dbUsers.length - 1);
            while (rIdx === cIdx) rIdx = rnd(0, dbUsers.length - 1);
            const replier = dbUsers[rIdx];

            await db.insert(communityRepliesTable).values({
              marginId: margin.id,
              userSeedId: replier.seedId,
              userName: replier.fullName,
              userInitials: replier.initials,
              userAvatarColor: replier.avatarColor,
              body: pick(REPLIES),
              parentReplyId: comment.id,
              reactions: makeReactions("quiet"),
              createdAt: daysAgo(Math.max(0, daysBack - rnd(0, 3))),
            } as never);

            totalReplies++;
            marginCommentCount++;
          }
        }

        await db
          .update(communityMarginsTable)
          .set({ commentsCount: marginCommentCount })
          .where(eq(communityMarginsTable.id, margin.id));

      } catch {}
    }

    await db
      .update(communityBooksTable)
      .set({ marginCount: marginCount })
      .where(eq(communityBooksTable.id, bookId));
  }

  console.log(`  ✓ ${totalMargins} margens criadas`);
  console.log(`  ✓ ${totalComments} comentários criados`);
  console.log(`  ✓ ${totalReplies} respostas criadas`);
  console.log("\n✅ Seed concluído com sucesso!");
}

seed().catch((e) => { console.error("Seed falhou:", e); process.exit(1); });
