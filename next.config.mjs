import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
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