/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: [],
    },
    // Avoid errors in dev if service worker is missing initially
    webpack: (config, { isServer }) => {
        return config;
    },
};

const pwaPlugin = withPWA({
    dest: 'public',
    disable: true,
});

export default pwaPlugin(nextConfig);
