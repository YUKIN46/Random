import { NextRequest, NextResponse } from "next/server";
import { getSlugFromHost } from "@/lib/tenant";

// Next.js 16 renamed `middleware` to `proxy` (runs on the nodejs runtime,
// not edge). We still keep this lightweight — just extracting the slug and
// rewriting the URL — and let the actual "does this org exist / is it
// approved" check happen in the (org)/[slug] layout.

export function proxy(req: NextRequest) {
  const host = req.headers.get("host");
  const slug = getSlugFromHost(host);
  const url = req.nextUrl;

  const requestHeaders = new Headers(req.headers);
  if (slug) requestHeaders.set("x-org-slug", slug);

  // Rewrite tenant subdomains into the /org/[slug] route group so
  // greenwood.schoolms.io/dashboard -> /org/greenwood/dashboard internally,
  // while the URL bar still shows the clean subdomain path.
  if (slug && !url.pathname.startsWith("/org/")) {
    const rewrittenUrl = url.clone();
    rewrittenUrl.pathname = `/org/${slug}${url.pathname}`;
    return NextResponse.rewrite(rewrittenUrl, {
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes that don't need tenant rewriting (still get the header)
     * - static files, _next internals
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
