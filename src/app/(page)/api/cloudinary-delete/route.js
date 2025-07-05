import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'do88eynar',
  api_key: process.env.CLOUDINARY_API_KEY || '125894898177369',
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const { publicId } = await request.json();
    if (!publicId) {
      return new Response(JSON.stringify({ error: 'Public ID is required' }), { status: 400 });
    }

    await cloudinary.uploader.destroy(publicId);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
