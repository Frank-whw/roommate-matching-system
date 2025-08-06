import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

// Only load .env in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

// Configure postgres client with better error handling for Vercel
const connectionString = process.env.POSTGRES_URL;
const client = postgres(connectionString, {
  prepare: false,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 1, // Limit connections for serverless
});

export { client };
export const db = drizzle(client, { schema });
