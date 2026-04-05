/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
        },
    },
  images: {
    remotePatterns: [
{ protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
{ protocol: 'https', hostname: '**.cloudinary.com' },
      ],
  },
    env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
          DATABASE_URL: process.env.DATABASE_URL,
          ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
          GOOGLE_ADS_CLIENT_ID: process.env.GOOGLE_ADS_CLIENT_ID,
          META_APP_ID: process.env.META_APP_ID,
          TIKTOK_APP_ID: process.env.TIKTOK_APP_ID,
          LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
          APOLLO_API_KEY: process.env.APOLLO_API_KEY,
          HUNTER_API_KEY: process.env.HUNTER_API_KEY,
          BUILTWITH_API_KEY: process.env.BUILTWITH_API_KEY,
      },
}

module.exports = nextConfig
