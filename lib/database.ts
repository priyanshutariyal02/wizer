import { neon } from "@neondatabase/serverless";

export interface DatabaseConnection {
  query: (strings: TemplateStringsArray, ...values: any[]) => Promise<any[]>;
}

export function getDatabaseConnection(): DatabaseConnection {
  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('postgres')) {
    throw new Error('DATABASE_URL must be set to a valid NeonDB/Postgres connection string.');
  }
  const sql = neon(process.env.DATABASE_URL);
  return {
    query: sql
  };
} 