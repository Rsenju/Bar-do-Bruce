/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Only local images — no external domains needed
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
