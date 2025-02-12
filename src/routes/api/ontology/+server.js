import { initializeDuckDB } from '$lib/server/duckdb.js';

export async function GET() {
    try {
        return new Response(JSON.stringify({ success: true }), {
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
    } catch (error) {
        console.error('GET Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function POST({ request }) {
    try {
        const data = await request.json();
        const connection = await initializeDuckDB();
        
        // Start transaction
        await connection.run('BEGIN TRANSACTION');
        
        // Clear all existing data
        await connection.run('DELETE FROM superclasses');
        await connection.run('DELETE FROM subclasses');
        await connection.run('DELETE FROM ontology_rules');

        // Insert superclasses
        for (const [idx, superclass] of data.ontology.superclasses.entries()) {
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
        for (const [idx, rule] of data.ontology.rules.entries()) {
            await connection.run(
                `INSERT INTO ontology_rules (id, rule_text)
                 VALUES ($1, $2)`,
                [`rule-${idx}`, rule]
            );
        }

        await connection.run('COMMIT');

        await connection.close();
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('API Error:', error);
        await connection?.run('ROLLBACK');
        return new Response(JSON.stringify({ error: 'Database update failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
} 