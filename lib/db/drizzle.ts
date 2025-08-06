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
let connectionString = process.env.POSTGRES_URL;

// For Supabase, try connection pooler if direct connection fails
const isSupabase = connectionString.includes('supabase.co');
if (isSupabase && process.env.NODE_ENV === 'production') {
  // Try to convert to pooler URL for better Vercel compatibility
  // Example: postgresql://user:pass@db.xxx.supabase.co:5432/postgres
  // Becomes: postgresql://user:pass@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
  const poolerUrl = connectionString
    .replace(/db\.([^\.]+)\.supabase\.co:5432/, 'aws-0-ap-southeast-1.pooler.supabase.com:6543')
    .replace('?', '?pgbouncer=true&');
  
  console.log('Using Supabase connection pooler for production');
  connectionString = poolerUrl;
}

// Only log connection info once during startup
if (!(globalThis as any).dbConnectionLogged) {
  console.log('Database connection info:', {
    host: connectionString.includes('supabase.co') ? 'Supabase' : 'Other',
    isPooler: connectionString.includes('pooler.supabase.com'),
    environment: process.env.NODE_ENV,
    hasConnectionString: !!connectionString,
    connectionStringPrefix: connectionString.substring(0, 50) + '...'
  });
  (globalThis as any).dbConnectionLogged = true;
}

const client = postgres(connectionString, {
  prepare: false,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 1, // Limit connections for serverless
  idle_timeout: 20,
  max_lifetime: 60 * 30, // 30 minutes
  connect_timeout: 60, // Increase timeout further for Vercel
  transform: postgres.camel,
  onnotice: () => {}, // Disable notice logs
  // Disable some features for better compatibility
  fetch_types: false,
  publications: 'supabase_realtime',
  types: {
    bigint: postgres.BigInt
  },
  // Add connection retry logic
  connection: {
    application_name: 'roommate-matching-system'
  }
});

// Test connection and provide helpful error messages
if (process.env.NODE_ENV === 'production') {
  client`SELECT 1`.catch((err) => {
    console.error('Database connection test failed:', {
      error: err.message,
      code: err.code,
      host: connectionString.includes('supabase.co') ? 'Supabase' : 'Other',
      isPooler: connectionString.includes('pooler.supabase.com'),
      suggestion: isSupabase ? 'Try using connection pooler or check Supabase project status' : 'Check database server status'
    });
  });
}

export { client };
export const db = drizzle(client, { schema });
