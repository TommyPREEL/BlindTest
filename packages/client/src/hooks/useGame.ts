import { useState, useEffect, useCallback } from "react";
import type {
  Player,
  GameConfig,
  RoundResult,
  PlayerScore,
  RoundState,
} from "@blindtest/shared";
import { socket } from "../socket.ts";

export type GamePage = "home" | "lobby" | "game" | "results";

interface GameState {
  page: GamePage;
  roomCode: string;
  me: Player | null;
  players: Player[];
  config: GameConfig | null;
  // round state
  roundState: RoundState | null;
  timeRemaining: number;
  roundResult: RoundResult | null;
  guessAck: boolean | null;
  // final
  leaderboard: PlayerScore[];
  error: string | null;
}

const INITIAL: GameState = {
  page: "home",
  roomCode: "",
  me: null,
  players: [],
  config: null,
  roundState: null,
  timeRemaining: 0,
  roundResult: null,
  guessAck: null,
  leaderboard: [],
  error: null,
};

export function useGame() {
  const [state, setState] = useState<GameState>(INITIAL);

  const patch = useCallback((partial: Partial<GameState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  useEffect(() => {
    socket.on("room:created", ({ code, player }) => {
      patch({ page: "lobby", roomCode: code, me: player, players: [player], error: null });
    });

    socket.on("room:joined", ({ code, players, config }) => {
      const me = players.find((p) => p.id === socket.id) ?? null;
      patch({ page: "lobby", roomCode: code, me, players, config, error: null });
    });

    socket.on("room:player_joined", ({ player }) => {
      setState((prev) => ({
        ...prev,
        players: [...prev.players.filter((p) => p.id !== player.id), player],
      }));
    });

    socket.on("room:player_left", ({ playerId }) => {
      setState((prev) => ({
        ...prev,
        players: prev.players.filter((p) => p.id !== playerId),
      }));
    });

    socket.on("room:host_changed", ({ newHostId }) => {
      setState((prev) => ({
        ...prev,
        me: prev.me ? { ...prev.me, isHost: prev.me.id === newHostId } : null,
        players: prev.players.map((p) => ({ ...p, isHost: p.id === newHostId })),
      }));
    });

    socket.on("room:error", ({ message }) => {
      patch({ error: message });
    });

    socket.on("game:config_updated", ({ config }) => {
      patch({ config });
    });

    socket.on("game:starting", () => {
      patch({ page: "game", roundResult: null, guessAck: null });
    });

    socket.on("game:round_start", (roundState) => {
      patch({ roundState, timeRemaining: roundState.timePerRound, roundResult: null, guessAck: null });
    });

    socket.on("game:tick", ({ timeRemaining }) => {
      patch({ timeRemaining });
    });

    socket.on("game:guess_ack", ({ received }) => {
      patch({ guessAck: received });
    });

    socket.on("game:round_end", ({ result }) => {
      // Update local player scores
      setState((prev) => {
        const updatedPlayers = prev.players.map((p) => {
          const scored = result.scores.find((s) => s.playerId === p.id);
          return scored ? { ...p, score: scored.totalScore } : p;
        });
        const updatedMe = updatedPlayers.find((p) => p.id === prev.me?.id) ?? prev.me;
        return { ...prev, roundResult: result, players: updatedPlayers, me: updatedMe };
      });
    });

    socket.on("game:finished", ({ leaderboard }) => {
      patch({ page: "results", leaderboard });
    });

    socket.on("game:restarted", ({ players, config }) => {
      setState((prev) => {
        const me = players.find((p) => p.id === prev.me?.id) ?? prev.me;
        return {
          ...prev,
          page: "lobby",
          players,
          config,
          me,
          roundState: null,
          roundResult: null,
          guessAck: null,
          leaderboard: [],
          error: null,
        };
      });
    });

    return () => {
      socket.off("room:created");
      socket.off("room:joined");
      socket.off("room:player_joined");
      socket.off("room:player_left");
      socket.off("room:host_changed");
      socket.off("room:error");
      socket.off("game:config_updated");
      socket.off("game:starting");
      socket.off("game:round_start");
      socket.off("game:tick");
      socket.off("game:guess_ack");
      socket.off("game:round_end");
      socket.off("game:finished");
      socket.off("game:restarted");
    };
  }, [patch]);

  function createRoom(playerName: string) {
    if (!socket.connected) socket.connect();
    socket.emit("room:create", { playerName });
  }

  function joinRoom(code: string, playerName: string) {
    if (!socket.connected) socket.connect();
    socket.emit("room:join", { code, playerName });
  }

  function leaveRoom() {
    socket.emit("room:leave");
    setState(INITIAL);
  }

  function restartGame() {
    socket.emit("game:restart");
  }

  function cancelGame() {
    socket.emit("game:cancel");
  }

  function configure(config: GameConfig) {
    socket.emit("game:configure", { config });
  }

  function startGame() {
    socket.emit("game:start");
  }

  function submitGuess(text: string) {
    socket.emit("game:guess", { text });
  }

  function nextRound() {
    socket.emit("game:next_round");
  }

  return {
    state,
    createRoom,
    joinRoom,
    leaveRoom,
    restartGame,
    cancelGame,
    configure,
    startGame,
    submitGuess,
    nextRound,
  };
}
