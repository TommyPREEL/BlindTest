import dotenv from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../../.env") });

export const config = {
  port: parseInt(process.env["PORT"] ?? "3950", 10),
  clientOrigin: "*",
};
