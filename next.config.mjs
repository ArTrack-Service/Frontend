const isProd = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  assetPrefix: isProd ? '/Frontend/' : '',
  images: { unoptimized: true },
  trailingSlash: true,
}

export default nextConfig