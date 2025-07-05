'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase'; // تأكد من وجود ملف firebase.js
import { collection, getDocs } from 'firebase/firestore';
import styles from './RadioButtons.module.css'; // استيراد CSS Module

const RadioButtons = () => {
  const [documentIds, setDocumentIds] = useState([]);
  const [status, setStatus] = useState('');

  // جلب أسماء المستندات من مجموعة priceing
  useEffect(() => {
    const fetchDocumentIds = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'priceing'));
        const ids = querySnapshot.docs.map((doc) => doc.id);
        setDocumentIds(ids);
        if (ids.length === 0) {
          setStatus('لا توجد مستندات في مجموعة priceing');
        }
      } catch (error) {
        setStatus(`خطأ أثناء جلب المستندات: ${error.message}`);
      }
    };
    fetchDocumentIds();
  }, []);

  return (
    <>
      <div className={styles['radio-input']}>
        {documentIds.length > 0 ? (
          documentIds.map((id, index) => (
            <label className={styles.label} key={id}>
              <input
                type="radio"
                id={`value-${index + 1}`}
                name="value-radio"
                defaultValue={id}
                defaultChecked={index === 0}
              />
              <p className={styles.text}>{id}</p>
            </label>
          ))
        ) : (
          <p className={styles.error}>{status || 'جاري جلب المستندات...'}</p>
        )}
      </div>
    </>
  );
};

export default RadioButtons;