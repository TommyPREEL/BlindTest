import React from "react";
import type { Player, PlayerScore } from "@blindtest/shared";

const MEDALS = ["🥇", "🥈", "🥉"];

interface Props {
  leaderboard: PlayerScore[];
  me: Player;
  onPlayAgain: () => void;
  onLeave: () => void;
}

export function Results({ leaderboard, me, onPlayAgain, onLeave }: Props) {
  return (
    <div className="min-h-dvh flex flex-col items-center p-4 max-w-lg mx-auto">
      <div className="mt-8 mb-8 text-center">
        <div className="text-5xl mb-3">🏆</div>
        <h1 className="text-3xl font-bold text-white">Final Results</h1>
      </div>

      <div className="w-full space-y-3 mb-8">
        {leaderboard.map((entry, i) => (
          <div
            key={entry.playerId}
            className={`flex items-center gap-4 p-4 rounded-xl ${
              entry.playerId === me.id
                ? "bg-purple-900/60 border border-purple-500"
                : "bg-gray-800/50"
            }`}
          >
            <span className="text-2xl w-8 text-center">
              {i < 3 ? MEDALS[i] : <span className="text-gray-500 text-lg">{i + 1}</span>}
            </span>
            <span className="flex-1 font-semibold text-white">{entry.playerName}</span>
            <span className="text-purple-400 font-bold text-xl">{entry.totalScore}</span>
          </div>
        ))}
      </div>

      {me.isHost ? (
        <button
          onClick={onPlayAgain}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-colors text-lg mb-3"
        >
          Play Again
        </button>
      ) : (
        <div className="w-full text-center text-gray-400 py-4 mb-3">
          Waiting for host to start a new game…
        </div>
      )}

      <button
        onClick={onLeave}
        className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl transition-colors"
      >
        Leave Room
      </button>
    </div>
  );
}
