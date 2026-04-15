import React from "react";
import { useGame } from "./hooks/useGame.ts";
import { Home } from "./pages/Home.tsx";
import { Lobby } from "./pages/Lobby.tsx";
import { Game } from "./pages/Game.tsx";
import { Results } from "./pages/Results.tsx";

export default function App() {
  const {
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
  } = useGame();

  if (state.page === "home") {
    return (
      <Home
        onCreate={createRoom}
        onJoin={joinRoom}
        error={state.error}
      />
    );
  }

  if (state.page === "lobby" && state.me) {
    return (
      <Lobby
        roomCode={state.roomCode}
        me={state.me}
        players={state.players}
        config={state.config}
        onConfigure={configure}
        onStart={startGame}
        onLeave={leaveRoom}
        error={state.error}
      />
    );
  }

  if (state.page === "game" && state.me) {
    return (
      <Game
        me={state.me}
        roundState={state.roundState}
        timeRemaining={state.timeRemaining}
        roundResult={state.roundResult}
        guessAck={state.guessAck}
        players={state.players}
        onGuess={submitGuess}
        onNextRound={nextRound}
        onCancel={cancelGame}
      />
    );
  }

  if (state.page === "results" && state.me) {
    return (
      <Results
        leaderboard={state.leaderboard}
        me={state.me}
        onPlayAgain={restartGame}
        onLeave={leaveRoom}
      />
    );
  }

  return null;
}
