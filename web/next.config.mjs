const strapiUrl = (process.env.STRAPI_PUBLIC_URL || process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [new URL(`${strapiUrl}/uploads/**`)],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Only the Strapi admin may show the site in a frame (its preview pane).
          { key: 'Content-Security-Policy', value: `frame-ancestors 'self' ${strapiUrl}` },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
