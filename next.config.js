const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  // Ensure CSS is properly processed in Vercel
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Force CSS generation
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      }
    ]
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      '@/components': path.resolve(__dirname, 'components'),
      '@/lib': path.resolve(__dirname, 'lib'),
      '@/app': path.resolve(__dirname, 'app'),
      '@/types': path.resolve(__dirname, 'types'),
      '@/utils': path.resolve(__dirname, 'utils'),
    }
    
    return config
  }
}

module.exports = nextConfig
