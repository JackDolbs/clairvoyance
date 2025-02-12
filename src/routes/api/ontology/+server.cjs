import { initializeDuckDB } from '$lib/server/duckdb.cjs';

export async function POST({ request }) {
    try {
        const data = await request.json();
        const connection = await initializeDuckDB();
        
        // Clear existing data
        await connection.exec('DELETE FROM ontology');
        
        // Insert new data
        await connection.run(
            `INSERT INTO ontology (id, name, description)
             VALUES ($1, $2, $3)`,
            [data.id, data.name, data.description]
        );
        
        await connection.close();
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ error: 'Database update failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
} 