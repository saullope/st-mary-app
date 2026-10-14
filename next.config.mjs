import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    experimental: {
        // La caché de Turbopack en disco (activa por defecto desde Next 16.1) restauraba
        // al arrancar una lista de rutas vieja: /auth/* y rutas nuevas respondían 404
        // hasta que se guardaba algún archivo. Sin ella el arranque es algo más lento.
        turbopackFileSystemCacheForDev: false,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com'
            },
            {
                protocol: 'https',
                hostname: 'i.ytimg.com'
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com'
            },
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com'
            }
        ],
        deviceSizes: [640, 768, 1024, 1280, 1600],
        imageSizes: [16, 32, 48, 64, 96],
    }
};

export default withNextIntl(nextConfig);