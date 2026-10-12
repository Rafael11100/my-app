import * as Crypto from 'expo-crypto';

/** SHA-256 com saída hexadecimal em maiúsculas/minúsculas padrão. */
export function sha256Hex(input: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input);
}
