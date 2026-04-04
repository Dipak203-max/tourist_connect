import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  MessageSquare, 
  Calendar, 
  ShieldCheck, 
  Star, 
  Globe, 
  CheckCircle2,
  ArrowRight,
  Navigation,
  Compass,
  Heart
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PublicLayout from '../components/layout/PublicLayout';

// --- Subcomponents ---

const HeroSection = () => {
  return (
    <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-100/40 dark:bg-primary-900/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 -z-10 animate-pulse-slow"></div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-full mb-8">
              <Compass className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-black text-primary-700 dark:text-primary-300 uppercase tracking-widest">Our Mission</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-surface-900 dark:text-white leading-tight tracking-tight mb-8">
              Connecting Travelers with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Local Experts</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted font-medium leading-relaxed mb-12 max-w-2xl">
              TouristConnect is more than a booking platform. It's a bridge between curious travelers and passionate locals who know the true soul of every destination.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/destinations" className="w-full sm:w-auto button-primary px-10 py-5 rounded-3xl text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary-500/30 group">
                Explore Destinations <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/find-guides" className="w-full sm:w-auto px-10 py-5 rounded-3xl text-lg font-black border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center justify-center gap-3 transition-all">
                Find Local Guides
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const IntroSection = () => (
  <section className="py-24 bg-white dark:bg-surface-900/30">
    <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div className="relative">
        <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
          <img src="/landing-assets/about-vision.png" alt="Travel Together" className="w-full h-full object-cover" />
        </div>
        <div className="absolute -bottom-10 -right-10 glass-card p-8 rounded-3xl hidden md:block">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white">
                    <Heart className="w-6 h-6 fill-current" />
                </div>
                <div>
                    <p className="text-2xl font-black text-surface-900 dark:text-white">100%</p>
                    <p className="text-xs font-bold text-muted uppercase">Locally Owned</p>
                </div>
            </div>
        </div>
      </div>
      <div>
        <h2 className="text-sm font-black text-primary-600 uppercase tracking-[0.2em] mb-4">The Vision</h2>
        <h3 className="text-4xl font-black text-surface-900 dark:text-white leading-tight mb-8">What is TouristConnect?</h3>
        <p className="text-lg text-muted font-medium mb-6 leading-relaxed">
          We believe that travel is about more than just seeing sites—it's about human connection. We've built a platform where local experts can share their expertise, stories, and culture directly with tourists.
        </p>
        <p className="text-lg text-muted font-medium leading-relaxed">
          Whether you're looking for a hidden temple in Kathmandu, a secret pasta spot in Rome, or a sunset trek in the Andes, we connect you with the people who live there.
        </p>
      </div>
    </div>
  </section>
);

const StepCard = ({ icon: Icon, title, description, step }) => (
  <div className="text-center group p-4">
    <div className="relative inline-block mb-8">
      <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-[2rem] flex items-center justify-center text-primary-600 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
        <Icon className="w-10 h-10" />
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-surface-800 border-2 border-primary-600 rounded-full flex items-center justify-center text-xs font-black text-primary-600 shadow-sm">
        {step}
      </div>
    </div>
    <h4 className="text-xl font-black mb-3 text-surface-900 dark:text-white">{title}</h4>
    <p className="text-muted font-medium leading-relaxed">{description}</p>
  </div>
);

const FeatureItem = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-4 p-5 bg-surface-50 dark:bg-surface-900/50 rounded-2xl border border-surface-100 dark:border-surface-800 hover:border-primary-500 transition-colors group">
    <div className="w-10 h-10 bg-primary-600/10 rounded-xl flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
      <Icon className="w-5 h-5" />
    </div>
    <span className="font-bold text-surface-800 dark:text-surface-200">{title}</span>
  </div>
);

const About = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleProtectedAction = (path) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  return (
    <PublicLayout>
      <HeroSection />

      <IntroSection />

      {/* How It Works */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-black text-primary-600 uppercase tracking-[0.2em] mb-4">User Journey</h2>
            <h3 className="text-4xl md:text-5xl font-black text-surface-900 dark:text-white">Simple as it gets</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            <StepCard 
              icon={MapPin}
              step="01"
              title="Explore Places"
              description="Browse our curated list of destinations and find your next adventure."
            />
            <StepCard 
              icon={Users}
              step="02"
              title="Find Your Guide"
              description="View verified guide profiles and read authentic traveler reviews."
            />
            <StepCard 
              icon={Calendar}
              step="03"
              title="Collaborative Plan"
              description="Chat with your guide to build a custom itinerary together."
            />
            <StepCard 
              icon={ShieldCheck}
              step="04"
              title="Book & Explore"
              description="Pay securely through our platform and enjoy your local journey."
            />
          </div>
        </div>
      </section>

      {/* Features & Why Choose Us */}
      <section className="py-24 md:py-32 bg-white dark:bg-surface-900/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <h2 className="text-sm font-black text-primary-600 uppercase tracking-[0.2em] mb-4">The Platform</h2>
            <h3 className="text-4xl font-black text-surface-900 dark:text-white mb-10">Powerful Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FeatureItem icon={MessageSquare} title="Real-time Chat" />
              <FeatureItem icon={Navigation} title="Itinerary Planning" />
              <FeatureItem icon={ShieldCheck} title="Secure Booking" />
              <FeatureItem icon={Star} title="Reviews & Ratings" />
              <FeatureItem icon={Globe} title="Local Expertise" />
              <FeatureItem icon={CheckCircle2} title="Verified Guides" />
            </div>
          </div>
          
          <div className="bg-primary-600 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl shadow-primary-500/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-10">
                <Compass className="w-40 h-40" />
             </div>
             <h3 className="text-4xl font-black mb-8 relative z-10">Why Choose Us?</h3>
             <ul className="space-y-8 relative z-10">
                <li className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-xl mb-1">Authenticity First</h4>
                        <p className="text-primary-100/80 font-medium">No generic tourist traps. We prioritize real local experiences.</p>
                    </div>
                </li>
                <li className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-xl mb-1">Safety & Security</h4>
                        <p className="text-primary-100/80 font-medium">Verified guides and secure payment processing for peace of mind.</p>
                    </div>
                </li>
                <li className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-xl mb-1">Empowering Locals</h4>
                        <p className="text-primary-100/80 font-medium">We give local experts a platform to earn fair income by sharing their passion.</p>
                    </div>
                </li>
             </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center bg-surface-900 dark:bg-surface-900 rounded-[3rem] p-12 md:p-24 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/20 to-transparent"></div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight relative z-10">Start your journey today</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                <Link to="/destinations" className="w-full sm:w-auto bg-white text-surface-900 px-10 py-5 rounded-2xl text-lg font-black shadow-lg hover:scale-105 transition-transform">
                    Explore Destinations
                </Link>
                <Link to="/register" className="w-full sm:w-auto button-primary px-10 py-5 rounded-2xl text-lg flex items-center justify-center gap-3">
                    Sign Up Now <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-surface-100 dark:border-surface-900 mt-12 bg-white dark:bg-surface-950">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Globe className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-surface-900 dark:text-white">
              Tourist<span className="text-primary-600">Connect</span>
            </span>
          </div>
          <div className="flex gap-8">
            <Link to="/" className="text-sm font-bold text-muted hover:text-primary-600 transition-colors">Home</Link>
            <Link to="/about" className="text-sm font-bold text-muted hover:text-primary-600 transition-colors">About</Link>
            <Link to="/destinations" className="text-sm font-bold text-muted hover:text-primary-600 transition-colors">Explore</Link>
            <Link to="/contact" className="text-sm font-bold text-muted hover:text-primary-600 transition-colors">Contact</Link>
          </div>
          <p className="text-xs font-bold text-muted uppercase tracking-widest">© 2026 TouristConnect</p>
        </div>
      </footer>
    </PublicLayout>
  );
};

export default About;
