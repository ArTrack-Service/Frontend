'use client';

import { useState, useEffect } from 'react';

export default function DataFetcher() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://api.artrack.moveto.kr/api/v1/artwork/');
        if (!res.ok) throw new Error('API 요청 실패');
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (!data) return <div>데이터 없음</div>;

  return <div>데이터: {JSON.stringify(data)}</div>;
}