/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        // This is experimental but can help with bundle size
        outputFileTracingRoot: process.cwd(),
    },
};

export default nextConfig;
