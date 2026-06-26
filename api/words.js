// api/words.js — Vercel Serverless Function
// Coge palabras aleatorias de un diccionario público de español

const DICTIONARY_URL =
  "https://raw.githubusercontent.com/words/an-array-of-spanish-words/master/index.json";

const WORDS_PER_GAME = 10;
const MIN_LENGTH = 3;
const MAX_LENGTH = 14;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const response = await fetch(DICTIONARY_URL);
    if (!response.ok) throw new Error(`Dictionary fetch failed: ${response.status}`);
    const all = await response.json();

    // Filtrar por longitud y que solo tengan letras (sin tildes raras ni símbolos)
    const filtered = all.filter(w =>
      w.length >= MIN_LENGTH &&
      w.length <= MAX_LENGTH &&
      /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]+$/.test(w)
    );

    const selected = shuffle([...filtered])
      .slice(0, WORDS_PER_GAME)
      .map(w => w.toUpperCase());

    return res.status(200).json({ words: selected, count: selected.length });
  } catch (err) {
    console.error("Error fetching words:", err);
    return res.status(500).json({ error: "No se pudieron cargar las palabras", detail: err.message });
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

