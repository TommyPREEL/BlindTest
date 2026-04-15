import type { Server } from "socket.io";
import type { Room, Round, PlayerScore } from "@blindtest/shared";
import { scoreGuess } from "@blindtest/shared";
import { getRoom } from "./RoomManager.js";
import { fetchTracks } from "../spotify/tracks.js";

const activeTimers = new Map<string, ReturnType<typeof setInterval>>();

export function cancelRoomTimer(roomCode: string): void {
  const timer = activeTimers.get(roomCode);
  if (timer) {
    clearInterval(timer);
    activeTimers.delete(roomCode);
  }
}

function getPlayers(room: Room) {
  return Object.values(room.players);
}

export async function startGame(io: Server, roomCode: string): Promise<void> {
  const room = getRoom(roomCode);
  if (!room) return;

  room.status = "starting";
  room.currentRound = 0;
  room.rounds = [];

  // Fetch tracks from Spotify
  console.log(`[game] Fetching tracks for genre="${room.config.genre}" rounds=${room.config.rounds}`);
  room.tracks = await fetchTracks(
    room.config.genre,
    room.config.playlistId,
    room.config.rounds
  );
  console.log(`[game] Fetched ${room.tracks.length} tracks with previews`);

  if (room.tracks.length === 0) {
    io.to(roomCode).emit("room:error", {
      message: "No tracks with previews found. Try a different genre.",
    });
    room.status = "lobby";
    return;
  }

  // Clamp rounds to available tracks
  room.config.rounds = Math.min(room.config.rounds, room.tracks.length);

  // 3-second countdown
  io.to(roomCode).emit("game:starting", {
    totalRounds: room.config.rounds,
    countdown: 3,
  });

  setTimeout(() => startRound(io, roomCode), 3000);
}

export function startRound(io: Server, roomCode: string): void {
  const room = getRoom(roomCode);
  if (!room) return;

  room.currentRound += 1;
  const track = room.tracks[room.currentRound - 1]!;

  const round: Round = {
    track,
    guesses: {},
    startedAt: Date.now(),
  };
  room.rounds.push(round);
  room.status = "playing";

  io.to(roomCode).emit("game:round_start", {
    roundNumber: room.currentRound,
    totalRounds: room.config.rounds,
    previewUrl: track.previewUrl,
    timePerRound: room.config.timePerRound,
  });

  let timeRemaining = room.config.timePerRound;

  const interval = setInterval(() => {
    timeRemaining -= 1;
    io.to(roomCode).emit("game:tick", { timeRemaining });

    if (timeRemaining <= 0) {
      clearInterval(interval);
      activeTimers.delete(roomCode);
      endRound(io, roomCode);
    }
  }, 1000);

  activeTimers.set(roomCode, interval);
}

export function submitGuess(
  roomCode: string,
  playerId: string,
  text: string
): boolean {
  const room = getRoom(roomCode);
  if (!room || (room.status !== "playing" && room.status !== "round_results")) return false;

  const round = room.rounds[room.currentRound - 1];
  if (!round) return false;

  // Only first guess counts
  if (round.guesses[playerId]) return false;

  const elapsed = (Date.now() - round.startedAt) / 1000;
  const timeRemaining = Math.max(0, room.config.timePerRound - elapsed);

  const scored = scoreGuess(
    text,
    round.track.name,
    round.track.artist,
    timeRemaining,
    room.config.timePerRound,
    round.track.animeName
  );

  round.guesses[playerId] = {
    text,
    submittedAt: Date.now(),
    ...scored,
  };

  // Add to player's total score
  if (room.players[playerId]) {
    room.players[playerId]!.score += scored.points;
  }

  return true;
}

export function endRound(io: Server, roomCode: string): void {
  const room = getRoom(roomCode);
  if (!room) return;

  // Cancel any running timer
  const timer = activeTimers.get(roomCode);
  if (timer) {
    clearInterval(timer);
    activeTimers.delete(roomCode);
  }

  room.status = "round_results";
  const round = room.rounds[room.currentRound - 1]!;

  const scores: PlayerScore[] = getPlayers(room)
    .sort((a, b) => b.score - a.score)
    .map((p) => ({
      playerId: p.id,
      playerName: p.name,
      guess: round.guesses[p.id]?.text ?? "",
      points: round.guesses[p.id]?.points ?? 0,
      totalScore: p.score,
    }));

  io.to(roomCode).emit("game:round_end", {
    result: { track: round.track, scores },
  });
}

export function nextRound(io: Server, roomCode: string): void {
  const room = getRoom(roomCode);
  if (!room || room.status !== "round_results") return;

  if (room.currentRound >= room.config.rounds) {
    finishGame(io, roomCode);
  } else {
    startRound(io, roomCode);
  }
}

function finishGame(io: Server, roomCode: string): void {
  const room = getRoom(roomCode);
  if (!room) return;

  room.status = "finished";

  const leaderboard: PlayerScore[] = getPlayers(room)
    .sort((a, b) => b.score - a.score)
    .map((p) => ({
      playerId: p.id,
      playerName: p.name,
      guess: "",
      points: 0,
      totalScore: p.score,
    }));

  io.to(roomCode).emit("game:finished", { leaderboard });
}
