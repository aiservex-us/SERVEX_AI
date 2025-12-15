'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../lib/supabaseClient';

export default function PanelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        router.replace('/');
        return;
      }

      setUser(currentUser);
      setLoading(false);
    };

    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">
          Verifying corporate session…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10">
      <h1 className="text-2xl font-semibold">
        Welcome {user.email}
      </h1>
    </div>
  );
}
