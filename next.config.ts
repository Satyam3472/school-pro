/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  images: {
    unoptimized: true, // Needed for next/image with static export
  },
};

module.exports = nextConfig;
