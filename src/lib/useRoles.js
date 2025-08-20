import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

/**
 * Hook لجلب الصلاحيات من مجموعة priceing
 * @returns { roles, loading, error }
 */
export default function useRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      setError('');
      try {
        const querySnapshot = await getDocs(collection(db, 'priceing'));
        const roleList = querySnapshot.docs.map((doc) => doc.id);
        setRoles(roleList);
      } catch (err) {
        setError('خطأ أثناء جلب الصلاحيات: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  return { roles, loading, error };
} 