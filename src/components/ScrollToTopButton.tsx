import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 220) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-5 sm:bottom-6 right-5 sm:right-6 z-40 print:hidden animate-fadeIn">
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Move to up"
        title="Move to up"
        className="group flex items-center justify-center w-11 h-11 rounded-full bg-white/95 dark:bg-[#121927]/95 text-slate-800 dark:text-white border border-slate-200/90 dark:border-slate-700/80 shadow-[0_4px_18px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_22px_rgba(0,0,0,0.4)] hover:bg-slate-900 hover:text-white dark:hover:bg-[#1a2333] hover:border-slate-900 dark:hover:border-slate-600 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer backdrop-blur-md"
      >
        <ArrowUp
          size={18}
          className="transition-transform duration-200 group-hover:-translate-y-0.5"
        />
      </button>
    </div>
  );
};
