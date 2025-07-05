'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Pencil, Trash2, Save, Image as ImageIcon, X } from 'lucide-react';

export default function DisplayMaterials({ section, id }) {
  const [materials, setMaterials] = useState([]);
  const [status, setStatus] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [showMoreColors, setShowMoreColors] = useState({});

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

  // جلب البيانات من Firestore
  useEffect(() => {
    const docRef = doc(db, 'priceing', section);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setMaterials(data[id] || []);
        } else {
          setMaterials([]);
          setStatus('المستند غير موجود');
        }
      },
      (error) => {
        setStatus(`خطأ: ${error.message}`);
      }
    );

    return () => unsubscribe();
  }, [section, id]);

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
            maxFileSize: 5000000,
            transformations: { fetch_format: 'webp', quality: 'auto' },
          },
          (error, result) => {
            if (!error && result && result.event === 'success') {
              const webpUrl = result.info.secure_url.replace(/\.([a-zA-Z0-9]+)$/, '.webp');
              setEditItem({ ...editItem, صورة: webpUrl });
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
    if (!editItem.صورة) {
      setEditItem({ ...editItem, صورة: '' });
      setStatus('✅ تم إزالة الصورة');
      setTimeout(() => setStatus(''), 2000);
      return;
    }

    try {
      const publicId = editItem.صورة
        .split('/')
        .slice(-2)
        .join('/')
        .replace(/\.[^/.]+$/, '');

      const response = await fetch('/api/cloudinary-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId }),
      });

      if (!response.ok) {
        throw new Error('فشل حذف الصورة من Cloudinary');
      }

      setEditItem({ ...editItem, صورة: '' });
      setStatus('✅ تم إزالة الصورة من Cloudinary بنجاح');
      setTimeout(() => setStatus(''), 2000);
    } catch (error) {
      setStatus(`❌ خطأ في حذف الصورة: ${error.message}`);
    }
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditItem({ ...materials[index] });
  };

  const handleColorChange = (i, field, value) => {
    const newColors = [...editItem.الألوان];
    newColors[i][field] = value;
    setEditItem({ ...editItem, الألوان: newColors });
  };

  const handleSave = async () => {
    try {
      const updated = [...materials];
      updated[editIndex] = editItem;
      await updateDoc(doc(db, 'priceing', section), { [id]: updated });
      setEditIndex(null);
      setEditItem(null);
      setStatus('✅ تم حفظ التعديل بنجاح');
    } catch (err) {
      setStatus(`❌ خطأ: ${err.message}`);
    }
  };

  const handleDelete = async (index) => {
    try {
      const item = materials[index];
      if (item.صورة) {
        const publicId = item.صورة
          .split('/')
          .slice(-2)
          .join('/')
          .replace(/\.[^/.]+$/, '');

        const response = await fetch('/api/cloudinary-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId }),
        });

        if (!response.ok) {
          throw new Error('فشل حذف الصورة من Cloudinary');
        }
      }

      const updated = materials.filter((_, i) => i !== index);
      await updateDoc(doc(db, 'priceing', section), { [id]: updated });
      setStatus('🗑️ تم الحذف بنجاح');
    } catch (err) {
      setStatus(`❌ خطأ: ${err.message}`);
    }
  };

  const toggleShowMore = (index) => {
    setShowMoreColors((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-4xl mt-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        الخامات في: <span className="text-blue-600">{section}</span> -{' '}
        <span className="text-blue-600">{id}</span>
      </h2>

      {status && (
        <p
          className={`text-center mb-4 text-sm ${
            status.includes('بنجاح') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {status}
        </p>
      )}

      {materials.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">لا توجد خامات مضافة بعد.</p>
      ) : (
        <ul className="space-y-4">
          {materials.map((item, i) => (
            <li
              key={i}
              className="p-4 border rounded-lg shadow-sm bg-gray-50 space-y-2"
            >
              {editIndex === i ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editItem.خامة}
                    onChange={(e) => setEditItem({ ...editItem, خامة: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="اسم الخامة"
                  />
                  <input
                    type="number"
                    value={editItem.سعر}
                    onChange={(e) => setEditItem({ ...editItem, سعر: Number(e.target.value) })}
                    className="w-full p-2 border rounded"
                    placeholder="السعر"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      صورة الخامة (سيتم تحويلها إلى WebP)
                    </label>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={openUploadWidget}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm flex items-center gap-2"
                      >
                        <ImageIcon size={18} />
                        تحميل صورة
                      </button>
                      {editItem.صورة ? (
                        <div className="relative">
                          <img
                            src={editItem.صورة}
                            alt={editItem.خامة}
                            className="w-24 h-24 object-cover rounded-lg"
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
                        <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-lg">
                          <ImageIcon size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setEditItem({ ...editItem, الحالة: 'متاح' })}
                      className={`px-3 py-1 rounded-full text-sm ${
                        editItem.الحالة === 'متاح'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      متاح
                    </button>
                    <button
                      onClick={() => setEditItem({ ...editItem, الحالة: 'غير متاح' })}
                      className={`px-3 py-1 rounded-full text-sm ${
                        editItem.الحالة === 'غير متاح'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      غير متاح
                    </button>
                  </div>
                  {editItem.الألوان?.map((color, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color.code}
                        onChange={(e) => handleColorChange(j, 'code', e.target.value)}
                        className="w-10 h-8"
                      />
                      <input
                        type="text"
                        value={color.name}
                        onChange={(e) => handleColorChange(j, 'name', e.target.value)}
                        className="p-1 border rounded"
                        placeholder="اسم اللون"
                      />
                    </div>
                  ))}
                  <button
                    onClick={handleSave}
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex justify-center gap-2 items-center"
                  >
                    <Save size={18} /> حفظ
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-lg text-gray-700">
                      الخامة: {item.خامة}
                    </p>
                    <span
                      className={`text-sm px-3 py-1 rounded-full ${
                        item.الحالة === 'متاح' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.الحالة}
                    </span>
                  </div>
                  <p className="text-gray-600">السعر: {item.سعر} جنيه</p>
                  <div className="mt-2">
                    {item.صورة ? (
                      <img
                        src={item.صورة}
                        alt={item.خامة}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-lg">
                        <ImageIcon size={24} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  {item.الألوان?.length > 0 && (
                    <div className="flex gap-3 flex-wrap mt-2">
                      {(showMoreColors[i] ? item.الألوان : item.الألوان.slice(0, 6)).map(
                        (color, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <span
                              className="w-5 h-5 rounded-full border border-gray-300"
                              style={{ backgroundColor: color.code }}
                            ></span>
                            <span className="text-sm text-gray-700">{color.name}</span>
                          </div>
                        )
                      )}
                      {item.الألوان.length > 6 && (
                        <button
                          onClick={() => toggleShowMore(i)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium bg-gray-100 px-2 py-1 rounded-lg"
                        >
                          {showMoreColors[i] ? 'عرض أقل من الألوان' : 'المزيد من الألوان'}
                        </button>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(i)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                    >
                      <Pencil size={16} /> تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(i)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                    >
                      <Trash2 size={16} /> حذف
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
