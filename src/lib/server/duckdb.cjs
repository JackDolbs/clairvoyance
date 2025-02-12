const { DuckDBInstance } = require('@duckdb/node-api');
const fs = require('fs');
const path = require('path');

async function initializeDuckDB() {
    // Create data directory
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Initialize database
    const instance = await DuckDBInstance.create(path.join(dataDir, 'ontology.db'));
    const connection = await instance.connect();

    // Create table
    await connection.run(`
        CREATE TABLE IF NOT EXISTS ontology (
            id TEXT PRIMARY KEY,
            name TEXT,
            description TEXT
        );
    `);

    // Add this before closing the connection
    await connection.run(`
        INSERT INTO ontology (id, name, description)
        VALUES ('test', 'Test Entry', 'Initialization verification')
    `);

    // Close connection
    await connection.close();
    return instance;
}

module.exports = { initializeDuckDB }; 