'use client';

import { useState, useRef } from 'react';
import { searchProduct, type ProductMatch } from '@/app/actions/search';
import { extractImageFromUrl } from '@/app/actions/scrape';
import { getProductVibe } from '@/app/actions/gemini';
import PriceChart from '@/components/PriceChart';
import { Link as LinkIcon, Sparkles, ShieldCheck, ChevronDown, ShoppingBag, Upload, Search, Image as ImageIcon, X, Tag, Trophy, AlertCircle } from 'lucide-react';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ProductMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchMode, setSearchMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'trust'>('price');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [vibeCheck, setVibeCheck] = useState<Record<number, string>>({});
  const [loadingVibe, setLoadingVibe] = useState<number | null>(null);

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

  const handleVibeCheck = async (idx: number, title: string) => {
    setLoadingVibe(idx);
    try {
      const vibe = await getProductVibe(title);
      setVibeCheck(prev => ({ ...prev, [idx]: vibe }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVibe(null);
    }
  };

  const handleSearch = async () => {
    let imageToSearch = selectedImage;
    let isUrl = false;

    if (searchMode === 'url') {
      if (!urlInput) return;
      setIsSearching(true);
      setError(null);
      try {
        const extractedUrl = await extractImageFromUrl(urlInput);
        if (!extractedUrl) {
          setError('Could not find a product image at that link. Try uploading a photo instead.');
          setIsSearching(false);
          return;
        }
        imageToSearch = extractedUrl;
        isUrl = true;
      } catch (err) {
        setError('Failed to process the URL. Please check the link.');
        setIsSearching(false);
        return;
      }
    }

    if (!imageToSearch) return;

    setIsSearching(true);
    setError(null);
    setResults(null);

    try {
      const data = await searchProduct(imageToSearch, isUrl); // Ensure searchProduct accepts the second arg if updated
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const getProcessedResults = () => {
    if (!results) return [];
    let filtered = [...results];
    
    if (verifiedOnly) {
      filtered = filtered.filter(r => r.verified);
    }
    
    return filtered.sort((a, b) => {
      if (sortBy === 'price') {
        return a.price.amount - b.price.amount;
      } else {
        return (b.trustScore || 0) - (a.trustScore || 0);
      }
    });
  };

  const processedResults = getProcessedResults();
  const topDeals = processedResults.slice(0, 3);
  const otherDeals = processedResults.slice(3);

  const clearImage = () => {
    setSelectedImage(null);
    setUrlInput('');
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
            <a href="#" className="hover:text-cyan-400 transition-colors">API</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-blue-400">
            Find the Best Deals
            <br />
            <span className="text-cyan-400">With a Screenshot</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            Upload a product image or paste a URL to instantly compare prices across top stores.
          </p>
          
          {/* Search Mode Toggle */}
          <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-full p-1 mb-8">
            <button
              onClick={() => setSearchMode('upload')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                searchMode === 'upload' 
                  ? 'bg-cyan-500 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload Image
            </button>
            <button
              onClick={() => setSearchMode('url')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                searchMode === 'url' 
                  ? 'bg-cyan-500 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LinkIcon className="w-4 h-4 inline mr-2" />
              Product URL
            </button>
          </div>

          {/* Search Input */}
          <div className="max-w-2xl mx-auto">
            {searchMode === 'upload' ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {selectedImage ? (
                  <div className="relative">
                    <img 
                      src={selectedImage} 
                      alt="Selected product" 
                      className="w-full h-64 object-cover rounded-xl mb-4"
                    />
                    <button
                      onClick={clearImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center cursor-pointer hover:border-cyan-400 transition-colors"
                  >
                    <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 mb-2">Click to upload product image</p>
                    <p className="text-sm text-slate-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <div className="flex gap-4">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Paste product URL here..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={!urlInput || isSearching}
                    className="bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
            )}
            
            {selectedImage && searchMode === 'upload' && (
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="mt-4 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_30px_rgba(34,211,238,0.5)]"
              >
                {isSearching ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Searching for deals...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 inline mr-2" />
                    Find Best Deals
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="mb-16">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <h3 className="text-2xl font-bold text-white">
                Found {processedResults.length} Deals
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500"
                  />
                  Verified Stores Only
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'price' | 'trust')}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="price">Lowest Price</option>
                    <option value="trust">Trusted Stores</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Price Chart Integration */}
            <PriceChart data={processedResults} />

            {/* Top 3 Deals Showcase */}
            {topDeals.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider">Best Value Matches</h3>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  {topDeals.map((result, idx) => (
                    <div key={`top-${idx}`} className="relative bg-gradient-to-b from-cyan-500/10 to-transparent border border-cyan-500/30 rounded-3xl p-1 overflow-hidden group">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 blur-3xl rounded-full group-hover:bg-cyan-500/40 transition-all" />
                      <div className="bg-[#0f172a] rounded-[1.4rem] p-5 h-full flex flex-col">
                        <div className="relative mb-4 aspect-square overflow-hidden rounded-2xl">
                          <img 
                            src={result.thumbnail}
                            alt={result.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 bg-cyan-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
                            #{idx + 1} BEST DEAL
                          </div>
                        </div>
                        
                        <h4 className="font-bold text-white mb-2 line-clamp-2 flex-1">{result.title}</h4>
                        
                        <div className="flex items-end justify-between mb-4">
                          <div>
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">{result.source}</p>
                            <p className="text-3xl font-black text-white">
                              {result.price.currency === 'INR' ? '₹' : result.price.currency}
                              {result.price.amount.toLocaleString('en-IN')}
                            </p>
                          </div>
                          {result.verified && (
                            <ShieldCheck className="w-6 h-6 text-cyan-400 mb-1" />
                          )}
                        </div>

                        <div className="space-y-2">
                          <a
                            href={result.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-cyan-500 text-white py-3 rounded-xl font-bold text-center hover:bg-cyan-600 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                          >
                            Visit Store
                          </a>
                          <button
                            onClick={() => handleVibeCheck(idx, result.title)}
                            disabled={loadingVibe === idx}
                            className="w-full flex items-center justify-center gap-2 bg-white/5 text-slate-300 py-2 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
                          >
                            {loadingVibe === idx ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 text-cyan-400" />
                                AI Vibe Check
                              </>
                            )}
                          </button>
                        </div>
                        
                        {vibeCheck[idx] && (
                          <div className="mt-4 p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                            <p className="text-xs text-cyan-100 italic leading-relaxed">{vibeCheck[idx]}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Results Grid */}
            {otherDeals.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-400 mb-6 uppercase tracking-widest">More Options</h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {otherDeals.map((result, idx) => (
                    <div key={idx + 3} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all group">
                      <div className="relative mb-3 aspect-video overflow-hidden rounded-xl">
                        <img 
                          src={result.thumbnail}
                          alt={result.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <h4 className="font-bold text-sm text-white mb-2 line-clamp-1">{result.title}</h4>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-lg font-bold text-cyan-400">
                          ₹{result.price.amount.toLocaleString('en-IN')}
                        </p>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{result.source}</span>
                      </div>
                      <a
                        href={result.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-white/5 text-white py-2 rounded-lg font-bold text-xs text-center hover:bg-white/10 transition-colors"
                      >
                        View Deal
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center hover:border-cyan-400 transition-all">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Smart Search</h3>
            <p className="text-slate-400">Our AI analyzes your image to find exact or similar products across multiple stores.</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center hover:border-cyan-400 transition-all">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Best Prices</h3>
            <p className="text-slate-400">Compare prices in real-time and never overpay. We find the best deals for you.</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center hover:border-cyan-400 transition-all">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Verified Stores</h3>
            <p className="text-slate-400">Shop with confidence from verified stores with high trust scores and reliable service.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#020617]/80 backdrop-blur-md border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-2 rounded-xl">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-black text-white">DESIDEAL HUNTER</h4>
              </div>
              <p className="text-slate-400 text-sm">Your smart shopping companion for finding the best deals online.</p>
            </div>
            
            <div>
              <h5 className="font-bold text-white mb-4">Product</h5>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-bold text-white mb-4">Company</h5>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-bold text-white mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 Desideal Hunter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
