import React, { useState } from 'react';
import { 
  Share2, 
  Twitter, 
  MessageCircle, 
  Copy, 
  Check,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareButtonsProps {
  resultText: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ resultText }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = "https://trytimevora.online";
  const shareText = "I just explored an alternate life path on Timevora. It gave me so much perspective! Reflect on your 'what ifs' at:";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareToWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Timevora Reflection',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8 border-t border-white/5 mt-12">
      <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Share your reflection</p>
      
      <div className="flex flex-wrap justify-center gap-4">
        {/* Native Share (Mobile) */}
        {typeof navigator !== 'undefined' && !!navigator.share && (
          <button
            onClick={handleNativeShare}
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
            title="Share via System"
          >
            <Share2 className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
          </button>
        )}

        {/* WhatsApp */}
        <button
          onClick={shareToWhatsApp}
          className="p-4 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 transition-all group"
          title="Share on WhatsApp"
        >
          <MessageCircle className="w-5 h-5 text-[#25D366] group-hover:scale-110 transition-transform" />
        </button>

        {/* Twitter/X */}
        <button
          onClick={shareToTwitter}
          className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
          title="Share on X (Twitter)"
        >
          <Twitter className="w-5 h-5 text-white/60 group-hover:text-white group-hover:scale-110 transition-transform" />
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group relative"
          title="Copy to Clipboard"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Check className="w-5 h-5 text-emerald-400" />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Copy className="w-5 h-5 text-white/60 group-hover:text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
      
      <p className="text-[10px] text-white/20 italic">
        "Perspective is the only thing that can change without anything else moving."
      </p>
    </div>
  );
};
