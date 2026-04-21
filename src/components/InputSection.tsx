import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FileText, Link as LinkIcon, Loader2 } from 'lucide-react';

interface InputSectionProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

export default function InputSection({ onAnalyze, isLoading }: InputSectionProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'text'>('text');
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onAnalyze(inputValue);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden group">
        
        <div className="flex space-x-6 mb-6 border-b border-[#2A2A2A] pb-0">
           <button
            onClick={() => setActiveTab('url')}
            className={`text-sm font-bold pb-2 transition-all flex items-center justify-center gap-2 ${
               activeTab === 'url' 
                  ? 'text-white border-b-2 border-[#800020]' 
                  : 'text-[#BFBFBF] hover:text-white'
            }`}
          >
            <LinkIcon size={16} />
            Article URL
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`text-sm font-bold pb-2 transition-all flex items-center justify-center gap-2 ${
               activeTab === 'text' 
                  ? 'text-white border-b-2 border-[#800020]' 
                  : 'text-[#BFBFBF] hover:text-white'
            }`}
          >
            <FileText size={16} />
            Paste Text
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {activeTab === 'text' ? (
              <motion.div
                key="text-input"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <label className="text-[10px] text-[#D2B48C] uppercase tracking-widest font-bold block mb-1">Article Content</label>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Paste the full article text here..."
                  className="w-full h-48 bg-[#0B0B0B] border border-[#2A2A2A] rounded-lg p-3 text-sm text-white placeholder-[#5A5A5A] outline-none focus:border-[#800020] transition-colors resize-none"
                  disabled={isLoading}
                />
              </motion.div>
            ) : (
              <motion.div
                key="url-input"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <label className="text-[10px] text-[#D2B48C] uppercase tracking-widest font-bold block mb-1">Source URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-[#5A5A5A]" />
                  </div>
                  <input
                    type="url"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="https://example.com/news-article..."
                    className="w-full bg-[#0B0B0B] border border-[#2A2A2A] rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-[#5A5A5A] outline-none focus:border-[#800020] transition-colors"
                    disabled={isLoading}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="w-full bg-[#800020] hover:bg-[#A83232] text-white font-bold py-4 rounded-xl transition-all uppercase tracking-widest text-xs mt-4 shadow-[0_0_20px_rgba(128,0,32,0.2)] disabled:opacity-50 disabled:hover:bg-[#800020] flex items-center justify-center relative overflow-hidden"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                <span>Analyzing Credibility...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search size={16} />
                <span>Analyze Credibility</span>
              </div>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
