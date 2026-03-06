/**
 * Load .env and .env.local before any other imports that read process.env.
 * Must be the first import in scripts.
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });
