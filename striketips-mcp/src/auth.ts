export function checkApiKey(request: Request, env: Env): Response | null {
  const apiKey = request.headers.get('X-API-Key');
  const expectedKey = env.API_KEY;

  if (!expectedKey) {
    return null;
  }

  if (!apiKey || apiKey !== expectedKey) {
    return new Response('Unauthorized: Invalid or missing API key', {
      status: 401,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return null;
}
