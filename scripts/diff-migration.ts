import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv(filePath: string) {
  if (fs.existsSync(filePath)) {
    const envConfig = fs.readFileSync(filePath, 'utf8');
    envConfig.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
          value = value.replace(/^"|"$/g, '');
        }
        process.env[key] = value;
      }
    });
  }
}

loadEnv(path.resolve(process.cwd(), ".env"));

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error("No DATABASE_URL");

console.log("Generating migration script...");
const result = execSync(`npx prisma migrate diff --from-url "${dbUrl}" --to-schema-datamodel prisma/schema.prisma --script`).toString();

const timestamp = new Date().toISOString().replace(/\D/g, '').substring(0, 14);
const folder = `prisma/migrations/${timestamp}_init_historical_cases`;
fs.mkdirSync(folder, { recursive: true });
fs.writeFileSync(`${folder}/migration.sql`, result);
console.log(`Migration created at ${folder}/migration.sql`);
