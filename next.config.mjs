/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/tabuada',
        destination: '/tabuada/index.html',
      },
    ];
  },
};

export default nextConfig;
