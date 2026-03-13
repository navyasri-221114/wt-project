import Database from "better-sqlite3";
import path from "path";

// Initialize the SQLite database connection
const dbPath = path.resolve(process.cwd(), "placement.db");
const db = new Database(dbPath, { verbose: console.log });

console.log(`Database connected successfully at ${dbPath}`);

export default db;
