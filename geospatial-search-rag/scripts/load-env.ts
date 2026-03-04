/**
 * Load .env.local before any other imports that read process.env.
 * Must be the first import in scripts.
 */
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });
config();
