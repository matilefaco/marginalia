const STREAK_KEY = (uid: string) => `mg_streak_${uid}`;
const LAST_ACTIVITY_KEY = (uid: string) => `mg_last_activity_${uid}`;

export function getStreak(uid: string): number {
  return parseInt(localStorage.getItem(STREAK_KEY(uid)) ?? "0");
}

export function updateStreak(uid: string): number {
  if (!uid || uid === "user_me") return 0;
  const today = new Date().toDateString();
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY(uid));

  if (lastActivity === today) {
    return getStreak(uid);
  }

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const currentStreak = getStreak(uid);

  if (lastActivity === yesterday) {
    const newStreak = currentStreak + 1;
    localStorage.setItem(STREAK_KEY(uid), String(newStreak));
    localStorage.setItem(LAST_ACTIVITY_KEY(uid), today);
    return newStreak;
  } else {
    localStorage.setItem(STREAK_KEY(uid), "1");
    localStorage.setItem(LAST_ACTIVITY_KEY(uid), today);
    return 1;
  }
}
