import type { Margin, BookProgress } from "../data/mockData";
import type { SpoilerPreference } from "../data/constants";

export function canUserSeeMargin(
  margin: Margin,
  spoilerPreference: SpoilerPreference,
  progress?: BookProgress
): boolean {
  if (spoilerPreference === "all") return true;

  if (spoilerPreference === "protected") {
    if (margin.spoilerLevel === "major" || margin.spoilerLevel === "ending") return false;
    if (!progress) return margin.spoilerLevel === "none";
    return isWithinProgress(margin, progress);
  }

  // progress_only
  if (!progress) return margin.spoilerLevel === "none";
  return isWithinProgress(margin, progress);
}

function isWithinProgress(margin: Margin, progress: BookProgress): boolean {
  if (margin.percent !== undefined) {
    return margin.percent <= progress.currentPercent;
  }
  if (margin.referenceType === "none") return true;
  return true;
}

export function getBlockedReason(margin: Margin, progress?: BookProgress): string {
  if (margin.spoilerLevel === "ending") {
    return "Este trecho revela o final ou uma revelação central do livro.";
  }
  if (margin.spoilerLevel === "major") {
    return "Este conteúdo contém um spoiler importante.";
  }
  if (!progress || progress.currentPercent === 0) {
    return "Você ainda não informou seu progresso neste livro.";
  }
  const percent = margin.percent ?? 100;
  return `Este conteúdo está na p. ${Math.round((percent / 100) * 500)} — além do ponto que você informou.`;
}

export function filterMarginsForUser(
  margins: Margin[],
  spoilerPreference: SpoilerPreference,
  progressMap: Record<number, BookProgress>
): Margin[] {
  return margins.filter((m) =>
    canUserSeeMargin(m, spoilerPreference, progressMap[m.bookId])
  );
}
