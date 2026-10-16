import { networkInterfaces } from 'node:os';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

// En desarrollo Next bloquea los recursos /_next/* pedidos desde otro host que no sea
// localhost: al abrir la app desde el celular por la URL "Network" la página carga pero
// no se hidrata (no responde a los toques). Se permiten solo las IP de red de esta máquina.
const localNetworkHosts = Object.values(networkInterfaces())
    .flat()
    .filter((address) => address && address.family === 'IPv4' && !address.internal)
    .map((address) => address.address);

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    allowedDevOrigins: localNetworkHosts,
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