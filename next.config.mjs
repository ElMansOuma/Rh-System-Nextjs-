/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: ""
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: ""
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: ""
      },
      {
        protocol: "https",
        hostname: "pub-b7fd9c30cdbf439183b75041f5f71b92.r2.dev",
        port: ""
      },
      // Add your API server
      {
        protocol: "http", // Note this is HTTP, not HTTPS
        hostname: "3.67.202.103",
        port: "8080"
      }
    ]
  },
  // Configuration de redirection ajoutée ci-dessous
  async redirects() {
    return [
      {
        source: '/',
        destination: '/public/auth/sign-in',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;