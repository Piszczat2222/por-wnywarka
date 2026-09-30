/**
 * Consolidate legacy /reviews?type=&cat= filter URLs onto the canonical /reviews page.
 * UI filters use hash (#type=…&cat=…); query variants should not compete in the index.
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (
    url.pathname === '/reviews' &&
    (url.searchParams.has('type') || url.searchParams.has('cat'))
  ) {
    return Response.redirect(new URL('/reviews', url.origin), 301);
  }

  return context.next();
}
