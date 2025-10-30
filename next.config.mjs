/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jp3gzxhbwg.ufs.sh", // 👈 your UploadThing CDN host
      },
      {
        protocol: "https",
        hostname: "utfs.io", // keep for future uploads (optional)
      },
    ],
  },
};


export default nextConfig;
