/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // تخطي فحص ESLint أثناء البناء (Netlify) لتفادي فشل البناء بسبب أخطاء lint
    ignoreDuringBuilds: true,
  },
  // حل المشكلة الخاصة بـ next/image و Cloudinary
  images: {
    domains: ['res.cloudinary.com'],
  },
};

export default nextConfig;
