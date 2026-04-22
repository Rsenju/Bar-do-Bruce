/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Only local images — no external domains needed
    formats: ['image/avif', 'image/webp'],
  },
  // Ensure environment variables are accessible
  env: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
}

module.exports = nextConfig
