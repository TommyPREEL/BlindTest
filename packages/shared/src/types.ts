export interface Player {
  id: string;       // socket.id
  name: string;
  score: number;
  isHost: boolean;
  connected: boolean;
}

export interface GameConfig {
  rounds: number;           // 5–20, default 10
  timePerRound: number;     // seconds 10–30, default 20
  genre: string | null;     // Spotify genre seed e.g. "pop"
  playlistId: string | null;
}

export const DEFAULT_CONFIG: GameConfig = {
  rounds: 10,
  timePerRound: 20,
  genre: "pop",
  playlistId: null,
};

export interface Track {
  id: string;
  name: string;
  artist: string;
  previewUrl: string;
  albumArt: string;
  animeName?: string; // set for anime tracks, gives points when guessed
}

export interface PlayerGuess {
  text: string;
  submittedAt: number;
  artistScore: number;
  titleScore: number;
  points: number;
}

export interface Round {
  track: Track;
  guesses: Record<string, PlayerGuess>; // playerId -> guess
  startedAt: number;
}

export interface PlayerScore {
  playerId: string;
  playerName: string;
  guess: string;
  points: number;
  totalScore: number;
}

export interface RoundResult {
  track: Track;
  scores: PlayerScore[];
}

export type RoomStatus = "lobby" | "starting" | "playing" | "round_results" | "finished";

export interface Room {
  code: string;
  players: Record<string, Player>; // playerId -> Player
  config: GameConfig;
  status: RoomStatus;
  currentRound: number;
  rounds: Round[];
  tracks: Track[];
  hostId: string;
}

// Client-side view of a round in progress (no answer revealed)
export interface RoundState {
  roundNumber: number;
  totalRounds: number;
  previewUrl: string;
  timePerRound: number;
}
