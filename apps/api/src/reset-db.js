import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const databasePath = path.resolve(process.cwd(), process.env.DATABASE_PATH || './data/djangue.db');

if (fs.existsSync(databasePath)) {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question('Réinitialiser la base Djangue ? Cette action est irreversible. [oui/N] ');
  rl.close();

  if (answer.trim().toLowerCase() !== 'oui') {
    console.log('Réinitialisation annulée.');
    process.exit(0);
  }

  for (const suffix of ['', '-wal', '-shm']) {
    const file = `${databasePath}${suffix}`;
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
}

const { seedDatabase } = await import('./seed.js');
const { db } = await import('./db.js');
seedDatabase();
db.close();
console.log('Base Djangue réinitialisée.');
