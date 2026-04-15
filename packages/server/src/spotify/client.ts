import { config } from "../config.js";

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

export async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 10_000) {
    return tokenCache.accessToken;
  }

  const credentials = Buffer.from(
    `${config.spotify.clientId}:${config.spotify.clientSecret}`
  ).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`Spotify auth failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return tokenCache.accessToken;
}

export async function spotifyGet<T>(path: string): Promise<T> {
  const token = await getAccessToken();
  const fullUrl = `https://api.spotify.com/v1${path}`;
  console.log(`[spotify] GET ${fullUrl}`);
  const res = await fetch(fullUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  console.log(`[spotify] response ${res.status}: ${text.slice(0, 300)}`);
  if (!res.ok) {
    throw new Error(`Spotify API error ${res.status}: ${text}`);
  }
  return JSON.parse(text) as T;
}
