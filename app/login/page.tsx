'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/lib/supabase/client';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const supabase = createClient();

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6">
      <Link 
        href="/" 
        className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 font-bold text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        BACK TO HUNTING
      </Link>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex bg-gradient-to-br from-cyan-400 to-blue-600 p-4 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.3)] mb-4">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white">
            WELCOME TO <span className="text-cyan-400">DESIDEAL</span>
          </h1>
          <p className="text-slate-400 font-medium">
            Sign in to save your searches and track price drops.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#22d3ee',
                    brandAccent: '#0891b2',
                    inputBackground: 'transparent',
                    inputText: 'white',
                    inputPlaceholder: '#475569',
                    authInputBorder: '#1e293b',
                  },
                  radii: {
                    borderRadiusButton: '12px',
                    buttonPadding: '12px',
                    inputPadding: '12px',
                  }
                }
              },
              className: {
                container: 'auth-container',
                button: 'auth-button font-bold uppercase tracking-widest text-xs',
                input: 'auth-input bg-white/5 border-white/10 text-white focus:border-cyan-400 transition-all',
                label: 'text-slate-400 text-xs font-bold uppercase mb-2 block',
              }
            }}
            providers={['google']}
            redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
            theme="dark"
          />
        </div>
      </div>
    </div>
  );
}
