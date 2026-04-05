export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function formatReference(margin: {
  referenceType: string;
  page?: number;
  chapter?: string;
  percent?: number;
}): string {
  if (margin.referenceType === "page" && margin.page) return `p. ${margin.page}`;
  if (margin.referenceType === "chapter" && margin.chapter) return `cap. ${margin.chapter}`;
  if (margin.referenceType === "percent" && margin.percent !== undefined)
    return `${margin.percent}%`;
  return "";
}

export function marginTypeLabel(type: string): string {
  const map: Record<string, string> = {
    insight: "Insight",
    theory: "Teoria",
    critique: "Crítica",
    question: "Pergunta",
    reaction: "Reação",
    favorite_quote: "Citação",
    personal_connection: "Conexão",
    symbolic_reading: "Leitura simbólica",
  };
  return map[type] || type;
}

export function progressLabel(p: {
  currentPage?: number;
  currentPercent?: number;
  currentChapter?: string;
  status: string;
}): string {
  if (p.status === "completed") return "Concluído";
  if (p.status === "wishlist") return "Quero ler";
  if (p.status === "abandoned") return "Abandonado";
  if (p.currentPercent) return `${Math.round(p.currentPercent)}%`;
  if (p.currentPage) return `p. ${p.currentPage}`;
  return "Em andamento";
}
