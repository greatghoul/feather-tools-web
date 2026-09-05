// Cloudflare Pages Function replacing the old Flask /api/link-meta endpoint.
// Fetches a user-supplied URL server-side (bypassing CORS), follows redirects,
// and extracts the page <title> from the first 1 MB of the response.
//
// Route: GET /api/link-meta?url=<encoded-url>
// Response: { title, url } or { error } with status 400.

const MAX_BYTES = 1024 * 1024;
const TIMEOUT_MS = 5000;

interface RequestContext {
    request: Request;
}

function jsonResponse(body: Record<string, string>, status: number): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
}

async function readUpTo(response: Response, maxBytes: number): Promise<string> {
    const reader = response.body?.getReader();
    if (!reader) return '';
    const chunks: Uint8Array[] = [];
    let received = 0;
    while (received < maxBytes) {
        const { done, value } = await reader.read();
        if (done || !value) break;
        chunks.push(value);
        received += value.length;
    }
    try {
        await reader.cancel();
    } catch {
        // ignore cancel errors
    }
    const merged = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
    }
    return new TextDecoder('utf-8').decode(merged);
}

export const onRequestGet = async ({ request }: RequestContext): Promise<Response> => {
    const rawUrl = new URL(request.url).searchParams.get('url');
    if (!rawUrl) {
        return jsonResponse({ error: 'Missing "url" query parameter' }, 400);
    }

    let target: URL;
    try {
        target = new URL(rawUrl);
    } catch {
        return jsonResponse({ error: 'Invalid URL' }, 400);
    }
    if (target.protocol !== 'http:' && target.protocol !== 'https:') {
        return jsonResponse({ error: 'Only http(s) URLs are supported' }, 400);
    }

    try {
        const response = await fetch(target, {
            redirect: 'follow',
            signal: AbortSignal.timeout(TIMEOUT_MS),
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; FeatherToolsBot/1.0; +https://feather-tools.com)',
                Accept: 'text/html,*/*;q=0.8',
            },
        });
        if (!response.ok) {
            return jsonResponse({ error: `Failed to fetch URL (HTTP ${response.status})` }, 400);
        }

        const html = await readUpTo(response, MAX_BYTES);
        const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        let title = titleMatch ? titleMatch[1].trim() : '';
        if (!title) {
            // Fall back to the last path segment or the hostname, like the old endpoint.
            const path = target.pathname.replace(/\/+$/, '');
            const lastSegment = path.split('/').pop() ?? '';
            title = lastSegment ? decodeURIComponent(lastSegment) : target.hostname;
        }

        return jsonResponse({ title, url: response.url || target.toString() }, 200);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return jsonResponse({ error: `Failed to fetch URL: ${message}` }, 400);
    }
};
