const WIDTH = 17;
const HEIGHT = 9;
const GLYPHS = " .o+=*BOX@%&#/^";

export async function generateRandomArt(seed) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto is required to generate Randomart.");
  }

  const encoded = new TextEncoder().encode(seed);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  const bytes = new Uint8Array(digest);

  const board = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(0));

  const start = {
    x: Math.floor(WIDTH / 2),
    y: Math.floor(HEIGHT / 2),
  };

  let x = start.x;
  let y = start.y;

  for (const byte of bytes) {
    for (let shift = 0; shift < 8; shift += 2) {
      const direction = (byte >> shift) & 0b11;

      x += direction & 1 ? 1 : -1;
      y += direction & 2 ? 1 : -1;

      x = Math.max(0, Math.min(WIDTH - 1, x));
      y = Math.max(0, Math.min(HEIGHT - 1, y));

      board[y][x] = Math.min(board[y][x] + 1, GLYPHS.length - 1);
    }
  }

  const end = { x, y };

  return board
    .map((row, rowIndex) =>
      row
        .map((visits, columnIndex) => {
          if (columnIndex === end.x && rowIndex === end.y) {
            return "E";
          }

          if (columnIndex === start.x && rowIndex === start.y) {
            return "S";
          }

          return GLYPHS[visits];
        })
        .join(""),
    )
    .join("\n");
}
