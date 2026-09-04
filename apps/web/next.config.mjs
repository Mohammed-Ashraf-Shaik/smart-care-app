import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.resolve.alias['@smartcare/types'] = path.resolve(__dirname, '../../packages/types/src/index.ts');
    return config;
  },
};

export default nextConfig;
