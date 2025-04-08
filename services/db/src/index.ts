import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
const { Pool } = pg;
import { DatabaseSchema, EnvValidator } from "@opstd/env-validator";
import { sql } from "drizzle-orm";
import { createLogger } from "@opstd/logger";

const logger = createLogger({ serviceName: "@opstd/db" });
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 seconds

const envValidator = new EnvValidator(DatabaseSchema.innerType());
envValidator.validate();

const dbEnv = DatabaseSchema.parse(envValidator.env);

// Configure pool with better defaults and timeouts
const pool = new Pool({
  connectionString: dbEnv.DATABASE_URL,
  max: 20, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // how long to wait before timing out when connecting a new client
  maxUses: 7500, // close & replace a connection after it's been used this many times (prevents memory leaks)
});

// Handle pool errors
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', { error: err.message });
});

// Create a function to check database health
async function healthCheck(): Promise<boolean> {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    logger.error('Database health check failed', { error: err instanceof Error ? err.message : String(err) });
    return false;
  }
}

// Initialize database connection with retries
async function initializeDatabase(): Promise<void> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await healthCheck();
      logger.info('Database connection established successfully');
      return;
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        logger.error('Failed to connect to database after maximum retries', {
          error: err instanceof Error ? err.message : String(err),
          attempts: MAX_RETRIES
        });
        throw err;
      }
      logger.warn('Failed to connect to database, retrying...', {
        attempt,
        nextRetryIn: RETRY_DELAY
      });
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
}

// Create drizzle instance with logging based on environment
export const db: NodePgDatabase = drizzle(pool, {
  logger: envValidator.env.APP_MODE !== "production",
});

// Initialize database with extensions and triggers
export async function up(db: NodePgDatabase): Promise<void> {
  try {
    await db.execute(sql`SELECT extensions.add_moddatetime_triggers();`);
    logger.info('Database extensions and triggers initialized successfully');
  } catch (err) {
    logger.error('Failed to initialize database extensions', {
      error: err instanceof Error ? err.message : String(err)
    });
    throw err;
  }
}

// Graceful shutdown function
export async function shutdown(): Promise<void> {
  try {
    await pool.end();
    logger.info('Database connection pool closed successfully');
  } catch (err) {
    logger.error('Error during pool shutdown', {
      error: err instanceof Error ? err.message : String(err)
    });
    throw err;
  }
}

// Export additional utilities
export {
  healthCheck,
  initializeDatabase,
  pool,
};
