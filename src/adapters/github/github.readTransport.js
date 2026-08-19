export async function fetchGithubJson(url, fetchImpl) {
  if (typeof fetchImpl !== 'function') throw new Error('github-read-fetch-unavailable');
  const res = await fetchImpl(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res || !res.ok) {
    const status = res?.status || 0;
    const statusText = res?.statusText || '';
    let bodyMessage = '';
    try { const body = await res.json(); bodyMessage = body?.message ? String(body.message) : ''; } catch (_) {}
    const err = new Error([status ? `GitHub API ${status}` : 'GitHub API', statusText, bodyMessage].filter(Boolean).join(' ').trim() || 'GitHub API request failed');
    err.status = status;
    err.statusText = statusText;
    err.url = url;
    throw err;
  }
  const body = await res.json();
  if (body && typeof body === 'object' && !Array.isArray(body)) body.transportTier = res.transportTier || '';
  return body;
}
