import { io } from "socket.io-client";

// Empty string = connect to same origin (nginx proxies /socket.io/ to the server)
// In dev, Vite proxies /socket.io/ to localhost:3950
export const socket = io("", {
  autoConnect: false,
});
