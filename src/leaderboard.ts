export type LeaderboardEntry = {
  attempts: number;
  elapsedSeconds: number;
  length: number;
  base: number;
};

const STORAGE_KEY = 'bulls-and-cows-leaderboard';
const MAX_RESULTS = 10;

export function sortLeaderboard(
  entries: LeaderboardEntry[],
): LeaderboardEntry[] {
  return [...entries]
    .sort(
      (first, second) =>
        first.attempts - second.attempts ||
        first.elapsedSeconds - second.elapsedSeconds,
    )
    .slice(0, MAX_RESULTS);
}

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const validEntries = parsed.filter(
      (entry): entry is LeaderboardEntry =>
        typeof entry === 'object' &&
        entry !== null &&
        Number.isInteger(entry.attempts) &&
        entry.attempts > 0 &&
        Number.isFinite(entry.elapsedSeconds) &&
        entry.elapsedSeconds >= 0 &&
        Number.isInteger(entry.length) &&
        entry.length >= 2 &&
        entry.length <= 6 &&
        [2, 8, 10, 16].includes(entry.base) &&
        entry.length <= entry.base,
    );

    return sortLeaderboard(validEntries);
  } catch {
    return [];
  }
}

export function saveLeaderboard(entry: LeaderboardEntry): LeaderboardEntry[] {
  const updated = sortLeaderboard([...loadLeaderboard(), entry]);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // The game remains playable if storage is unavailable.
  }

  return updated;
}
