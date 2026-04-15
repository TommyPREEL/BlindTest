import type { Server, Socket } from "socket.io";
import { registerRoomEvents } from "./roomEvents.js";
import { registerGameEvents } from "./gameEvents.js";

export function registerSocketHandlers(io: Server): void {
  io.on("connection", (socket: Socket) => {
    console.log(`[socket] connected: ${socket.id}`);
    registerRoomEvents(io, socket);
    registerGameEvents(io, socket);
  });
}
