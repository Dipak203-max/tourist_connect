import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Menu, 
  X 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PublicNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 dark:bg-surface-950/80 backdrop-blur-lg border-b border-surface-200 dark:border-surface-800 py-3 shadow-sm' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
            <Globe className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tight text-surface-900 dark:text-white">
            Tourist<span className="text-primary-600">Connect</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/destinations" className="text-sm font-semibold text-surface-600 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Explore</Link>
          <Link to="/about" className="text-sm font-semibold text-surface-600 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">About</Link>
          <Link to="/register" className="text-sm font-semibold text-surface-600 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Become a Guide</Link>
          <div className="h-6 w-px bg-surface-200 dark:bg-surface-800 mx-2"></div>
          <Link to="/login" className="text-sm font-bold text-surface-700 dark:text-surface-200 hover:text-primary-600 transition-colors">Login</Link>
          <Link to="/register" className="button-primary px-6 py-2.5 rounded-full text-sm shadow-lg shadow-primary-500/20">Sign Up</Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-surface-900 dark:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 p-6 flex flex-col gap-6 shadow-xl"
          >
            <Link to="/destinations" className="text-lg font-bold" onClick={() => setIsMobileMenuOpen(false)}>Explore</Link>
            <Link to="/about" className="text-lg font-bold" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            <Link to="/register" className="text-lg font-bold" onClick={() => setIsMobileMenuOpen(false)}>Become a Guide</Link>
            <hr className="border-surface-100 dark:border-surface-800" />
            <div className="flex flex-col gap-3">
              <Link to="/login" className="text-center py-3 font-bold border border-surface-200 dark:border-surface-700 rounded-2xl" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="button-primary text-center py-3 rounded-2xl shadow-lg shadow-primary-500/20" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default PublicNavbar;
