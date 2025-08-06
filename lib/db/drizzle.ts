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

console.log('Database connection info:', {
  host: connectionString.includes('supabase.co') ? 'Supabase' : 'Other',
  environment: process.env.NODE_ENV,
  hasConnectionString: !!connectionString,
});

const client = postgres(connectionString, {
  prepare: false,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 1, // Limit connections for serverless
  idle_timeout: 20,
  max_lifetime: 60 * 30, // 30 minutes
  connection: {
    application_name: 'roommate-matching-system'
  },
  // Add retry logic for connection failures
  connect_timeout: 10,
  socket_timeout: 0,
  transform: postgres.camel,
  onnotice: () => {}, // Disable notice logs
});

// Test connection on startup
client`SELECT 1`.catch((err) => {
  console.error('Database connection test failed:', err.message);
});

export { client };
export const db = drizzle(client, { schema });
