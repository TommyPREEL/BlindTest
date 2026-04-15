import React, { useState } from "react";

interface Props {
  onCreate: (name: string) => void;
  onJoin: (code: string, name: string) => void;
  error: string | null;
}

export function Home({ onCreate, onJoin, error }: Props) {
  const [tab, setTab] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim()) onCreate(name.trim());
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim() && code.trim()) onJoin(code.trim().toUpperCase(), name.trim());
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-bold text-center mb-2 text-purple-400">🎵 BlindTest</h1>
        <p className="text-center text-gray-400 mb-8">Guess the song, beat your friends</p>

        {/* Tabs */}
        <div className="flex rounded-lg overflow-hidden mb-6 border border-gray-700">
          <button
            className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === "create" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}
            onClick={() => setTab("create")}
          >
            Create Room
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === "join" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}
            onClick={() => setTab("join")}
          >
            Join Room
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {tab === "create" ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              maxLength={20}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Create Room
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              maxLength={20}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <input
              type="text"
              placeholder="Room code (e.g. ABCD)"
              value={code}
              maxLength={4}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 tracking-widest text-lg text-center font-mono"
            />
            <button
              type="submit"
              disabled={!name.trim() || code.trim().length !== 4}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Join Room
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
