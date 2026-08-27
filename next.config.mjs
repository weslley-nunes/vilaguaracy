/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/tabuada',
        destination: '/tabuada/index.html',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
