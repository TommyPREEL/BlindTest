import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { config } from "./config.js";
import { registerSocketHandlers } from "./socket/handler.js";

const app = express();
app.use(cors({ origin: config.clientOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Expose available genres to the client
app.get("/genres", async (_req, res) => {
  const { AVAILABLE_GENRES } = await import("./spotify/tracks.js");
  res.json({ genres: AVAILABLE_GENRES });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: config.clientOrigin,
    methods: ["GET", "POST"],
  },
});

registerSocketHandlers(io);

httpServer.listen(config.port, () => {
  console.log(`[server] listening on http://localhost:${config.port}`);
});
