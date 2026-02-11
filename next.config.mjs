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
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      { protocol: "https", 
        hostname: "ui-avatars.com" 
      },
      { protocol: "https", 
        hostname: "res.cloudinary.com"
      },
      { protocol: "https", 
        hostname: "images.unsplash.com"
      },
      { protocol: "https", 
        hostname: "img.rocket.new"
      },
      {
        protocol: "https",
        hostname: "www.svgrepo.com", // keep for future uploads (optional)
      }
    ],
  },
};


export default nextConfig;
