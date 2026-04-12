export default async function handler(req, res) {
    // CORS headers - permite chamadas de qualquer origem (bookmarklet)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Missing query' });
        }

        const NEON_SQL_URL = "https://ep-gentle-hall-amii66wb-pooler.c-5.us-east-1.aws.neon.tech/sql";
        const NEON_CONN = "postgresql://neondb_owner:npg_lWzA8uLghEU0@ep-gentle-hall-amii66wb-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";

        const response = await fetch(NEON_SQL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Neon-Connection-String': NEON_CONN
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();
        return res.status(response.ok ? 200 : 500).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
