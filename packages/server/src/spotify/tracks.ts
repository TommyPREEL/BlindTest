import type { Track } from "@blindtest/shared";

interface DeezerTrack {
  id: number;
  title: string;
  preview: string; // 30-second MP3 URL
  artist: { name: string };
  album: { cover_medium: string };
}

interface DeezerSearchResponse {
  data: DeezerTrack[];
}

function toTrack(t: DeezerTrack): Track | null {
  if (!t.preview) return null;
  return {
    id: String(t.id),
    name: t.title,
    artist: t.artist.name,
    previewUrl: t.preview,
    albumArt: t.album.cover_medium,
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

// Deezer genre IDs for the chart endpoint
const GENRE_IDS: Record<string, number> = {
  "pop":         132,
  "rock":        152,
  "hip-hop":     116,
  "electronic":  106,
  "r-n-b":       165,
  "french":      482,
  "latin":       197,
  "jazz":        129,
  "metal":       464,
  "classical":    98,
  "reggae":      144,
  "country":      84,
  "indie":        85,
  "soul":        169,
  "disco":       106, // closest available
  "k-pop":       132, // fallback to pop charts
};

async function deezerChart(genreId: number): Promise<DeezerTrack[]> {
  const url = `https://api.deezer.com/chart/${genreId}/tracks?limit=100`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = (await res.json()) as DeezerSearchResponse;
  return data.data ?? [];
}

async function deezerSearch(query: string, index = 0): Promise<DeezerTrack[]> {
  const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=100&index=${index}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = (await res.json()) as DeezerSearchResponse;
  return data.data ?? [];
}

function randomIndex(): number {
  // Pick a random page: 0, 100, 200, 300 or 400
  return Math.floor(Math.random() * 5) * 100;
}

// Curated list of actual anime openings/endings — searched by title so we get the exact track
const ANIME_OPENINGS: Array<{ title: string; artist: string; show: string }> = [
  { title: "Gurenge", artist: "LiSA", show: "Demon Slayer" },
  { title: "Unravel", artist: "TK", show: "Tokyo Ghoul" },
  { title: "Guren no Yumiya", artist: "Linked Horizon", show: "Attack on Titan" },
  { title: "Shinzou wo Sasageyo", artist: "Linked Horizon", show: "Attack on Titan" },
  { title: "My War", artist: "Shinsei Kamattechan", show: "Attack on Titan" },
  { title: "The Rumbling", artist: "SiM", show: "Attack on Titan" },
  { title: "Crossing Field", artist: "LiSA", show: "Sword Art Online" },
  { title: "Silhouette", artist: "KANA-BOON", show: "Naruto Shippuden" },
  { title: "Blue Bird", artist: "Ikimono-gakari", show: "Naruto Shippuden" },
  { title: "GO!!!", artist: "FLOW", show: "Naruto" },
  { title: "Haruka Kanata", artist: "Asian Kung-Fu Generation", show: "Naruto" },
  { title: "Again", artist: "YUI", show: "Fullmetal Alchemist Brotherhood" },
  { title: "Period", artist: "Chemistry", show: "Fullmetal Alchemist Brotherhood" },
  { title: "The Day", artist: "Porno Graffitti", show: "Fullmetal Alchemist Brotherhood" },
  { title: "A Cruel Angel's Thesis", artist: "Yoko Takahashi", show: "Neon Genesis Evangelion" },
  { title: "Tank!", artist: "Seatbelts", show: "Cowboy Bebop" },
  { title: "Oath Sign", artist: "LiSA", show: "Fate Zero" },
  { title: "Brave Shine", artist: "Aimer", show: "Fate Stay Night" },
  { title: "Connect", artist: "ClariS", show: "Puella Magi Madoka Magica" },
  { title: "This Game", artist: "Konomi Suzuki", show: "No Game No Life" },
  { title: "Sugar Song to Bitter Step", artist: "Unison Square Garden", show: "Blood Blockade Battlefront" },
  { title: "Inferno", artist: "Mrs. Green Apple", show: "Fire Force" },
  { title: "Renai Circulation", artist: "Kana Hanazawa", show: "Bakemonogatari" },
  { title: "Sparkle", artist: "Radwimps", show: "Your Name" },
  { title: "Zenzenzense", artist: "Radwimps", show: "Your Name" },
  { title: "Daddy Daddy Do", artist: "TrySail", show: "Kaguya-sama Love is War" },
  { title: "Cagayake Girls", artist: "Houkago Tea Time", show: "K-On" },
  { title: "Don't say lazy", artist: "Houkago Tea Time", show: "K-On" },
  { title: "My Soul Your Beats", artist: "Lia", show: "Angel Beats" },
  { title: "Days", artist: "FLOW", show: "Eureka Seven" },
  { title: "Sign", artist: "FLOW", show: "Naruto Shippuden" },
  { title: "Asterisk", artist: "Orange Range", show: "Bleach" },
  { title: "Hologram", artist: "NICO Touches the Walls", show: "Fullmetal Alchemist Brotherhood" },
  { title: "Cha-La Head-Cha-La", artist: "Hironobu Kageyama", show: "Dragon Ball Z" },
  { title: "We Are", artist: "Hiroshi Kitadani", show: "One Piece" },
  { title: "Fighting Gold", artist: "Coda", show: "JoJo's Bizarre Adventure" },
  { title: "Bloody Stream", artist: "Coda", show: "JoJo's Bizarre Adventure" },
  { title: "Great Days", artist: "Karen Aoki", show: "JoJo's Bizarre Adventure" },
  { title: "Pegasus Fantasy", artist: "MAKE-UP", show: "Saint Seiya" },
  { title: "Departure!", artist: "Masatoshi Ono", show: "Hunter x Hunter" },
  { title: "Kyouran Hey Kids!", artist: "THE ORAL CIGARETTES", show: "Noragami" },
  { title: "Kimi no Shiranai Monogatari", artist: "supercell", show: "Bakemonogatari" },
  { title: "Ambiguous", artist: "GARNiDELiA", show: "Kill la Kill" },
  { title: "Sirius", artist: "Aimer", show: "Kill la Kill" },
  { title: "Renegade", artist: "Aaryn Doyle", show: "Haikyuu" },
  { title: "Imagination", artist: "SPYAIR", show: "Haikyuu" },
  { title: "Kaikai Kitan", artist: "Eve", show: "Jujutsu Kaisen" },
  { title: "Where Our Blue Is", artist: "Tatsuya Kitani", show: "Jujutsu Kaisen" },
  { title: "Boku no Kotoba de wa nai Kore wa Boku-tachi no Kotoba", artist: "Mol-74", show: "Vinland Saga" },
  { title: "River", artist: "Survive Said The Prophet", show: "Vinland Saga" },
  // One Piece
  { title: "We Go!", artist: "Hiroshi Kitadani", show: "One Piece" },
  { title: "Kokoro no Chizu", artist: "BOYSTYLE", show: "One Piece" },
  { title: "Share the World", artist: "TVXQ", show: "One Piece" },
  // Dragon Ball
  { title: "Dragon Ball Z", artist: "Hironobu Kageyama", show: "Dragon Ball Z" },
  { title: "Limit Break x Survivor", artist: "Kiyoshi Hikawa", show: "Dragon Ball Super" },
  { title: "Cho Zenkai Power!", artist: "Takayoshi Tanimoto", show: "Dragon Ball Super" },
  // Bleach
  { title: "Ichirin no Hana", artist: "HIGH and MIGHTY COLOR", show: "Bleach" },
  { title: "After Dark", artist: "Asian Kung-Fu Generation", show: "Bleach" },
  { title: "Number One", artist: "Hazel Fernandes", show: "Bleach" },
  { title: "Velonica", artist: "Aqua Timez", show: "Bleach" },
  // SAO
  { title: "Ignite", artist: "Eir Aoi", show: "Sword Art Online" },
  { title: "Courage", artist: "Haruka Tomatsu", show: "Sword Art Online" },
  { title: "Swordland", artist: "Yuki Kajiura", show: "Sword Art Online" },
  // My Hero Academia
  { title: "The Day", artist: "Porno Graffitti", show: "My Hero Academia" },
  { title: "Peace Sign", artist: "Kenshi Yonezu", show: "My Hero Academia" },
  { title: "Odd Future", artist: "UVERworld", show: "My Hero Academia" },
  { title: "Polaris", artist: "Brian the Sun", show: "My Hero Academia" },
  { title: "Fumikashi no Niji", artist: "Burnout Syndromes", show: "My Hero Academia" },
  // Demon Slayer
  { title: "Homura", artist: "LiSA", show: "Demon Slayer" },
  { title: "Zankyosanka", artist: "Aimer", show: "Demon Slayer" },
  // Re:Zero
  { title: "Redo", artist: "Konomi Suzuki", show: "Re:Zero" },
  { title: "Paradisus-Paradoxum", artist: "MYTH & ROID", show: "Re:Zero" },
  { title: "Stay Alive", artist: "Rie Takahashi", show: "Re:Zero" },
  // Overlord
  { title: "Clattanoia", artist: "OxT", show: "Overlord" },
  { title: "Go Ahead", artist: "MYTH & ROID", show: "Overlord" },
  // Sword Art Online
  { title: "Anima", artist: "ReoNa", show: "Sword Art Online" },
  // Fairy Tail
  { title: "Snow Fairy", artist: "FUNKIST", show: "Fairy Tail" },
  { title: "Fiesta", artist: "+Plus", show: "Fairy Tail" },
  { title: "Masayume Chasing", artist: "BoA", show: "Fairy Tail" },
  // Black Clover
  { title: "Black Rover", artist: "Vickeblanka", show: "Black Clover" },
  { title: "Sky & Blue", artist: "Tani Yuuki", show: "Black Clover" },
  { title: "JUSTadICE", artist: "Seiko Omori", show: "Black Clover" },
  // Hunter x Hunter
  { title: "Departure!", artist: "Masatoshi Ono", show: "Hunter x Hunter" },
  { title: "Just Awake", artist: "Fear and Loathing in Las Vegas", show: "Hunter x Hunter" },
  // Tokyo Revengers
  { title: "Cry Baby", artist: "Official HIGE DANdism", show: "Tokyo Revengers" },
  { title: "Veil", artist: "Eill", show: "Tokyo Revengers" },
  // Chainsaw Man
  { title: "KICK BACK", artist: "Kenshi Yonezu", show: "Chainsaw Man" },
  // Spy x Family
  { title: "Mixed Nuts", artist: "Official HIGE DANdism", show: "Spy x Family" },
  { title: "Souvenir", artist: "BUMP OF CHICKEN", show: "Spy x Family" },
  // Jujutsu Kaisen
  { title: "VIVID VICE", artist: "Who-ya Extended", show: "Jujutsu Kaisen" },
  // Blue Lock
  { title: "Chaos ga Kimite", artist: "Unison Square Garden", show: "Blue Lock" },
  // Mob Psycho 100
  { title: "99", artist: "MOB CHOIR", show: "Mob Psycho 100" },
  { title: "1", artist: "MOB CHOIR", show: "Mob Psycho 100" },
  // Death Note
  { title: "The World", artist: "Nightmare", show: "Death Note" },
  { title: "What's Up, People?!", artist: "Maximum the Hormone", show: "Death Note" },
  { title: "Alumina", artist: "Nightmare", show: "Death Note" },
  // Code Geass
  { title: "Colors", artist: "FLOW", show: "Code Geass" },
  { title: "O2", artist: "Orange Range", show: "Code Geass" },
  { title: "Hitomi no Tsubasa", artist: "Access", show: "Code Geass" },
  // Fullmetal Alchemist (original)
  { title: "Melissa", artist: "Porno Graffitti", show: "Fullmetal Alchemist" },
  { title: "Ready Steady Go", artist: "L'Arc-en-Ciel", show: "Fullmetal Alchemist" },
  { title: "Rewrite", artist: "Asian Kung-Fu Generation", show: "Fullmetal Alchemist" },
  // Sword Art Online Alternative
  { title: "ADAMAS", artist: "LiSA", show: "Sword Art Online" },
  // Steins Gate
  { title: "Hacking to the Gate", artist: "Kanako Ito", show: "Steins Gate" },
  // No Game No Life
  { title: "Oracion", artist: "Ai Kayano", show: "No Game No Life" },
  // Charlotte
  { title: "Bravely You", artist: "Lia", show: "Charlotte" },
  // Anohana
  { title: "Secret Base", artist: "Zone", show: "Anohana" },
  // Clannad
  { title: "Megumeru", artist: "eufonius", show: "Clannad" },
  { title: "Dango Daikazoku", artist: "Chata", show: "Clannad" },
  // Toradora
  { title: "Pre-Parade", artist: "Rie Kugimiya", show: "Toradora" },
  { title: "Silky Heart", artist: "Yui Horie", show: "Toradora" },
  // Sword Art Online II
  { title: "Startear", artist: "Luna Haruna", show: "Sword Art Online" },
  // SAO Alicization
  { title: "Resister", artist: "ASCA", show: "Sword Art Online" },
  // Guilty Crown
  { title: "My Dearest", artist: "supercell", show: "Guilty Crown" },
  { title: "Euterpe", artist: "Egoist", show: "Guilty Crown" },
  // Angel Beats
  { title: "Crow Song", artist: "Girls Dead Monster", show: "Angel Beats" },
  // Sword Art Online Progressive
  { title: "Thousand Miles Away", artist: "Yuna Yuna", show: "Sword Art Online" },
  // Kimetsu no Yaiba (more)
  { title: "Asa ga Kuru", artist: "Aimer", show: "Demon Slayer" },
  // Shingeki no Kyojin (more)
  { title: "Akuma no Ko", artist: "Ai Higuchi", show: "Attack on Titan" },
  { title: "The Rumbling", artist: "SiM", show: "Attack on Titan" },
  // Kaguya
  { title: "Love is Show", artist: "Masayuki Suzuki", show: "Kaguya-sama Love is War" },
  { title: "Chikatto Chika Chika", artist: "Konomi Kohara", show: "Kaguya-sama Love is War" },
  // Quintessential Quintuplets
  { title: "Gotoubun no Katachi", artist: "Penthouse", show: "The Quintessential Quintuplets" },
  // Bocchi the Rock
  { title: "Kikuri Hiroi no Sake", artist: "Kikuri Hiroi", show: "Bocchi the Rock" },
  { title: "Guitar to Kodoku to Aoi Hoshi", artist: "Bocchi the Rock", show: "Bocchi the Rock" },
  // Violet Evergarden
  { title: "Sincerely", artist: "TRUE", show: "Violet Evergarden" },
  // Your Lie in April
  { title: "Hikaru nara", artist: "Goose House", show: "Your Lie in April" },
  { title: "Watashi ga Iru yo", artist: "Goose House", show: "Your Lie in April" },
  // Sword Art Online (more)
  { title: "Courage", artist: "Haruka Tomatsu", show: "Sword Art Online" },
  // Given
  { title: "Marutade Keisanshiki", artist: "Given", show: "Given" },
  // Yuri on Ice
  { title: "History Maker", artist: "Dean Fujioka", show: "Yuri on Ice" },
  // Haikyuu (more)
  { title: "Fly High!!", artist: "BURNOUT SYNDROMES", show: "Haikyuu" },
  { title: "Hikari Are", artist: "BURNOUT SYNDROMES", show: "Haikyuu" },
  { title: "One Day", artist: "SPYAIR", show: "Haikyuu" },
  // Kuroko no Basket
  { title: "Can Do", artist: "GRANRODEO", show: "Kuroko's Basketball" },
  { title: "Punky Funky Love", artist: "GRANRODEO", show: "Kuroko's Basketball" },
  // Assassination Classroom
  { title: "Seishun Satsubatsuron", artist: "3-nen E-gumi Utatan", show: "Assassination Classroom" },
  // Noragami (more)
  { title: "Goya wa Machiawase", artist: "Hello Sleepwalkers", show: "Noragami" },
  // Danganronpa
  { title: "Never Say Never", artist: "TQ", show: "Danganronpa" },
  // Sword Art Online Ordinal Scale
  { title: "Catch the Moment", artist: "LiSA", show: "Sword Art Online" },
  // Promised Neverland
  { title: "Uso", artist: "SID", show: "Bleach" },
  { title: "Touch Off", artist: "UVERworld", show: "The Promised Neverland" },
  { title: "Zettai Zetsumei", artist: "Cö shu Nie", show: "The Promised Neverland" },
  // Dr Stone
  { title: "Good Morning World!", artist: "BURNOUT SYNDROMES", show: "Dr. Stone" },
  // Dororo
  { title: "Dororo", artist: "ASIAN KUNG-FU GENERATION", show: "Dororo" },
  // Mushishi
  { title: "The Sore Feet Song", artist: "Ally Kerr", show: "Mushishi" },
  // Samurai Champloo
  { title: "Battlecry", artist: "Nujabes", show: "Samurai Champloo" },
  // Trigun
  { title: "H.T.", artist: "Tsuneo Imahori", show: "Trigun" },
  // InuYasha
  { title: "Change the World", artist: "V6", show: "InuYasha" },
  { title: "Grip!", artist: "Every Little Thing", show: "InuYasha" },
  // Ruroni Kenshin
  { title: "Heart of Sword", artist: "T.M.Revolution", show: "Rurouni Kenshin" },
  { title: "Sobakasu", artist: "Judy and Mary", show: "Rurouni Kenshin" },
  // Yu Yu Hakusho
  { title: "Hohoemi no Bakudan", artist: "Mawatari Matsuko", show: "Yu Yu Hakusho" },
  // Card Captor Sakura
  { title: "Platinum", artist: "Maaya Sakamoto", show: "Cardcaptor Sakura" },
  // Sailor Moon
  { title: "Moonlight Densetsu", artist: "DALI", show: "Sailor Moon" },
  // Gurren Lagann
  { title: "Sorairo Days", artist: "Nakagawa Shoko", show: "Gurren Lagann" },
  { title: "Libera Me from Hell", artist: "Taku Iwasaki", show: "Gurren Lagann" },
  // Sword Art Online (GGO)
  { title: "Shokuzai", artist: "Eir Aoi", show: "Sword Art Online" },
  // Psycho-Pass
  { title: "abnormalize", artist: "Ling Tosite Sigure", show: "Psycho-Pass" },
  { title: "Out of Control", artist: "Nothing's Carved in Stone", show: "Psycho-Pass" },
  // Tokyo Ghoul (more)
  { title: "Glassy Sky", artist: "Donna Burke", show: "Tokyo Ghoul" },
  { title: "Phenomeno", artist: "Matsunaga Ryo", show: "Tokyo Ghoul" },
  // Black Butler
  { title: "Lacrimosa", artist: "Kalafina", show: "Black Butler" },
  // Sword Art Online Alicization
  { title: "Forget-Me-Not", artist: "Lisa", show: "Sword Art Online" },
  // Boruto
  { title: "BAKU", artist: "Sangtragedy", show: "Boruto" },
  { title: "Baton Road", artist: "KANA-BOON", show: "Boruto" },
  // Slime
  { title: "Nameless Story", artist: "Takuma Terashima", show: "That Time I Got Reincarnated as a Slime" },
  { title: "Meguru Mono", artist: "TRUE", show: "That Time I Got Reincarnated as a Slime" },
  // Konosuba
  { title: "Fantastic Dreamer", artist: "Machico", show: "KonoSuba" },
  // Danmachi
  { title: "Hey World", artist: "Yuka Iguchi", show: "Is It Wrong to Try to Pick Up Girls in a Dungeon" },
  // Made in Abyss
  { title: "Deep in Abyss", artist: "Miyu Tomita", show: "Made in Abyss" },
  // Sword Art Online (SAO)
  { title: "unlasting", artist: "LiSA", show: "Sword Art Online" },
  // Bleach TYBW
  { title: "STARS", artist: "W.z.s.o.n", show: "Bleach" },
  { title: "Rapport", artist: "Tatsuya Kitani", show: "Bleach" },
];

async function fetchAnime(count: number): Promise<Track[]> {
  // Pick a random subset from the full list
  const picked = shuffle(ANIME_OPENINGS).slice(0, Math.min(count * 3, ANIME_OPENINGS.length));
  console.log(`[deezer] anime: searching ${picked.length} specific openings`);

  const results = await Promise.all(
    picked.map(({ title, artist, show }) =>
      deezerSearch(`track:"${title}" artist:"${artist}"`)
        .then((tracks) => {
          const t = tracks[0];
          if (!t) return null;
          const r = toTrack(t);
          if (!r) return null;
          r.animeName = show;
          return r;
        })
    )
  );

  const tracks = results.flatMap((r) => r ? [r] : []);

  const seen = new Set<string>();
  const unique = tracks.filter((t) => { if (seen.has(t.id)) return false; seen.add(t.id); return true; });
  console.log(`[deezer] anime: got ${unique.length} tracks with previews`);
  return shuffle(unique).slice(0, count);
}

export async function fetchTracksByGenre(genre: string, count: number): Promise<Track[]> {
  let raw: DeezerTrack[];

  if (genre === "anime") {
    return fetchAnime(count);
  }

  const genreId = GENRE_IDS[genre] ?? 0;
  const idx = randomIndex();
  console.log(`[deezer] fetching chart + search for genre "${genre}" (index=${idx})`);

  // Combine chart (consistent top hits) + random search page (variety)
  const [chartTracks, searchTracks] = await Promise.all([
    deezerChart(genreId),
    deezerSearch(genre, idx),
  ]);

  raw = [...chartTracks, ...searchTracks];

  // Deduplicate by id
  const seen = new Set<string>();
  const unique = raw.filter((t) => { if (seen.has(String(t.id))) return false; seen.add(String(t.id)); return true; });

  const tracks = unique.flatMap((t) => { const r = toTrack(t); return r ? [r] : []; });
  console.log(`[deezer] got ${tracks.length} unique tracks with previews`);
  return shuffle(tracks).slice(0, count);
}

export async function fetchTracksByPlaylist(playlistId: string, count: number): Promise<Track[]> {
  const url = `https://api.deezer.com/playlist/${playlistId}/tracks?limit=100`;
  console.log(`[deezer] GET ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Deezer playlist error ${res.status}`);
  const data = (await res.json()) as DeezerSearchResponse;
  const tracks = data.data.flatMap((t) => { const r = toTrack(t); return r ? [r] : []; });
  return shuffle(tracks).slice(0, count);
}

export async function fetchTracks(
  genre: string | null,
  playlistId: string | null,
  count: number
): Promise<Track[]> {
  if (playlistId) return fetchTracksByPlaylist(playlistId, count);
  return fetchTracksByGenre(genre ?? "pop", count);
}

export const AVAILABLE_GENRES = [
  "pop", "rock", "hip-hop", "electronic", "r-n-b",
  "french", "latin", "jazz", "metal", "classical",
  "reggae", "country", "indie", "soul", "disco", "k-pop", "anime",
] as const;
