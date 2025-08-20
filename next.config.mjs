/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  // حل المشكلة الخاصة بـ next/image و Cloudinary
  images: {
    domains: ['res.cloudinary.com'],
  },
};

export default nextConfig;
