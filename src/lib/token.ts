// Join-token generation for shared sessions. A host generates one and shares it;
// joiners must present it. Readable, copy-pasteable codes — grouped, and using an
// alphabet without ambiguous characters (no I/L/O/0/1) so they survive being read
// aloud or retyped.

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 31 chars, no look-alikes

/** A grouped join code, e.g. "K7P2-9XQ4-MN3R" (~60 bits of entropy). */
export function generateJoinToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
    if (i % 4 === 3 && i < bytes.length - 1) out += '-';
  }
  return out;
}
