import duckdb from 'duckdb';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../../../../data/ontology.db');

export async function initializeDuckDB() {
    const db = new duckdb.Database(DB_PATH);
    const connection = db.connect();
    
    // Create tables if they don't exist
    await connection.run(`
        CREATE TABLE IF NOT EXISTS superclasses (
            id TEXT PRIMARY KEY,
            name TEXT,
            description TEXT,
            attributes JSON,
            relationships JSON
        )
    `);
    
    await connection.run(`
        CREATE TABLE IF NOT EXISTS subclasses (
            id TEXT PRIMARY KEY,
            superclass_id TEXT REFERENCES superclasses(id),
            name TEXT,
            description TEXT,
            attributes JSON,
            relationships JSON
        )
    `);
    
    await connection.run(`
        CREATE TABLE IF NOT EXISTS ontology_rules (
            id TEXT PRIMARY KEY,
            rule_text TEXT
        )
    `);

    return connection;
} 