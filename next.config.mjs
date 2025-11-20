/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable for easier drag/drop or map interactions if needed
  images: {
    domains: ['picsum.photos', 'cdn.tailwindcss.com'],
  },
};

export default nextConfig;