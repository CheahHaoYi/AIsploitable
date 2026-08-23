/** @type {import('next').NextConfig} */
const isStaticExport = process.env.NEXT_EXPORT === 'true' || process.env.NODE_ENV === 'production';

const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  outputFileTracingRoot: path.join(__dirname, './'),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
};

module.exports = nextConfig;
