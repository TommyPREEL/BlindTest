import React, { useState, useEffect } from "react";
import type { Player, GameConfig } from "@blindtest/shared";

const GENRES = [
  "pop", "rock", "hip-hop", "electronic", "r-n-b",
  "french", "latin", "jazz", "metal", "classical",
  "reggae", "country", "indie", "soul", "disco", "k-pop", "anime",
];

interface Props {
  roomCode: string;
  me: Player;
  players: Player[];
  config: GameConfig | null;
  onConfigure: (config: GameConfig) => void;
  onStart: () => void;
  onLeave: () => void;
  error: string | null;
}

export function Lobby({ roomCode, me, players, config, onConfigure, onStart, onLeave, error }: Props) {
  const [localConfig, setLocalConfig] = useState<GameConfig>(
    config ?? { rounds: 10, timePerRound: 20, genre: "pop", playlistId: null }
  );

  useEffect(() => {
    if (config) setLocalConfig(config);
  }, [config]);

  function handleConfigChange(partial: Partial<GameConfig>) {
    const next = { ...localConfig, ...partial };
    setLocalConfig(next);
    onConfigure(next);
  }

  return (
    <div className="min-h-dvh flex flex-col items-center p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-8 mt-4">
        <button onClick={onLeave} className="text-gray-400 hover:text-white text-sm">
          ← Leave
        </button>
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Room Code</div>
          <div className="text-3xl font-mono font-bold text-purple-400 tracking-widest">{roomCode}</div>
        </div>
        <div className="w-12" />
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-300 rounded-lg p-3 mb-4 text-sm w-full">
          {error}
        </div>
      )}

      {/* Players */}
      <div className="w-full bg-gray-800/50 rounded-xl p-4 mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-3">
          Players ({players.length}/20)
        </div>
        <div className="space-y-2">
          {players.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-sm font-bold">
                {p.name[0]?.toUpperCase()}
              </div>
              <span className="text-white">{p.name}</span>
              {p.isHost && <span className="text-xs text-yellow-400 ml-auto">Host</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Config (host only) */}
      {me.isHost && (
        <div className="w-full bg-gray-800/50 rounded-xl p-4 mb-6 space-y-4">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Game Settings</div>

          <div>
            <label className="text-sm text-gray-300 flex justify-between mb-1">
              <span>Rounds</span>
              <span className="text-purple-400 font-bold">{localConfig.rounds}</span>
            </label>
            <input
              type="range" min={3} max={20} value={localConfig.rounds}
              onChange={(e) => handleConfigChange({ rounds: +e.target.value })}
              className="w-full accent-purple-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 flex justify-between mb-1">
              <span>Time per round</span>
              <span className="text-purple-400 font-bold">{localConfig.timePerRound}s</span>
            </label>
            <input
              type="range" min={10} max={30} value={localConfig.timePerRound}
              onChange={(e) => handleConfigChange({ timePerRound: +e.target.value })}
              className="w-full accent-purple-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Genre</label>
            <select
              value={localConfig.genre ?? "pop"}
              onChange={(e) => handleConfigChange({ genre: e.target.value, playlistId: null })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 capitalize"
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Non-host sees config read-only */}
      {!me.isHost && config && (
        <div className="w-full bg-gray-800/50 rounded-xl p-4 mb-6 text-sm text-gray-300 space-y-1">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Game Settings</div>
          <div className="flex justify-between"><span>Rounds</span><span className="text-purple-400">{config.rounds}</span></div>
          <div className="flex justify-between"><span>Time per round</span><span className="text-purple-400">{config.timePerRound}s</span></div>
          <div className="flex justify-between capitalize"><span>Genre</span><span className="text-purple-400">{config.genre}</span></div>
        </div>
      )}

      {me.isHost ? (
        <button
          onClick={onStart}
          disabled={players.length < 1}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-bold py-4 rounded-xl transition-colors text-lg"
        >
          Start Game
        </button>
      ) : (
        <div className="text-gray-400 text-sm">Waiting for the host to start…</div>
      )}
    </div>
  );
}
