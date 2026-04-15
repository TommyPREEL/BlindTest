import type { Server, Socket } from "socket.io";
import type { GameConfig } from "@blindtest/shared";
import * as RoomManager from "../game/RoomManager.js";
import * as GameEngine from "../game/GameEngine.js";
import { cancelRoomTimer } from "../game/GameEngine.js";

export function registerGameEvents(io: Server, socket: Socket): void {
  socket.on("game:configure", ({ config }: { config: GameConfig }) => {
    const code = socket.data.roomCode as string | undefined;
    if (!code) return;

    const room = RoomManager.getRoom(code);
    if (!room || room.hostId !== socket.id) return;

    // Clamp values
    const safeConfig: GameConfig = {
      rounds: Math.min(20, Math.max(3, config.rounds ?? 10)),
      timePerRound: Math.min(30, Math.max(10, config.timePerRound ?? 20)),
      genre: config.genre ?? "pop",
      playlistId: config.playlistId ?? null,
    };

    RoomManager.updateConfig(code, safeConfig);
    io.to(code).emit("game:config_updated", { config: safeConfig });
  });

  socket.on("game:start", () => {
    const code = socket.data.roomCode as string | undefined;
    if (!code) return;

    const room = RoomManager.getRoom(code);
    if (!room) return;
    if (room.hostId !== socket.id) return;
    if (room.status !== "lobby") return;
    if (Object.keys(room.players).length < 1) return;

    GameEngine.startGame(io, code).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[game] startGame error:", msg);
      io.to(code).emit("room:error", { message: `Spotify error: ${msg}` });
      room.status = "lobby";
    });
  });

  socket.on("game:guess", ({ text }: { text: string }) => {
    const code = socket.data.roomCode as string | undefined;
    if (!code) return;

    const guess = text?.trim().slice(0, 100);
    if (!guess) return;

    const accepted = GameEngine.submitGuess(code, socket.id, guess);
    socket.emit("game:guess_ack", { received: accepted });
  });

  socket.on("game:next_round", () => {
    const code = socket.data.roomCode as string | undefined;
    if (!code) return;

    const room = RoomManager.getRoom(code);
    if (!room || room.hostId !== socket.id) return;

    GameEngine.nextRound(io, code);
  });

  socket.on("game:cancel", () => {
    const code = socket.data.roomCode as string | undefined;
    if (!code) return;

    const room = RoomManager.getRoom(code);
    if (!room || room.hostId !== socket.id) return;
    if (room.status === "lobby") return;

    // Stop the round timer before resetting, or it will fire on a cleared room
    cancelRoomTimer(code);

    const restarted = RoomManager.restartRoom(code);
    if (!restarted) return;

    io.to(code).emit("game:restarted", {
      players: Object.values(restarted.players),
      config: restarted.config,
    });
  });

  socket.on("game:restart", () => {
    const code = socket.data.roomCode as string | undefined;
    if (!code) return;

    const room = RoomManager.getRoom(code);
    if (!room || room.hostId !== socket.id) return;

    const restarted = RoomManager.restartRoom(code);
    if (!restarted) return;

    io.to(code).emit("game:restarted", {
      players: Object.values(restarted.players),
      config: restarted.config,
    });
  });
}
