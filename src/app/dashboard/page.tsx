'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Wand2, 
  ShieldCheck, 
  Tag, 
  Check, 
  X, 
  Cpu, 
  RefreshCw, 
  Layers, 
  Download, 
  Palette, 
  Sliders, 
  Maximize2
} from 'lucide-react';

interface StagedFact {
  id: string;
  fact_type: 'BRAND_TONE' | 'PRODUCT_IDEA' | 'USP';
  content: any;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'EDITED';
}

const AD_STYLES = [
  { id: 'Minimalist Studio', name: 'Minimal Studio', desc: 'Clean, elegant, premium shadows' },
  { id: 'Outdoor Road Action', name: 'Outdoor Action', desc: 'Highways, speed, dramatic sunlight' },
  { id: 'Cyberpunk Neon Glow', name: 'Neon Cyberpunk', desc: 'Futuristic moody purple & cyan glow' },
  { id: 'Commercial E-Commerce Ad', name: 'Flash Sale Ad', desc: 'High-contrast commercial advertising' }
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Square (Feed Post)' },
  { id: '9:16', label: '9:16 Vertical (Story / Reel)' },
  { id: '16:9', label: '16:9 Banner (Header Ad)' }
];

export default function Dashboard() {
  const [facts, setFacts] = useState<StagedFact[]>([]);
  const [selectedFact, setSelectedFact] = useState<StagedFact | null>(null);
  const [isLoadingFacts, setIsLoadingFacts] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [brainVersion, setBrainVersion] = useState<string>("v1.0");
  const [compileMessage, setCompileMessage] = useState<string | null>(null);
  
  // Studio State
  const [selectedStyle, setSelectedStyle] = useState<string>(AD_STYLES[0].id);
  const [selectedRatio, setSelectedRatio] = useState<string>('1:1');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [generatedMedia, setGeneratedMedia] = useState<{url: string, promptUsed: string} | null>(null);

  // Load Facts and Brain metadata
  const loadFacts = async () => {
    try {
      const [resFacts, resBrain] = await Promise.all([
        fetch('http://localhost:8000/api/v1/bie/staged-facts'),
        fetch('http://localhost:8000/api/v1/brain/')
      ]);

      if (resFacts.ok) {
        const json = await resFacts.json();
        if (json.data && json.data.items) {
          setFacts(json.data.items);
          if (json.data.items.length > 0 && !selectedFact) {
            setSelectedFact(json.data.items[0]);
          }
        }
      }

      if (resBrain.ok) {
        const jsonB = await resBrain.json();
        if (jsonB.data && jsonB.data.version) {
          setBrainVersion(`v${jsonB.data.version}`);
        }
      }
    } catch (err) {
      console.error('Failed to load facts or brain from backend', err);
    } finally {
      setIsLoadingFacts(false);
    }
  };

  useEffect(() => {
    loadFacts();
  }, []);

  // Update prompt whenever selected product changes
  useEffect(() => {
    if (selectedFact) {
      if (selectedFact.fact_type === 'PRODUCT_IDEA') {
        setCustomPrompt(`Hero commercial ad visual for ${selectedFact.content.name || 'Product'}. Price ₹${selectedFact.content.price_amount || ''}. High-octane aesthetic.`);
      } else if (selectedFact.fact_type === 'USP') {
        setCustomPrompt(`Bold promotional poster highlighting USP: "${selectedFact.content.value || ''}"`);
      } else if (selectedFact.fact_type === 'BRAND_TONE') {
        setCustomPrompt(`Brand identity ad representing tone: ${selectedFact.content.tone_of_voice || 'Modern and Premium'}`);
      }
    }
  }, [selectedFact]);

  // Handle Approve or Reject
  const handleUpdateStatus = async (factId: string, newStatus: 'APPROVED' | 'REJECTED', e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://localhost:8000/api/v1/bie/staged-facts/${factId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setFacts(prev => prev.map(f => f.id === factId ? { ...f, status: newStatus } : f));
        if (selectedFact?.id === factId) {
          setSelectedFact(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Compile Approved Facts into Business Brain
  const handleCompileBrain = async () => {
    setIsCompiling(true);
    setCompileMessage(null);
    try {
      const res = await fetch('http://localhost:8000/api/v1/brain/compile-staged', {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setBrainVersion(`v${data.data.version}`);
        setCompileMessage(`Success! ${data.data.facts_consolidated} approved items trained into Business Brain.`);
        setTimeout(() => setCompileMessage(null), 5000);
      }
    } catch (err) {
      console.error('Failed to compile brain', err);
    } finally {
      setIsCompiling(false);
    }
  };

  // Generate Scalio-grade Image Ad
  const handleGenerateAd = async () => {
    setIsGenerating(true);
    try {
      const productName = selectedFact?.fact_type === 'PRODUCT_IDEA' ? selectedFact.content.name : undefined;

      const res = await fetch('http://localhost:8000/api/v1/assets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customPrompt || "Premium marketing commercial ad creative",
          asset_type: "IMAGE",
          style: selectedStyle,
          aspect_ratio: selectedRatio,
          product_name: productName
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedMedia({
          url: data.data.file_url,
          promptUsed: customPrompt
        });
      }
    } catch (err) {
      console.error('Generation failed', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const approvedCount = facts.filter(f => f.status === 'APPROVED').length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            AdsShree Creative Studio <span className="text-xs bg-purple-500/20 text-purple-300 font-mono px-2.5 py-1 rounded-full border border-purple-500/30">AI Visual Marketing Engine</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Generate high-converting commercial ad posters directly from your scraped products &amp; verified Brain.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCompileBrain}
            disabled={isCompiling || approvedCount === 0}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
              approvedCount > 0 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/20 hover:opacity-90' 
                : 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed'
            }`}
          >
            {isCompiling ? <RefreshCw className="animate-spin" size={15} /> : <Cpu size={15} />}
            Sync Approved Facts ({approvedCount}) to Brain
          </button>
          
          <div className="glass px-3.5 py-2 rounded-xl text-xs font-medium text-purple-300 border border-purple-500/20 flex items-center gap-2">
            <Sparkles size={15} />
            <span>Brain: <strong className="text-white">{brainVersion}</strong></span>
          </div>
        </div>
      </header>

      {/* Compile Alert */}
      <AnimatePresence>
        {compileMessage && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5"
          >
            <ShieldCheck size={16} />
            {compileMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Scraped Products & Facts (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-5 rounded-2xl h-[700px] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Tag className="text-purple-400" size={18} />
                </div>
                <h2 className="text-base font-bold text-white">Scraped Catalog</h2>
              </div>
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-mono">
                {facts.length} Items
              </span>
            </div>
            
            <p className="text-xs text-gray-400 mb-3">
              Select any product below to automatically configure the AI Photo Studio:
            </p>

            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {isLoadingFacts ? (
                <div className="flex justify-center items-center h-40 text-gray-400 text-xs">
                  Loading facts from Backend...
                </div>
              ) : (
                facts.map((item) => {
                  const isSelected = selectedFact?.id === item.id;
                  let title = "";
                  let subtitle = "";
                  let price = "";
                  if (item.fact_type === "BRAND_TONE") {
                    title = "Brand Tone & Guidelines";
                    subtitle = item.content.tone_of_voice || "Tone profile";
                  } else if (item.fact_type === "PRODUCT_IDEA") {
                    title = item.content.name || "Product Offering";
                    subtitle = item.content.category_name ? `Category: ${item.content.category_name}` : "Product description";
                    if (item.content.price_amount) {
                      price = `₹${item.content.price_amount}`;
                    }
                  } else {
                    title = "Key Selling Proposition";
                    subtitle = item.content.value || "Unique Selling Proposition";
                  }

                  const isApproved = item.status === 'APPROVED';
                  const isRejected = item.status === 'REJECTED';

                  return (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedFact(item)}
                      className={`p-3.5 rounded-xl flex flex-col gap-1.5 cursor-pointer transition-all border ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/10' 
                          : isApproved 
                            ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50' 
                            : isRejected 
                              ? 'border-red-500/20 opacity-40 hover:opacity-70' 
                              : 'border-white/5 hover:bg-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                          {item.fact_type.replace('_', ' ')}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          {price && (
                            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-emerald-400 font-mono font-bold mr-1">
                              {price}
                            </span>
                          )}
                          <button
                            onClick={(e) => handleUpdateStatus(item.id, 'APPROVED', e)}
                            title="Approve for Brain"
                            className={`p-1 rounded text-xs font-semibold flex items-center transition-all ${
                              isApproved 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-white/5 text-gray-400 hover:bg-emerald-500/20 hover:text-emerald-400'
                            }`}
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={(e) => handleUpdateStatus(item.id, 'REJECTED', e)}
                            title="Reject"
                            className={`p-1 rounded text-xs font-semibold flex items-center transition-all ${
                              isRejected 
                                ? 'bg-red-500 text-white' 
                                : 'bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400'
                            }`}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>

                      <p className="text-white font-medium text-xs leading-snug">{title}</p>
                      <p className="text-[11px] text-gray-400 line-clamp-1">{subtitle}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Scalio AI Photo Studio Controls & Preview (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-panel p-6 rounded-2xl h-[700px] flex flex-col">
            
            {/* Studio Header & Configuration */}
            <div className="flex flex-col gap-4 border-b border-white/5 pb-5 mb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-pink-500/20 rounded-lg">
                    <Wand2 className="text-pink-400" size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">AI Ad Creative Studio</h2>
                    <p className="text-xs text-gray-400">Customize lighting, visual style, and composition</p>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateAd}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? <RefreshCw className="animate-spin" size={15} /> : <Sparkles size={15} />}
                  Generate AI Photo Ad
                </button>
              </div>

              {/* Style Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AD_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedStyle === style.id 
                        ? 'border-purple-500 bg-purple-500/20 text-white' 
                        : 'border-white/5 bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <p className="text-xs font-bold leading-tight">{style.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{style.desc}</p>
                  </button>
                ))}
              </div>

              {/* Ratio Selector & Prompt Input */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
                  {ASPECT_RATIOS.map(ratio => (
                    <button
                      key={ratio.id}
                      onClick={() => setSelectedRatio(ratio.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedRatio === ratio.id 
                          ? 'bg-purple-600 text-white shadow-md' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {ratio.id}
                    </button>
                  ))}
                </div>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Enter creative prompt details..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Canvas / Preview Area */}
            <div className="flex-1 glass rounded-xl flex items-center justify-center p-4 border-dashed border-2 border-white/10 relative overflow-hidden bg-black/30">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-5">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-white/10 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-white font-semibold text-sm">Rendering AdsShree Ad Creative...</p>
                    <p className="text-purple-300/70 text-xs">Applying {selectedStyle} aesthetic &amp; professional lighting</p>
                  </div>
                </div>
              ) : generatedMedia ? (
                <div className="relative max-h-full max-w-full flex flex-col items-center justify-center group">
                  <motion.img 
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={generatedMedia.url} 
                    alt="AI Generated Ad" 
                    className={`rounded-xl object-contain shadow-2xl max-h-[440px] ${
                      selectedRatio === '9:16' ? 'aspect-[9/16]' : selectedRatio === '16:9' ? 'aspect-[16/9]' : 'aspect-square'
                    }`}
                  />
                  
                  {/* Floating Action Button */}
                  <a
                    href={generatedMedia.url}
                    download="adsshree_product_ad.png"
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-4 right-4 bg-black/80 hover:bg-black text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border border-white/20 backdrop-blur-md shadow-xl transition-all"
                  >
                    <Download size={14} />
                    Download Ad
                  </a>
                </div>
              ) : (
                <div className="text-center space-y-3 max-w-md mx-auto">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-white/10">
                    <ImageIcon className="text-purple-400" size={28} />
                  </div>
                  <h3 className="text-white text-base font-bold">Studio Canvas Ready</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Select a product from the scraped catalog on the left, pick an aesthetic style, and click <strong>Generate AI Photo Ad</strong> to render your high-converting commercial graphic.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </motion.div>
  );
}
