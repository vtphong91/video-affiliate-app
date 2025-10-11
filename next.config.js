/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com', 'p16-sign.tiktokcdn.com'],
  },
  // Disable experimental features for better performance
  experimental: {
    // optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Optimize for development
  webpack: (config, { dev, isServer }) => {
    // Development optimizations
    if (dev) {
      config.watchOptions = {
        poll: false, // Disable polling for better performance
        aggregateTimeout: 200,
        ignored: /node_modules/,
      }
      
      // Reduce bundle size in development
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
      }
    }

    // Production optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }
    
    return config
  },
  // Enable compression
  compress: true,
  // Optimize bundle
  poweredByHeader: false,
}

module.exports = nextConfig
