export type AvatarId =
  | "vela" | "pena" | "cafe" | "oculos"
  | "folha" | "lua" | "borboleta" | "novelo"
  | "ancora" | "espelho" | "tempo" | "bussola"
  | "lacre" | "coracao" | "chave" | "mapa";

export type AvatarFamily = "objetos" | "natureza" | "conceitos" | "intimos";

export interface AvatarDef {
  id: AvatarId;
  name: string;
  family: AvatarFamily;
  bg: string;
  description: string;
  suggestedFor: string[];
}

export const AVATAR_FAMILIES: {
  id: AvatarFamily;
  label: string;
  description: string;
  avatars: AvatarId[];
}[] = [
  {
    id: "objetos",
    label: "Objetos literários",
    description: "Identificação com o hábito de ler",
    avatars: ["vela", "pena", "cafe", "oculos"],
  },
  {
    id: "natureza",
    label: "Natureza & poesia",
    description: "Leitores estéticos e contemplativos",
    avatars: ["folha", "lua", "borboleta", "novelo"],
  },
  {
    id: "conceitos",
    label: "Conceitos & símbolos",
    description: "Leitores filosóficos e interpretativos",
    avatars: ["ancora", "espelho", "tempo", "bussola"],
  },
  {
    id: "intimos",
    label: "Íntimos & pessoais",
    description: "Leitura como experiência pessoal",
    avatars: ["lacre", "coracao", "chave", "mapa"],
  },
];

export const AVATAR_DEFINITIONS: AvatarDef[] = [
  {
    id: "vela",
    name: "A Vela",
    family: "objetos",
    bg: "radial-gradient(circle at 50% 45%, #7A4A10 0%, #4A2A08 40%, #1E1208 100%)",
    description: "leitura íntima, silêncio, ritual",
    suggestedFor: ["contemplativo", "contemplativa", "introspectivo", "memorialista"],
  },
  {
    id: "pena",
    name: "A Pena",
    family: "objetos",
    bg: "radial-gradient(circle at 50% 40%, #3A5030 0%, #243420 45%, #0E180A 100%)",
    description: "escrita, anotação, refinamento",
    suggestedFor: ["poética", "ensaísta", "dramaturga"],
  },
  {
    id: "cafe",
    name: "O Café",
    family: "objetos",
    bg: "radial-gradient(circle at 50% 40%, #5A3418 0%, #361E0C 45%, #160C06 100%)",
    description: "companhia de leitura, hábito, aconchego",
    suggestedFor: ["imersivo", "emocional", "futurista"],
  },
  {
    id: "oculos",
    name: "Os Óculos",
    family: "objetos",
    bg: "radial-gradient(circle at 50% 45%, #283060 0%, #181E48 45%, #080C20 100%)",
    description: "observação, atenção, nitidez",
    suggestedFor: ["analista", "observador", "filósofo"],
  },
  {
    id: "folha",
    name: "A Folha",
    family: "natureza",
    bg: "radial-gradient(circle at 50% 40%, #703010 0%, #481E08 45%, #180A02 100%)",
    description: "leveza, passagem, mudança",
    suggestedFor: ["imersivo", "contemplativo", "contemplativa", "brasileiro"],
  },
  {
    id: "lua",
    name: "A Lua",
    family: "natureza",
    bg: "radial-gradient(circle at 60% 35%, #182060 0%, #0E1440 45%, #04080E 100%)",
    description: "noturno, ciclos, mistério",
    suggestedFor: ["sensível", "poética", "contemplativa", "cosmopolita"],
  },
  {
    id: "borboleta",
    name: "A Borboleta",
    family: "natureza",
    bg: "radial-gradient(circle at 50% 45%, #3C1E58 0%, #261238 45%, #100818 100%)",
    description: "transformação, leveza, beleza",
    suggestedFor: ["mágico", "exploradora"],
  },
  {
    id: "novelo",
    name: "O Novelo",
    family: "natureza",
    bg: "radial-gradient(circle at 50% 40%, #581828 0%, #380E1A 45%, #180408 100%)",
    description: "fios, conexões, paciência",
    suggestedFor: ["rebelde", "sombria", "dramaturga"],
  },
  {
    id: "ancora",
    name: "A Âncora",
    family: "conceitos",
    bg: "radial-gradient(circle at 50% 40%, #0E3050 0%, #082038 45%, #020810 100%)",
    description: "profundidade, estabilidade, mar",
    suggestedFor: ["épico", "rebelde", "filósofo"],
  },
  {
    id: "espelho",
    name: "O Espelho",
    family: "conceitos",
    bg: "radial-gradient(circle at 50% 40%, #403828 0%, #282018 45%, #100C06 100%)",
    description: "reflexo, autoconhecimento, clareza",
    suggestedFor: ["ensaísta", "analista", "observador"],
  },
  {
    id: "tempo",
    name: "O Tempo",
    family: "conceitos",
    bg: "radial-gradient(circle at 50% 35%, #604010 0%, #3C2808 45%, #160E02 100%)",
    description: "passagem, urgência, memória",
    suggestedFor: ["filósofo", "memorialista", "épico"],
  },
  {
    id: "bussola",
    name: "A Bússola",
    family: "conceitos",
    bg: "radial-gradient(circle at 50% 40%, #1A3820 0%, #102414 45%, #040C06 100%)",
    description: "direção, exploração, orientação",
    suggestedFor: ["observador", "futurista", "exploradora", "cosmopolita"],
  },
  {
    id: "lacre",
    name: "O Lacre",
    family: "intimos",
    bg: "radial-gradient(circle at 50% 40%, #601818 0%, #3E0E0E 45%, #160404 100%)",
    description: "segredo, cuidado, autenticidade",
    suggestedFor: ["introspectivo", "seletivo", "dramaturga", "sombria"],
  },
  {
    id: "coracao",
    name: "O Coração",
    family: "intimos",
    bg: "radial-gradient(circle at 50% 38%, #681010 0%, #420808 45%, #180202 100%)",
    description: "emoção, entrega, paixão",
    suggestedFor: ["emocional", "sensível", "imersivo"],
  },
  {
    id: "chave",
    name: "A Chave",
    family: "intimos",
    bg: "radial-gradient(circle at 45% 40%, #584010 0%, #382808 45%, #140E02 100%)",
    description: "acesso, descoberta, abertura",
    suggestedFor: ["cosmopolita", "exploradora"],
  },
  {
    id: "mapa",
    name: "O Mapa",
    family: "intimos",
    bg: "radial-gradient(circle at 50% 40%, #283818 0%, #182410 45%, #080C04 100%)",
    description: "jornada, aventura, destino",
    suggestedFor: ["exploradora", "épico", "mágico", "futurista"],
  },
];

export function getAvatarById(id: string | null | undefined): AvatarDef | undefined {
  return AVATAR_DEFINITIONS.find((a) => a.id === id);
}

export function suggestAvatarForReaderType(readerType: string): AvatarId {
  const lower = readerType.toLowerCase();
  const found = AVATAR_DEFINITIONS.find((a) => a.suggestedFor.includes(lower));
  if (found) return found.id;
  const index = Math.abs([...lower].reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 16;
  return AVATAR_DEFINITIONS[index].id;
}
