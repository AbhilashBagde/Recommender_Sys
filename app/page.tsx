'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/lib/supabase/client';
import { ShoppingBag } from 'lucide-react';

export default function LoginPage() {
  const supabase = createClient();

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
        <div className="text-center mb-8">
          <ShoppingBag className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white">Welcome Back</h1>
          <p className="text-slate-400 text-sm">Sign in to track your deals</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={['google']}
          redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
        />
      </div>
    </div>
  );
}
