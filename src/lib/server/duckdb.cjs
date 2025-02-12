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

    // Create normalized tables
    await connection.run(`
        CREATE TABLE IF NOT EXISTS superclasses (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            attributes JSON,
            relationships JSON
        );
        
        CREATE TABLE IF NOT EXISTS subclasses (
            id TEXT PRIMARY KEY,
            superclass_id TEXT REFERENCES superclasses(id),
            name TEXT NOT NULL,
            description TEXT,
            attributes JSON,
            relationships JSON
        );
        
        CREATE TABLE IF NOT EXISTS ontology_rules (
            id TEXT PRIMARY KEY,
            rule_text TEXT NOT NULL
        );
    `);

    return connection;
}

async function loadOntologySchema(connection) {
    const ontologyPath = path.join(__dirname, '../../routes/(app)/ontology/ontology.json');
    const ontology = require(ontologyPath).ontology;
    
    // Clear existing data
    await connection.run('DELETE FROM superclasses');
    await connection.run('DELETE FROM subclasses');
    await connection.run('DELETE FROM ontology_rules');

    // Insert superclasses
    for (const [idx, superclass] of ontology.superclasses.entries()) {
        await connection.run(
            `INSERT INTO superclasses (id, name, description, attributes, relationships)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                `sc-${idx}`,
                superclass.name,
                superclass.description,
                JSON.stringify(superclass.attributes || []),
                JSON.stringify(superclass.relationships || [])
            ]
        );

        // Insert subclasses
        for (const [sIdx, subclass] of (superclass.subclasses || []).entries()) {
            await connection.run(
                `INSERT INTO subclasses (id, superclass_id, name, description, attributes, relationships)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    `sub-${idx}-${sIdx}`,
                    `sc-${idx}`,
                    subclass.name,
                    subclass.description,
                    JSON.stringify(subclass.attributes || []),
                    JSON.stringify(subclass.relationships || [])
                ]
            );
        }
    }

    // Insert rules
    for (const [idx, rule] of ontology.rules.entries()) {
        await connection.run(
            `INSERT INTO ontology_rules (id, rule_text)
             VALUES ($1, $2)`,
            [`rule-${idx}`, rule]
        );
    }
}

module.exports = { 
    initializeDuckDB: async () => {
        const connection = await initializeDuckDB();
        await loadOntologySchema(connection);
        await connection.close();
        return true;
    }
}; 