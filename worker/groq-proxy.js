/**
 * Cloudflare Worker: Groq API Proxy
 *
 * Proxies requests to the Groq API, keeping the API key secure.
 * Deploy to Cloudflare Workers and set GROQ_API_KEY as an environment secret.
 *
 * Deployment:
 * 1. Install Wrangler CLI: npm install -g wrangler
 * 2. Login: wrangler login
 * 3. Set secret: wrangler secret put GROQ_API_KEY
 * 4. Deploy: wrangler deploy
 */

// Configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const MAX_TOKENS = 1024;

// Allowed origins
const ALLOWED_ORIGINS = [
    'https://jvkuechen.github.io',
    'https://jvkuechen.com',
    'https://www.jvkuechen.com',
    'https://setcookie.dev',
    'https://www.setcookie.dev',
    'http://localhost:8000',
    'http://127.0.0.1:8000'
];

export default {
    async fetch(request, env, ctx) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return handleCORS(request);
        }

        // Only allow POST to /chat
        const url = new URL(request.url);
        if (request.method !== 'POST' || url.pathname !== '/chat') {
            return new Response('Not Found', { status: 404 });
        }

        // Check origin
        const origin = request.headers.get('Origin');
        if (!isAllowedOrigin(origin)) {
            return new Response('Forbidden', { status: 403 });
        }

        try {
            // Parse request body
            const body = await request.json();

            if (!body.messages || !Array.isArray(body.messages)) {
                return new Response(
                    JSON.stringify({ error: 'Invalid request: messages array required' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }

            // Call Groq API
            const groqResponse = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: body.model || DEFAULT_MODEL,
                    messages: body.messages,
                    max_tokens: body.max_tokens || MAX_TOKENS,
                    temperature: body.temperature || 0.7
                })
            });

            if (!groqResponse.ok) {
                const errorText = await groqResponse.text();
                console.error('Groq API error:', errorText);
                return new Response(
                    JSON.stringify({ error: 'API request failed' }),
                    {
                        status: groqResponse.status,
                        headers: getCORSHeaders(origin)
                    }
                );
            }

            const data = await groqResponse.json();

            return new Response(JSON.stringify(data), {
                status: 200,
                headers: getCORSHeaders(origin)
            });

        } catch (error) {
            console.error('Worker error:', error);
            return new Response(
                JSON.stringify({ error: 'Internal server error' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }
};

function isAllowedOrigin(origin) {
    if (!origin) return false;
    return ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
}

function getCORSHeaders(origin) {
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };
}

function handleCORS(request) {
    const origin = request.headers.get('Origin');
    return new Response(null, {
        status: 204,
        headers: getCORSHeaders(origin)
    });
}
