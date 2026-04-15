import React, { useState, useEffect } from "react";
import type { Player, RoundState, RoundResult } from "@blindtest/shared";
import { useAudio } from "../hooks/useAudio.ts";

interface Props {
  me: Player;
  roundState: RoundState | null;
  timeRemaining: number;
  roundResult: RoundResult | null;
  guessAck: boolean | null;
  players: Player[];
  onGuess: (text: string) => void;
  onNextRound: () => void;
  onCancel: () => void;
}

export function Game({
  me,
  roundState,
  timeRemaining,
  roundResult,
  guessAck,
  players,
  onGuess,
  onNextRound,
  onCancel,
}: Props) {
  const [guess, setGuess] = useState("");
  const { play, stop, volume, setVolume } = useAudio();

  // Reset guess and play audio when a new round starts
  useEffect(() => {
    if (roundState?.previewUrl) {
      setGuess("");
      play(roundState.previewUrl);
    }
    return () => stop();
  }, [roundState?.roundNumber]);

  // Auto-submit when 1 second left (before server closes the round)
  useEffect(() => {
    if (timeRemaining <= 1 && guess.trim() && !guessAck) {
      onGuess(guess.trim());
    }
  }, [timeRemaining]);

  // Stop audio when round ends
  useEffect(() => {
    if (roundResult) stop();
  }, [roundResult]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (guess.trim() && !guessAck) {
      onGuess(guess.trim());
    }
  }

  const timerPct = roundState ? (timeRemaining / roundState.timePerRound) * 100 : 100;
  const timerColor = timerPct > 50 ? "bg-green-500" : timerPct > 25 ? "bg-yellow-500" : "bg-red-500";

  // Countdown screen (game:starting received but no round yet)
  if (!roundState) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎵</div>
          <div className="text-2xl text-purple-400 font-bold">Get ready!</div>
          <div className="text-gray-400 mt-2">Game is starting…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col p-4 max-w-lg mx-auto">
      {/* Round info + timer */}
      <div className="mt-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400 text-sm">
            Round {roundState.roundNumber} / {roundState.totalRounds}
          </span>
          {me.isHost && !roundResult && (
            <button
              onClick={() => { if (confirm("Cancel the game and return to lobby?")) onCancel(); }}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Cancel game
            </button>
          )}
          <span className={`text-lg font-bold ${timeRemaining <= 5 ? "text-red-400 animate-pulse" : "text-white"}`}>
            {timeRemaining}s
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${timerColor}`}
            style={{ width: `${timerPct}%` }}
          />
        </div>
      </div>

      {/* Audio visual */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {!roundResult ? (
          <>
            {/* Animated music indicator */}
            <div className="mb-6 relative">
              <div className="w-32 h-32 rounded-full bg-purple-900/50 flex items-center justify-center animate-pulse">
                <div className="w-20 h-20 rounded-full bg-purple-700/50 flex items-center justify-center">
                  <span className="text-4xl">🎵</span>
                </div>
              </div>
            </div>

            {/* Volume slider */}
            <div className="flex items-center gap-3 mb-6 w-full max-w-xs">
              <span className="text-gray-400 text-lg select-none">
                {volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 accent-purple-500"
              />
            </div>

            {/* Guess input */}
            {guessAck ? (
              <div className="text-center">
                <div className="text-green-400 font-semibold mb-2">Guess submitted!</div>
                <div className="text-gray-400 text-sm">Waiting for the round to end…</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full space-y-3">
                <input
                  type="text"
                  placeholder="Artist or song name…"
                  value={guess}
                  maxLength={100}
                  autoFocus
                  onChange={(e) => setGuess(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-lg"
                />
                <button
                  type="submit"
                  disabled={!guess.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold py-4 rounded-xl transition-colors text-lg"
                >
                  Submit Guess
                </button>
              </form>
            )}
          </>
        ) : (
          /* Round result */
          <div className="w-full">
            <div className="text-center mb-6">
              {roundResult.track.albumArt && (
                <img
                  src={roundResult.track.albumArt}
                  alt="Album art"
                  className="w-32 h-32 rounded-xl mx-auto mb-4 shadow-lg"
                />
              )}
              <div className="text-xl font-bold text-white">{roundResult.track.name}</div>
              <div className="text-gray-400">{roundResult.track.artist}</div>
              {roundResult.track.animeName && (
                <div className="text-purple-400 text-sm mt-1">from {roundResult.track.animeName}</div>
              )}
            </div>

            {/* Scores */}
            <div className="space-y-2 mb-6">
              {roundResult.scores.map((s, i) => (
                <div
                  key={s.playerId}
                  className={`flex items-center gap-3 bg-gray-800/50 rounded-lg p-3 ${s.playerId === me.id ? "border border-purple-500" : ""}`}
                >
                  <span className="text-gray-500 text-sm w-5">{i + 1}</span>
                  <span className="text-white flex-1">{s.playerName}</span>
                  {s.guess && <span className="text-gray-400 text-sm italic truncate max-w-28">"{s.guess}"</span>}
                  <span className={`font-bold text-sm ${s.points > 0 ? "text-green-400" : "text-gray-500"}`}>
                    +{s.points}
                  </span>
                  <span className="text-purple-400 font-bold text-sm w-12 text-right">{s.totalScore}</span>
                </div>
              ))}
            </div>

            {me.isHost && (
              <button
                onClick={onNextRound}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-colors"
              >
                {roundState.roundNumber >= roundState.totalRounds ? "See Final Results" : "Next Round →"}
              </button>
            )}
            {!me.isHost && (
              <div className="text-center text-gray-400 text-sm">Waiting for host…</div>
            )}
          </div>
        )}
      </div>

      {/* Player scores sidebar (compact) */}
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {players
          .slice()
          .sort((a, b) => b.score - a.score)
          .map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${p.id === me.id ? "bg-purple-700" : "bg-gray-800"}`}
            >
              <span>{p.name}</span>
              <span className="text-purple-300 font-bold">{p.score}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
