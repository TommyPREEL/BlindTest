export interface Player {
    id: string;
    name: string;
    score: number;
    isHost: boolean;
    connected: boolean;
}
export interface GameConfig {
    rounds: number;
    timePerRound: number;
    genre: string | null;
    playlistId: string | null;
}
export declare const DEFAULT_CONFIG: GameConfig;
export interface Track {
    id: string;
    name: string;
    artist: string;
    previewUrl: string;
    albumArt: string;
    animeName?: string;
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
    guesses: Record<string, PlayerGuess>;
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
    players: Record<string, Player>;
    config: GameConfig;
    status: RoomStatus;
    currentRound: number;
    rounds: Round[];
    tracks: Track[];
    hostId: string;
}
export interface RoundState {
    roundNumber: number;
    totalRounds: number;
    previewUrl: string;
    timePerRound: number;
}
