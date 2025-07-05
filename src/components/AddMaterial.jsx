'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {
  PackagePlus,
  DollarSign,
  Palette,
  CheckCircle,
  XCircle,
  X,
  Image as ImageIcon,
} from 'lucide-react';

const AddMaterial = ({ section, id }) => {
  const [material, setMaterial] = useState('');
  const [price, setPrice] = useState('');
  const [available, setAvailable] = useState(true);
  const [colorName, setColorName] = useState('');
  const [colorCode, setColorCode] = useState('#000000');
  const [colorList, setColorList] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // تحميل نصوص Cloudinary
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // فتح Cloudinary Upload Widget مع تحويل الصورة إلى WebP
  const openUploadWidget = () => {
    if (window.cloudinary) {
      window.cloudinary
        .createUploadWidget(
          {
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'do88eynar',
            uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'material_uploads',
            sources: ['local', 'url', 'camera'],
            multiple: false,
            resourceType: 'image',
            clientAllowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
            maxFileSize: 5000000, // 5MB حد أقصى
            transformations: { fetch_format: 'webp', quality: 'auto' }, // تحويل إلى WebP
          },
          (error, result) => {
            if (!error && result && result.event === 'success') {
              const webpUrl = result.info.secure_url.replace(/\.([a-zA-Z0-9]+)$/, '.webp');
              setImageUrl(webpUrl);
              setStatus('✅ تم تحميل الصورة بصيغة WebP بنجاح!');
              setTimeout(() => setStatus(''), 2000);
            } else if (error) {
              setStatus(`❌ خطأ في تحميل الصورة: ${error.message}`);
            }
          }
        )
        .open();
    } else {
      setStatus('❌ خطأ: واجهة Cloudinary غير متوفرة');
    }
  };

  // حذف الصورة من Cloudinary
  const handleRemoveImage = async () => {
    if (!imageUrl) {
      setStatus('❌ لا توجد صورة للحذف');
      return;
    }

    try {
      // استخراج Public ID من رابط الصورة
      const publicId = imageUrl
        .split('/')
        .slice(-2)
        .join('/')
        .replace(/\.[^/.]+$/, '');

      // طلب الحذف إلى API Route
      const response = await fetch('/api/cloudinary-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId }),
      });

      if (!response.ok) {
        throw new Error('فشل حذف الصورة من Cloudinary');
      }

      setImageUrl('');
      setStatus('✅ تم إزالة الصورة من Cloudinary بنجاح');
      setTimeout(() => setStatus(''), 2000);
    } catch (error) {
      setStatus(`❌ خطأ في حذف الصورة: ${error.message}`);
    }
  };

  const handleAddColor = () => {
    if (!colorName.trim()) return;
    setColorList((prev) => [...prev, { name: colorName.trim(), code: colorCode }]);
    setColorName('');
    setColorCode('#000000');
  };

  const handleRemoveColor = (index) => {
    setColorList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddMaterial = async () => {
    if (!material || !price) {
      setStatus('يرجى إدخال الخامة والسعر');
      return;
    }

    setIsLoading(true);
    try {
      const docRef = doc(db, 'priceing', section);
      const docSnap = await getDoc(docRef);
      const data = docSnap.exists() ? docSnap.data() : {};
      const array = data[id] || [];

      array.push({
        خامة: material,
        سعر: Number(price),
        الحالة: available ? 'متاح' : 'غير متاح',
        الألوان: colorList,
        صورة: imageUrl || '',
      });

      await updateDoc(docRef, { [id]: array });

      setStatus('✅ تم إضافة الخامة بنجاح!');
      setMaterial('');
      setPrice('');
      setAvailable(true);
      setColorList([]);
      setImageUrl('');
    } catch (error) {
      setStatus(`❌ خطأ: ${error.message}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-4xl border border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        إضافة خامة إلى: <span className="text-blue-600">{section}</span> -{' '}
        <span className="text-blue-600">{id}</span>
      </h2>

      <div className="space-y-5">
        {/* اسم الخامة */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">اسم الخامة</label>
          <div className="flex items-center border rounded-lg px-3 py-2">
            <PackagePlus className="text-gray-400 w-5 h-5 mr-2" />
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full focus:outline-none text-base text-gray-800"
              placeholder="مثال: قماش قطني"
            />
          </div>
        </div>

        {/* السعر */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">السعر</label>
          <div className="flex items-center border rounded-lg px-3 py-2">
            <DollarSign className="text-gray-400 w-5 h-5 mr-2" />
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full focus:outline-none text-base text-gray-800"
              placeholder="مثال: 150"
            />
          </div>
        </div>

        {/* الصورة */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            صورة الخامة (سيتم تحويلها إلى WebP)
          </label>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={openUploadWidget}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm flex items-center gap-2"
            >
              <ImageIcon size={18} />
              تحميل صورة
            </button>
            {imageUrl ? (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="معاينة الصورة"
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  title="إزالة الصورة"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-lg">
                <ImageIcon size={24} className="text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* الألوان */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">إضافة لون</label>
          <div className="flex flex-col md:flex-row gap-4 items-center mb-2">
            <input
              type="text"
              placeholder="اسم اللون (مثال: أحمر)"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              className="p-2 border border-gray-300 rounded w-full md:w-1/2"
            />
            <input
              type="color"
              value={colorCode}
              onChange={(e) => setColorCode(e.target.value)}
              className="w-12 h-12 border p-1 rounded"
            />
            <button
              type="button"
              onClick={handleAddColor}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
            >
              إضافة
            </button>
          </div>

          {colorList.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {colorList.map((color, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
                >
                  <span
                    className="w-5 h-5 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.code }}
                  ></span>
                  <span className="text-sm text-gray-700">{color.name}</span>
                  <button
                    onClick={() => handleRemoveColor(i)}
                    className="text-gray-400 hover:text-red-600"
                    title="حذف اللون"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* الحالة */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setAvailable(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                available
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : 'border-gray-300 text-gray-600'
              }`}
            >
              <CheckCircle size={18} /> متاح
            </button>
            <button
              type="button"
              onClick={() => setAvailable(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                !available
                  ? 'bg-red-100 text-red-700 border-red-300'
                  : 'border-gray-300 text-gray-600'
              }`}
            >
              <XCircle size={18} /> غير متاح
            </button>
          </div>
        </div>

        {/* زر الإضافة */}
        <button
          onClick={handleAddMaterial}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg text-white font-semibold text-lg transition duration-200 ${
            isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'جاري الإضافة...' : 'إضافة الخامة'}
        </button>

        {status && (
          <p
            className={`text-sm text-center mt-2 ${
              status.includes('بنجاح') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

export default AddMaterial;
