const { initializeDuckDB } = require('../src/lib/server/duckdb.cjs');

async function main() {
    try {
        await initializeDuckDB();
        console.log('Ontology database initialized with schema');
    } catch (error) {
        console.error('Initialization failed:', error);
        process.exit(1);
    }
}

main();