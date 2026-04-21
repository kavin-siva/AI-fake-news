import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AnalysisResult } from '../services/ai';
import { AlertTriangle, CheckCircle, BarChart3, Info, FileText } from 'lucide-react';

// Typewriter effect component
function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) clearInterval(interval);
    }, 15); // Adjust typing speed here
    return () => clearInterval(interval);
  }, [text]);

  return (
    <>
      {displayedText}
      {displayedText.length < text.length && (
        <span className="inline-block w-1.5 h-4 bg-[#D2B48C] ml-1 align-middle animate-pulse" />
      )}
    </>
  );
}

function HighlightQuotes({ text, quotes }: { text: string, quotes: string[] }) {
  if (!quotes || quotes.length === 0 || !text) {
    return <>{text}</>;
  }

  // Escape string for regex
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  };

  // Sort quotes descending by length to match longer phrases first
  const sortedQuotes = [...quotes].sort((a, b) => b.length - a.length);
  const regexPattern = sortedQuotes.map(escapeRegExp).join('|');
  
  if (!regexPattern) {
      return <>{text}</>;
  }

  const parts = text.split(new RegExp(`(${regexPattern})`, 'gi'));

  return (
    <>
      {parts.map((part, i) => {
        const isQuote = sortedQuotes.some(q => q.toLowerCase() === part.toLowerCase());
        if (isQuote) {
          return (
            <mark key={i} className="bg-[#800020]/40 text-white decoration-[#D2B48C] underline decoration-wavy underline-offset-4 rounded px-1">
              {part}
            </mark>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

interface ResultsSectionProps {
  result: AnalysisResult;
}

export default function ResultsSection({ result }: ResultsSectionProps) {
  // Color determination based on score
  // 0-40 Real (Green)
  // 41-70 Uncertain (Yellow)
  // 71-100 Fake (Red)
  const isReal = result.score <= 40;
  const isUncertain = result.score > 40 && result.score <= 70;
  const isFake = result.score > 70;

  const scoreColor = isReal ? '#10B981' : isUncertain ? '#F59E0B' : '#EF4444';
  const glowColor = isReal ? 'rgba(16, 185, 129, 0.4)' : isUncertain ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)';

  const scoreText = isReal ? 'Likely Real' : isUncertain ? 'Uncertain' : 'Likely Fake';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto mt-12 space-y-8 pb-24"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow">
        
        {/* Main Score Card */}
        <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
          
          <div className="relative flex items-center justify-center w-full h-40">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#2A2A2A"
                strokeWidth="10"
                fill="none"
              />
              <motion.circle
                initial={{ strokeDasharray: "0 1000" }}
                animate={{ strokeDasharray: `${(result.score / 100) * 440} 1000` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                cx="80"
                cy="80"
                r="70"
                stroke={scoreColor}
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 10px ${glowColor})` }}
              />
            </svg>
            <div className="flex flex-col items-center absolute">
              <span className="text-4xl font-black">{result.score}</span>
              <span className="text-[10px] text-[#BFBFBF] tracking-widest uppercase">/ 100</span>
            </div>
          </div>

          <div className="space-y-1 mt-4">
            <div className="font-black text-2xl uppercase tracking-tighter" style={{ color: scoreColor }}>
              {result.label}
            </div>
            <div className="text-[10px] text-[#BFBFBF] tracking-widest uppercase">
              CONFIDENCE: {result.confidence}%
            </div>
          </div>
        </div>

        {/* Details & Confidence */}
        <div className="glass-panel p-6 rounded-2xl h-full flex flex-col justify-between">
           <div className="space-y-4">
             <h3 className="text-[#D2B48C] font-bold text-xs uppercase tracking-widest flex items-center gap-2">
               <Info size={16} />
               AI Reasoning Breakdown
             </h3>
             <p className="text-xs leading-relaxed text-white relative">
               <TypewriterText text={result.explanation.finalReasoning} />
             </p>
           </div>
           
           <div className="pt-4 border-t border-[#2A2A2A] mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-[#BFBFBF] uppercase tracking-widest">Linguistic Accuracy</span>
                <span className="text-[10px] text-white font-bold tracking-widest">{result.confidence}%</span>
              </div>
              <div className="w-full bg-[#0B0B0B] h-1 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${result.confidence}%` }}
                  transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: scoreColor }}
                />
              </div>
           </div>
        </div>
      </div>

      {/* Explanation Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Key Issues */}
        <div className="p-6 border border-[#2A2A2A] rounded-2xl h-full flex flex-col">
          <h3 className="text-[#D2B48C] font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
            <AlertTriangle className="text-[#D2B48C]" size={16} />
            Detected Issues
          </h3>
          {result.explanation.keyIssues.length > 0 ? (
            <ul className="space-y-3">
              {result.explanation.keyIssues.map((issue, idx) => (
                <motion.li 
                  key={`issue-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + (idx * 0.1) }}
                  className="flex items-start space-x-3"
                >
                  <span className="text-[#800020] text-xs mt-0">⚠️</span>
                  <span className="text-white text-xs leading-relaxed">{issue}</span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#BFBFBF] italic">No major issues detected.</p>
          )}
        </div>

        {/* Bias Indicators */}
        <div className="p-6 border border-[#2A2A2A] rounded-2xl h-full flex flex-col">
          <h3 className="text-[#D2B48C] font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
            <CheckCircle className="text-[#800020]" size={16} />
            Bias Breakdown
          </h3>
          {result.explanation.biasIndicators.length > 0 ? (
            <ul className="space-y-3">
              {result.explanation.biasIndicators.map((bias, idx) => (
                <motion.li 
                  key={`bias-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + (idx * 0.1) }}
                  className="flex items-start space-x-3"
                >
                  <span className="text-[#800020] text-xs mt-0">⚠️</span>
                  <span className="text-white text-xs leading-relaxed">
                    {/* Replacing some key terms with highlighted tan color */}
                    {bias.split(' ').map((word, i) => {
                      const isHighlighted = word.toLowerCase().includes('emotion') || word.toLowerCase().includes('bias') || word.toLowerCase().includes('extreme');
                      return (
                        <React.Fragment key={i}>
                          <span className={isHighlighted ? "text-[#D2B48C] font-bold" : ""}>{word}</span>
                          {" "}
                        </React.Fragment>
                      )
                    })}
                  </span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#BFBFBF] italic">No significant bias detected.</p>
          )}
        </div>
      </div>

      {/* Extracted Original Text Highlighting */}
      <div className="p-6 border border-[#2A2A2A] rounded-2xl">
        <h3 className="text-[#D2B48C] font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-[#2A2A2A] pb-4">
          <FileText size={16} />
          Source Article Analysis
        </h3>
        <div className="max-h-[500px] overflow-y-auto pr-4 text-sm text-[#BFBFBF] leading-relaxed whitespace-pre-wrap font-serif">
          <HighlightQuotes text={result.articleText} quotes={result.explanation.suspiciousQuotes} />
        </div>
      </div>
      
    </motion.div>
  );
}
