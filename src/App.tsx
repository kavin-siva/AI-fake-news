import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import InputSection from './components/InputSection';
import ResultsSection from './components/ResultsSection';
import { analyzeNews, AnalysisResult } from './services/ai';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (text: string) => {
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    
    try {
      // Small artificial delay for visual effect
      await new Promise(r => setTimeout(r, 800));
      
      const analysis = await analyzeNews(text);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col">
      {/* Background Animated Glow */}
      <div className="bg-animated-glow" />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 pt-24 pb-12 flex flex-col items-center">
        
        {/* Header / Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center md:text-left w-full max-w-4xl mx-auto space-y-2 mb-8 flex flex-col md:flex-row md:justify-between md:items-end border-b border-[#2A2A2A] pb-4"
        >
          <div className="space-y-1">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter leading-none text-white uppercase drop-shadow-md">
              AI Fake News <span className="text-[#800020]">Detector</span>
            </h1>
            <p className="text-[10px] md:text-sm text-[#BFBFBF] font-medium uppercase tracking-widest">
              AI-Powered News Credibility Engine
            </p>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-right">
              <div className="text-[10px] text-[#BFBFBF] uppercase tracking-widest">Analysis Mode</div>
              <div className="text-sm font-bold text-white">High Precision NLP</div>
            </div>
            <div className="w-10 h-10 rounded-full border border-[#800020] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#800020] animate-pulse"></div>
            </div>
          </div>
        </motion.div>

        {/* Input Layer */}
        <InputSection onAnalyze={handleAnalyze} isLoading={isAnalyzing} />

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-8 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200 max-w-3xl w-full text-center"
            >
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Layer */}
        <AnimatePresence mode="wait">
          {result && !isAnalyzing && (
            <ResultsSection key="results" result={result} />
          )}
        </AnimatePresence>

      </main>

      {/* Footer / Disclaimer */}
      <footer className="w-full border-t border-[#2A2A2A] py-6 mt-auto z-10 bg-[#0B0B0B]">
        <div className="container mx-auto px-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
          <div className="text-[10px] text-[#BFBFBF] italic opacity-60 uppercase tracking-widest md:max-w-[60%]">
            Disclaimer: This tool provides probabilistic predictions using NLP. Always verify news through multiple trusted sources.
          </div>
          <div className="flex flex-col md:items-end space-y-1">
            <span className="text-[10px] text-white uppercase tracking-widest font-bold">
              Created by <span className="text-[#800020]">Kavin Sivasubramanian</span>
            </span>
            <span className="text-[9px] text-[#D2B48C] uppercase tracking-widest font-bold opacity-60">
              Gemini 3.1 Pro Engine
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
