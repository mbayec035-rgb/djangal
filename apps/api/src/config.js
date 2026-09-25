import fs from 'node:fs';
import path from 'node:path';

for (const candidate of [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
]) {
  if (fs.existsSync(candidate) && typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile(candidate);
      break;
    } catch {
      // Environment variables already present in the process take precedence.
    }
  }
}
