'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Search, Image as ImageIcon, X, ShoppingBag, Loader2, ExternalLink, Tag, Trophy, AlertCircle, Sparkles, User, LogOut } from 'lucide-react';
import { searchProduct, type ProductMatch } from '@/app/actions/search';
import { extractImageFromUrl } from '@/app/actions/scrape';
import PriceChart from '@/components/PriceChart';
import DailyDeals from '@/components/DailyDeals';
import { Link as LinkIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ProductMatch[] | null>(null);
  const [sortBy, setSortBy] = useState<'trust' | 'price_low' | 'price_high'>('trust');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = async () => {
    let imageToSearch = selectedImage;
    let isUrl = false;

    if (searchMode === 'url') {
      if (!urlInput) return;
      setIsSearching(true);
      setError(null);
      const extractedUrl = await extractImageFromUrl(urlInput);
      if (!extractedUrl) {
        setError('Could not find a product image at that link. Try uploading a photo instead.');
        setIsSearching(false);
        return;
      }
      imageToSearch = extractedUrl;
      isUrl = true;
    }

    if (!imageToSearch) return;

    setIsSearching(true);
    setError(null);
    setResults(null);

    try {
      const data = await searchProduct(imageToSearch, isUrl);
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setUrlInput('');
    setResults(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFilteredAndSortedResults = () => {
    if (!results) return [];
    
    let filtered = [...results];
    
    if (showVerifiedOnly) {
      const verifiedStores = ['amazon', 'flipkart', 'myntra', 'ajio', 'tata'];
      filtered = filtered.filter(item => 
        verifiedStores.some(store => item.source.toLowerCase().includes(store))
      );
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'trust') return (b.score || 0) - (a.score || 0);
      if (sortBy === 'price_low') return a.price.amount - b.price.amount;
      if (sortBy === 'price_high') return b.price.amount - a.price.amount;
      return 0;
    });
  };

  const processedResults = getFilteredAndSortedResults();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 font-sans selection:bg-cyan-500/30">
      {/* Modern Glassmorphism Header */}
      <header className="bg-[#020617]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-2.5 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.4)] group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              DESIDEAL <span className="text-cyan-400">HUNTER</span>
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold tracking-widest uppercase text-slate-400">
            <a href="#" className="hover:text-cyan-400 transition-colors">How it works</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Top Stores</a>
            
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                  <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-[10px] text-white">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <span className="text-xs lowercase font-medium text-slate-300">{user.email?.split('@')[0]}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link 
                href="/login"
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2.5 rounded-full transition-all text-white"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 rounded-full text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">
            <Sparkles className="w-3 h-3" />
            AI-Powered Visual Search
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
            Shop Smarter, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              Not Harder.
            </span>
          </h2>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium">
            The ultimate visual price engine for the Indian market. Find any product across major retailers in seconds.
          </p>
        </div>

        {/* Daily Deals Section */}
        <DailyDeals />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Upload Zone */}
          <div className="lg:col-span-4 sticky top-32">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-sm shadow-2xl space-y-8">
              {/* Search Mode Tabs */}
              <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
                <button 
                  onClick={() => setSearchMode('upload')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${searchMode === 'upload' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  UPLOAD IMAGE
                </button>
                <button 
                  onClick={() => setSearchMode('url')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${searchMode === 'url' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  PASTE LINK
                </button>
              </div>

              {searchMode === 'upload' ? (
                !selectedImage ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative border-2 border-dashed border-white/20 rounded-3xl p-12 flex flex-col items-center justify-center gap-6 hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="bg-white/5 p-5 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                      <Upload className="w-10 h-10 text-slate-400 group-hover:text-cyan-400" />
                    </div>
                    <div className="text-center relative z-10">
                      <p className="text-lg font-bold text-white">Drop your image here</p>
                      <p className="text-sm text-slate-500 mt-1">or click to browse files</p>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/40 aspect-square group">
                    <img 
                      src={selectedImage} 
                      alt="Preview" 
                      className="w-full h-full object-contain p-4"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={clearImage}
                        className="bg-red-500 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <LinkIcon className="w-5 h-5 text-slate-500" />
                    </div>
                    <input 
                      type="url"
                      placeholder="Paste Amazon, Myntra, or Ajio link..."
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium px-2">
                    We'll automatically extract the product image and find the best prices for you.
                  </p>
                </div>
              )}

              <button 
                onClick={handleSearch}
                disabled={(searchMode === 'upload' ? !selectedImage : !urlInput) || isSearching}
                className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all relative overflow-hidden group ${
                  ((searchMode === 'upload' && selectedImage) || (searchMode === 'url' && urlInput)) && !isSearching
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] hover:-translate-y-1' 
                    : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                }`}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    HUNTING DEALS...
                  </>
                ) : (
                  <>
                    <Search className="w-6 h-6" />
                    FIND BEST PRICES
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Results Grid */}
          <div className="lg:col-span-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {!results && !isSearching && (
              <div className="bg-white/5 border border-white/10 rounded-[2rem] min-h-[500px] flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="bg-white/5 p-6 rounded-full">
                  <ImageIcon className="w-12 h-12 text-slate-600" />
                </div>
                <div className="max-w-xs">
                  <h3 className="text-xl font-bold text-white">No search results yet</h3>
                  <p className="text-slate-500 mt-2">
                    Upload an image and click "Find Best Prices" to see the magic happen.
                  </p>
                </div>
              </div>
            )}

            {isSearching && (
              <div className="flex flex-col items-center justify-center py-20 space-y-8">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-cyan-400/10 rounded-full animate-pulse flex items-center justify-center">
                      <Search className="w-6 h-6 text-cyan-400" />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white">Scanning Indian Market...</h3>
                  <p className="text-slate-500 mt-2">Comparing prices across 50+ retailers</p>
                </div>
              </div>
            )}

            {results && (
              <div className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 gap-4">
                  <h3 className="text-3xl font-black text-white flex items-center gap-3">
                    <Tag className="w-8 h-8 text-cyan-400" />
                    Live Results
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Sort:</span>
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-transparent text-xs font-bold text-cyan-400 outline-none cursor-pointer"
                      >
                        <option value="trust">Best Match</option>
                        <option value="price_low">Lowest Price</option>
                        <option value="price_high">Highest Price</option>
                      </select>
                    </div>

                    <button 
                      onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                      className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 transition-all ${
                        showVerifiedOnly 
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' 
                        : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase">Verified Only</span>
                    </button>

                    <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-sm font-bold text-cyan-400">
                      {processedResults.length} Matches
                    </span>
                  </div>
                </div>

                {processedResults.length > 0 && <PriceChart results={processedResults} />}
                
                {processedResults.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 p-12 rounded-[2.5rem] text-center space-y-6">
                    <div className="bg-white/5 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto border border-white/10">
                      <AlertCircle className="w-10 h-10 text-slate-600" />
                    </div>
                    <div className="max-w-sm mx-auto">
                      <p className="text-white font-bold text-2xl">No matches found</p>
                      <p className="text-slate-500 mt-2">We couldn't find this exact item in Indian stores. Try a clearer photo!</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {processedResults.map((match, idx) => (
                      <div 
                        key={idx} 
                        className="group bg-white rounded-[1.5rem] overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                      >
                        {/* Product Image Container */}
                        <div className="relative aspect-[4/5] bg-slate-50 p-6 overflow-hidden">
                          {idx === 0 && (
                            <div className="absolute top-4 left-4 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg flex items-center gap-1">
                              <Trophy className="w-3 h-3" />
                              Best Value
                            </div>
                          )}
                          <img 
                            src={match.thumbnail} 
                            alt={match.title} 
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{match.source}</span>
                          </div>
                        </div>

                        {/* Content Container */}
                        <div className="p-6 flex flex-col flex-1 bg-white">
                          <h4 className="text-slate-900 font-bold text-lg leading-tight line-clamp-2 min-h-[3.5rem]">
                            {match.title}
                          </h4>
                          
                          <div className="mt-6 flex items-end justify-between">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Price</p>
                              <p className="text-3xl font-black text-green-600 tracking-tighter">
                                ₹{match.price?.amount.toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>

                          <a 
                            href={match.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-6 w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 shadow-lg group-hover:shadow-cyan-500/20"
                          >
                            BUY NOW
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 mt-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <ShoppingBag className="w-5 h-5" />
            <span className="font-bold tracking-tighter">DESIDEAL HUNTER</span>
          </div>
          <div className="text-slate-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} Built for the Indian E-commerce Revolution.
          </div>
          <div className="flex gap-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-cyan-400">Privacy</a>
            <a href="#" className="hover:text-cyan-400">Terms</a>
            <a href="#" className="hover:text-cyan-400">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
