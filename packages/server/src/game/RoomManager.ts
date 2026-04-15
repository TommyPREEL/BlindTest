import type { Room, Player, GameConfig } from "@blindtest/shared";
import { DEFAULT_CONFIG } from "@blindtest/shared";
import { generateRoomCode } from "./codeGenerator.js";

const rooms = new Map<string, Room>();
const ROOM_TTL_MS = 30 * 60 * 1000; // 30 minutes
const roomTimers = new Map<string, ReturnType<typeof setTimeout>>();

function touchTimer(code: string) {
  const existing = roomTimers.get(code);
  if (existing) clearTimeout(existing);
  roomTimers.set(
    code,
    setTimeout(() => {
      rooms.delete(code);
      roomTimers.delete(code);
    }, ROOM_TTL_MS)
  );
}

export function createRoom(hostId: string, hostName: string): Room {
  const code = generateRoomCode(new Set(rooms.keys()));
  const host: Player = {
    id: hostId,
    name: hostName,
    score: 0,
    isHost: true,
    connected: true,
  };
  const room: Room = {
    code,
    players: { [hostId]: host },
    config: { ...DEFAULT_CONFIG },
    status: "lobby",
    currentRound: 0,
    rounds: [],
    tracks: [],
    hostId,
  };
  rooms.set(code, room);
  touchTimer(code);
  return room;
}

export function joinRoom(
  code: string,
  playerId: string,
  playerName: string
): { room: Room; player: Player } | { error: string } {
  const room = rooms.get(code);
  if (!room) return { error: "Room not found." };
  if (room.status !== "lobby") return { error: "Game already in progress." };
  if (Object.keys(room.players).length >= 20) return { error: "Room is full." };

  const player: Player = {
    id: playerId,
    name: playerName,
    score: 0,
    isHost: false,
    connected: true,
  };
  room.players[playerId] = player;
  touchTimer(code);
  return { room, player };
}

export function leaveRoom(playerId: string, code: string): Room | null {
  const room = rooms.get(code);
  if (!room) return null;
  delete room.players[playerId];

  // If nobody left, remove the room
  if (Object.keys(room.players).length === 0) {
    rooms.delete(code);
    const t = roomTimers.get(code);
    if (t) clearTimeout(t);
    roomTimers.delete(code);
    return null;
  }

  // If the host left, promote the first remaining player
  if (room.hostId === playerId) {
    const newHostId = Object.keys(room.players)[0]!;
    room.players[newHostId]!.isHost = true;
    room.hostId = newHostId;
  }

  touchTimer(code);
  return room;
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code);
}

export function updateConfig(code: string, config: GameConfig): boolean {
  const room = rooms.get(code);
  if (!room || room.status !== "lobby") return false;
  room.config = config;
  return true;
}

export function restartRoom(code: string): Room | null {
  const room = rooms.get(code);
  if (!room || room.status === "lobby") return null;
  room.status = "lobby";
  room.currentRound = 0;
  room.rounds = [];
  room.tracks = [];
  for (const player of Object.values(room.players)) {
    player.score = 0;
  }
  touchTimer(code);
  return room;
}

export function getRoomCodes(): Set<string> {
  return new Set(rooms.keys());
}
