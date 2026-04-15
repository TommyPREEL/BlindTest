import type { Server, Socket } from "socket.io";
import * as RoomManager from "../game/RoomManager.js";

export function registerRoomEvents(io: Server, socket: Socket): void {
  socket.on("room:create", ({ playerName }: { playerName: string }) => {
    const name = playerName?.trim().slice(0, 20);
    if (!name) return socket.emit("room:error", { message: "Name is required." });

    const room = RoomManager.createRoom(socket.id, name);
    socket.join(room.code);
    socket.data.roomCode = room.code;
    socket.data.playerName = name;

    socket.emit("room:created", {
      code: room.code,
      player: room.players[socket.id]!,
    });
  });

  socket.on("room:join", ({ code, playerName }: { code: string; playerName: string }) => {
    const name = playerName?.trim().slice(0, 20);
    const roomCode = code?.toUpperCase().trim();
    if (!name) return socket.emit("room:error", { message: "Name is required." });
    if (!roomCode) return socket.emit("room:error", { message: "Room code is required." });

    const result = RoomManager.joinRoom(roomCode, socket.id, name);
    if ("error" in result) {
      return socket.emit("room:error", { message: result.error });
    }

    const { room, player } = result;
    socket.join(roomCode);
    socket.data.roomCode = roomCode;
    socket.data.playerName = name;

    socket.emit("room:joined", {
      code: roomCode,
      players: Object.values(room.players),
      config: room.config,
    });

    socket.to(roomCode).emit("room:player_joined", { player });
  });

  socket.on("room:leave", () => {
    handleLeave(io, socket);
  });

  socket.on("disconnect", () => {
    handleLeave(io, socket);
  });
}

export function handleLeave(io: Server, socket: Socket): void {
  const code = socket.data.roomCode as string | undefined;
  if (!code) return;

  const updatedRoom = RoomManager.leaveRoom(socket.id, code);
  socket.leave(code);
  socket.data.roomCode = undefined;

  if (!updatedRoom) return; // Room is gone

  // Notify remaining players
  io.to(code).emit("room:player_left", { playerId: socket.id });

  // If host changed, notify
  if (updatedRoom.hostId !== socket.id) {
    io.to(code).emit("room:host_changed", { newHostId: updatedRoom.hostId });
  }
}
