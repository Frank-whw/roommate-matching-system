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

// Only log connection info once during startup
if (!(globalThis as any).dbConnectionLogged) {
  console.log('Database connection info:', {
    host: connectionString.includes('supabase.co') ? 'Supabase' : 'Other',
    environment: process.env.NODE_ENV,
    hasConnectionString: !!connectionString,
    connectionStringPrefix: connectionString.substring(0, 30) + '...'
  });
  (globalThis as any).dbConnectionLogged = true;
}

const client = postgres(connectionString, {
  prepare: false,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 1, // Limit connections for serverless
  idle_timeout: 20,
  max_lifetime: 60 * 30, // 30 minutes
  connect_timeout: 30, // Increase timeout for Vercel
  transform: postgres.camel,
  onnotice: () => {}, // Disable notice logs
  // Add retry logic for DNS resolution issues
  fetch_types: false,
  publications: 'supabase_realtime',
  types: {
    bigint: postgres.BigInt
  }
});

export { client };
export const db = drizzle(client, { schema });
