// Cloudflare Pages Functions: e-Gov法令API v2 リバースプロキシ
export async function onRequest(context: any): Promise<Response> {
  const { request, params } = context;
  const url = new URL(request.url);

  // /api/egov 以降のパスとクエリを e-Gov API v2 にフォワード
  const targetPath = Array.isArray(params.path) ? params.path.join('/') : (params.path || '');
  const targetUrl = `https://laws.e-gov.go.jp/api/2/${targetPath}${url.search}`;

  const forwardHeaders = new Headers(request.headers);
  forwardHeaders.set('Accept', 'application/json, text/xml, application/xml, */*');
  forwardHeaders.delete('host');

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', '*');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Proxy Error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
