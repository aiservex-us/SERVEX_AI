'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../lib/supabaseClient';

export default function PanelPage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser();

      if (!user) {
        router.replace('/login');
      } else {
        router.replace('/xml-pipeline');
      }
    };

    checkUser();
  }, [router]);

  return null;
}