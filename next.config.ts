import type { NextConfig } from "next";
const preview = process.env.SITE_STATIC_PREVIEW === "1";
const config: NextConfig = {
  output: preview ? "export" : "standalone",
  ...(preview ? { images: { unoptimized: true }, trailingSlash: true } : {}),
  poweredByHeader: false,
  reactStrictMode: true,
  ...(preview
    ? {}
    : {
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                {
                  key: "Referrer-Policy",
                  value: "strict-origin-when-cross-origin",
                },
                { key: "X-Frame-Options", value: "DENY" },
                {
                  key: "Permissions-Policy",
                  value: "camera=(), microphone=(), geolocation=()",
                },
                {
                  key: "Content-Security-Policy",
                  value:
                    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
                },
              ],
            },
          ];
        },
      }),
};
export default config;
