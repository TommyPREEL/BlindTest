import { compareTwoStrings } from "string-similarity";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, "")      // remove parentheticals like "(feat. X)"
    .replace(/\[.*?\]/g, "")      // remove brackets like "[Remastered]"
    .replace(/[^a-z0-9\s]/g, "")  // strip punctuation
    .trim()
    .replace(/\s+/g, " ");        // collapse whitespace
}

export interface GuessScore {
  artistScore: number;
  titleScore: number;
  points: number;
}

export function scoreGuess(
  guess: string,
  correctTitle: string,
  correctArtist: string,
  timeRemaining: number,
  totalTime: number,
  animeName?: string
): GuessScore {
  const g = normalize(guess);
  const normTitle = normalize(correctTitle);
  const normArtist = normalize(correctArtist);
  const normAnime = animeName ? normalize(animeName) : null;

  if (!g) return { artistScore: 0, titleScore: 0, points: 0 };

  const titleSim = compareTwoStrings(g, normTitle);
  const artistSim = compareTwoStrings(g, normArtist);

  let effectiveTitle = titleSim;
  const effectiveArtist = artistSim;

  // Anime name counts as an alternative for the title slot
  if (normAnime) {
    const animeSim = compareTwoStrings(g, normAnime);
    effectiveTitle = Math.max(effectiveTitle, animeSim);
  }

  // Title: up to 500 pts. >= 0.85 = full, >= 0.6 = partial
  let points = 0;
  if (effectiveTitle >= 0.85) {
    points += 500;
  } else if (effectiveTitle >= 0.6) {
    points += Math.round(300 * effectiveTitle);
  }

  // Artist: up to 500 pts
  if (effectiveArtist >= 0.85) {
    points += 500;
  } else if (effectiveArtist >= 0.6) {
    points += Math.round(300 * effectiveArtist);
  }

  // Speed bonus: up to 200 pts proportional to time left
  if (points > 0) {
    const speedMultiplier = Math.max(0, timeRemaining) / totalTime;
    points += Math.round(200 * speedMultiplier);
  }

  return {
    artistScore: effectiveArtist,
    titleScore: effectiveTitle,
    points,
  };
}
