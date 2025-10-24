'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (loading) {
    return (
      <Button className="hidden md:block" disabled>
        ...
      </Button>
    );
  }

  if (user) {
    return (
      <Link href="/dashboard">
        <Button className="hidden md:block">
          Dashboard
        </Button>
      </Link>
    );
  }

  return (
    <Link href="/auth/login">
      <Button className="hidden md:block">
        Đăng nhập
      </Button>
    </Link>
  );
}
