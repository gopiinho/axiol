const ALGORITHM = "AES-GCM";
const IV_LENGTH = 12;

function getKey(): Promise<CryptoKey> {
  const hex = process.env.INSTAGRAM_TOKEN_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "INSTAGRAM_TOKEN_ENCRYPTION_KEY must be a 64-character hex string",
    );
  }
  const keyBytes = new Uint8Array(
    hex.match(/.{2}/g)!.map((b) => parseInt(b, 16)),
  );
  return crypto.subtle.importKey("raw", keyBytes, ALGORITHM, false, [
    "encrypt",
    "decrypt",
  ]);
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  return new Uint8Array(hex.match(/.{2}/g)!.map((b) => parseInt(b, 16)));
}

export async function encryptToken(plaintext: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded,
  );
  return `${toHex(iv.buffer)}:${toHex(ciphertext)}`;
}

export async function decryptToken(encrypted: string): Promise<string> {
  const [ivHex, ciphertextHex] = encrypted.split(":");
  if (!ivHex || !ciphertextHex) {
    throw new Error("Invalid encrypted token format");
  }
  const key = await getKey();
  const iv = fromHex(ivHex);
  const ciphertext = fromHex(ciphertextHex);
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: iv as Uint8Array<ArrayBuffer> },
    key,
    ciphertext as Uint8Array<ArrayBuffer>,
  );
  return new TextDecoder().decode(decrypted);
}
