/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // PostgreSQL bağlantısında sorun olmaması için
    experimental: {
        serverComponentsExternalPackages: ['pg']
    }
};

export default nextConfig;
