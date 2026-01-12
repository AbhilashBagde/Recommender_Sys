'use client';

import React, { useState, useRef } from 'react';
import { Upload, Search, Image as ImageIcon, X, ShoppingBag, Loader2, ExternalLink, Tag, Trophy, AlertCircle, Sparkles } from 'lucide-react';
import { searchProduct, type ProductMatch } from '@/app/actions/search';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ProductMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!selectedImage) return;

    setIsSearching(true);
    setError(null);
    setResults(null);

    try {
      const data = await searchProduct(selectedImage);
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setResults(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2 rounded-full transition-all">
              Sign In
            </button>
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Upload Zone */}
          <div className="lg:col-span-4 sticky top-32">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-sm shadow-2xl space-y-8">
              {!selectedImage ? (
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
              )}

              <button 
                onClick={handleSearch}
                disabled={!selectedImage || isSearching}
                className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all relative overflow-hidden group ${
                  selectedImage && !isSearching
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
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <h3 className="text-3xl font-black text-white flex items-center gap-3">
                    <Tag className="w-8 h-8 text-cyan-400" />
                    Live Results
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sorted by Price</span>
                    <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-sm font-bold text-cyan-400">
                      {results.length} Matches
                    </span>
                  </div>
                </div>
                
                {results.length === 0 ? (
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
                    {results.map((match, idx) => (
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
