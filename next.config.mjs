/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [{ source: "/en", destination: "/", permanent: false }];
  },
};

export default nextConfig;
