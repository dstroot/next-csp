import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // note: style-src requires 'unsafe-inline' mode because next/image adds inline styles.
  //       this means I can't use the nonce.
  // https://github.com/vercel/next.js/discussions/54907
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${
    process.env.NODE_ENV === "production" ? "" : `'unsafe-eval'`
  };
    connect-src 'self' https://www.google-analytics.com https://vitals.vercel-insights.com ;
    style-src 'self' 'unsafe-inline'; 
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-src 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
`;

  const requestHeaders = new Headers();
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set(
    "Content-Security-Policy",
    cspHeader.replace(/\s{2,}/g, " ").trim()
  );
  // Referrer Policy is a header that allows a site to control how much information the browser includes with navigations away from a document and should be set by all sites.
  requestHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // X-Frame-Options tells the browser whether you want to allow your site to be framed or not. By preventing a browser from framing your site you can defend against attacks like clickjacking.
  requestHeaders.set("X-Frame-Options", "SAMEORIGIN");
  // X-Content-Type-Options stops a browser from trying to MIME-sniff the content type and forces it to stick with the declared content-type. The only valid value for this header is "X-Content-Type-Options: nosniff".
  requestHeaders.set("X-Content-Type-Options", "nosniff");
  // requestHeaders.set("X-DNS-Prefetch-Control", "on");
  // requestHeaders.set(
  //   "Strict-Transport-Security",
  //   "max-age=31536000; includeSubDomains; preload"
  // );
  // Permissions-Policy header blocks access to the camera, microphone and geolocation services.
  requestHeaders.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  // requestHeaders.set(
  //   "Access-Control-Allow-Origin",
  //   process.env.NODE_ENV === "production"
  //     ? "'https://www.danstroot.com'"
  //     : "'http://localhost:3000/'"
  // );
  requestHeaders.set("Vary", "Origin");
  // Cross-Origin Embedder Policy allows a site to prevent assets being loaded that do not grant permission to load them via CORS or CORP.
  requestHeaders.set("Cross-Origin-Embedder-Policy", "unsafe-none");
  // Cross-Origin Opener Policy allows a site to opt-in to Cross-Origin Isolation in the browser.
  requestHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
  // Cross-Origin Resource Policy allows a resource owner to specify who can load the resource.
  requestHeaders.set("Cross-Origin-Resource-Policy", "cross-origin");

  return NextResponse.next({
    headers: requestHeaders,
    request: {
      headers: requestHeaders,
    },
  });
}
