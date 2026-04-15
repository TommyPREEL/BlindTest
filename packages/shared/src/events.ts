import type { Player, GameConfig, RoundResult, PlayerScore, RoundState } from "./types.js";

// ── Client → Server ──────────────────────────────────────────────────────────

export interface ClientEvents {
  "room:create": (payload: { playerName: string }) => void;
  "room:join": (payload: { code: string; playerName: string }) => void;
  "room:leave": () => void;
  "game:configure": (payload: { config: GameConfig }) => void;
  "game:start": () => void;
  "game:guess": (payload: { text: string }) => void;
  "game:next_round": () => void;
  "game:restart": () => void;
}

// ── Server → Client ──────────────────────────────────────────────────────────

export interface ServerEvents {
  "room:created": (payload: { code: string; player: Player }) => void;
  "room:joined": (payload: { code: string; players: Player[]; config: GameConfig }) => void;
  "room:player_joined": (payload: { player: Player }) => void;
  "room:player_left": (payload: { playerId: string }) => void;
  "room:host_changed": (payload: { newHostId: string }) => void;
  "room:error": (payload: { message: string }) => void;
  "game:config_updated": (payload: { config: GameConfig }) => void;
  "game:starting": (payload: { totalRounds: number; countdown: number }) => void;
  "game:round_start": (payload: RoundState) => void;
  "game:tick": (payload: { timeRemaining: number }) => void;
  "game:guess_ack": (payload: { received: boolean }) => void;
  "game:round_end": (payload: { result: RoundResult }) => void;
  "game:finished": (payload: { leaderboard: PlayerScore[] }) => void;
  "game:restarted": (payload: { players: Player[]; config: GameConfig }) => void;
}

// ── Inter-server events (Socket.IO internal) ─────────────────────────────────

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  playerId: string;
  roomCode: string;
  playerName: string;
}
