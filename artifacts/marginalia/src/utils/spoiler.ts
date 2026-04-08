import type { Margin, BookProgress } from "../data/mockData";
import type { SpoilerPreference } from "../data/constants";

export function canUserSeeMargin(
  margin: Margin,
  spoilerPreference: SpoilerPreference,
  progress?: BookProgress
): boolean {
  if (spoilerPreference === "all") return true;

  // Free reflections (no book) are always visible
  if (margin.bookId === null) return true;

  // protected: book must be in library, started, within progress, no spoiler flags
  if (!progress) return false;
  if (margin.spoilerLevel !== "none") return false;
  if (progress.currentPercent === 0 && progress.status !== "completed") return false;
  return isWithinProgress(margin, progress);
}

function isWithinProgress(margin: Margin, progress: BookProgress): boolean {
  if (progress.status === "completed") return true;
  if (margin.referenceType === "none") return true;
  if (margin.percent !== undefined) {
    return margin.percent <= progress.currentPercent;
  }
  return true;
}

export function getBlockedReason(
  margin: Margin,
  progress?: BookProgress,
  spoilerPreference?: SpoilerPreference
): string {
  if (!progress) {
    return "Você ainda não registrou este livro na sua biblioteca. Adicione-o e marque seu progresso para liberar conteúdos compatíveis.";
  }
  if (margin.spoilerLevel === "ending") {
    return "Este trecho revela o final ou uma revelação central — ocultado para preservar sua experiência.";
  }
  if (margin.spoilerLevel === "major") {
    return "Este conteúdo contém um spoiler importante do livro.";
  }
  if (margin.spoilerLevel === "light" && spoilerPreference === "protected") {
    return "No modo protegido, spoilers leves também são ocultados automaticamente.";
  }
  if (progress.currentPercent === 0) {
    return "Você ainda não iniciou este livro. Marque seu progresso para liberar conteúdos compatíveis.";
  }
  const percent = margin.percent ?? 100;
  return `Este conteúdo está em ${percent}% do livro — além dos seus ${Math.round(progress.currentPercent)}% atuais.`;
}

export function filterMarginsForUser(
  margins: Margin[],
  spoilerPreference: SpoilerPreference,
  progressMap: Record<number, BookProgress>
): Margin[] {
  return margins.filter((m) =>
    canUserSeeMargin(m, spoilerPreference, m.bookId !== null ? progressMap[m.bookId] : undefined)
  );
}
