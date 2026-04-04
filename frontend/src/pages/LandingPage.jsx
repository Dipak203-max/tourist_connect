import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Calendar, 
  ShieldCheck, 
  Star, 
  Zap, 
  Users, 
  Search, 
  MapPin, 
  ArrowRight, 
  ChevronRight,
  Menu,
  X,
  Globe,
  Award,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

// --- Subcomponents ---

import PublicNavbar from '../components/layout/PublicNavbar';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -8 }}
    className="card p-8 rounded-3xl border-none shadow-premium hover:shadow-premium-hover transition-all group"
  >
    <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mb-6 text-primary-600 group-hover:scale-110 transition-transform">
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-xl font-black mb-3 text-surface-900 dark:text-white">{title}</h3>
    <p className="text-muted leading-relaxed text-base">{description}</p>
  </motion.div>
);

const StepCard = ({ number, title, description }) => (
  <div className="flex items-start gap-6 group">
    <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-surface-900 border-2 border-primary-100 dark:border-primary-900/50 rounded-2xl flex items-center justify-center text-xl font-black text-primary-600 shadow-sm transition-all group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 group-hover:scale-110">
      {number}
    </div>
    <div>
      <h3 className="text-xl font-black mb-2 text-surface-900 dark:text-white">{title}</h3>
      <p className="text-muted leading-relaxed">{description}</p>
    </div>
  </div>
);

const DestinationCard = ({ image, title, rating, price, location }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="card rounded-[2rem] overflow-hidden group cursor-pointer shadow-premium"
  >
    <div className="relative h-64 overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
        <span className="text-sm font-black text-surface-900">{rating}</span>
      </div>
      <div className="absolute bottom-4 left-4 right-4 bg-black/30 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-white opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
         <p className="text-xs font-bold uppercase tracking-widest text-primary-100">Live Experience</p>
         <h4 className="text-lg font-black truncate">{title}</h4>
      </div>
    </div>
    <div className="p-6">
      <div className="flex items-center gap-1.5 text-primary-600 font-bold text-xs uppercase tracking-wider mb-2">
        <MapPin className="w-3.5 h-3.5" />
        {location}
      </div>
      <div className="flex justify-between items-center">
        <div>
          <span className="text-2xl font-black text-surface-900 dark:text-white">${price}</span>
          <span className="text-muted text-sm font-semibold ml-1">/ trip</span>
        </div>
        <button className="p-3 bg-surface-50 dark:bg-surface-800 rounded-xl group-hover:bg-primary-600 group-hover:text-white transition-colors">
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  </motion.div>
);

const TestimonialCard = ({ content, author, role, avatar }) => (
  <div className="card p-8 rounded-3xl shadow-premium relative">
    <div className="mb-6 flex gap-1">
      {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />)}
    </div>
    <p className="text-lg font-medium text-surface-700 dark:text-surface-200 leading-relaxed mb-8">"{content}"</p>
    <div className="flex items-center gap-4">
      <img src={avatar} alt={author} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-100 p-0.5" />
      <div>
        <h4 className="font-black text-surface-900 dark:text-white">{author}</h4>
        <p className="text-xs font-bold text-muted uppercase tracking-widest">{role}</p>
      </div>
    </div>
  </div>
);

// --- Main Page ---

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 font-outfit selection:bg-primary-100 selection:text-primary-900">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-52 md:pb-32 overflow-hidden">
        {/* Background images/blobs */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary-100/30 rounded-full blur-3xl -z-10 opacity-50 overflow-hidden">
          <img src="/landing-assets/how-it-works.png" alt="Travel Planning" className="w-full h-full object-cover scale-150 rotate-12 opacity-40" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-full mb-8">
                <Zap className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-black text-primary-700 dark:text-primary-300 uppercase tracking-widest">Reimagining Travel</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black text-surface-900 dark:text-white leading-[1.1] tracking-tight mb-8">
                Connect with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-400">Local Experts</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted font-medium leading-relaxed mb-12 max-w-2xl mx-auto">
                Ditch the generic tours. Connect with local guides who know the hidden gems, culture, and stories that make every journey unforgettable.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/explore" className="w-full sm:w-auto button-primary px-10 py-5 rounded-3xl text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary-500/30 group">
                  Explore Guides <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/become-guide" className="w-full sm:w-auto px-10 py-5 rounded-3xl text-lg font-black border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center justify-center gap-3 transition-all">
                  Become a Guide
                </Link>
              </div>

              {/* Stats/Social Proof */}
              <div className="mt-20 pt-10 border-t border-surface-100 dark:border-surface-900 flex flex-wrap justify-center items-center gap-12 md:gap-20">
                <div className="text-center">
                  <p className="text-4xl font-black text-surface-900 dark:text-white mb-1">50k+</p>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest">Active Tourists</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-black text-surface-900 dark:text-white mb-1">1,200+</p>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest">Local Experts</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-black text-surface-900 dark:text-white mb-1">4.9/5</p>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest">Avg. Rating</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 bg-white dark:bg-surface-900/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-sm font-black text-primary-600 uppercase tracking-[0.2em] mb-4">Core Platform</h2>
              <h3 className="text-4xl md:text-5xl font-black text-surface-900 dark:text-white leading-tight">Everything you need for a <br className="hidden md:block" /> seamless travel experience</h3>
            </div>
            <p className="text-muted font-medium text-lg md:max-w-xs">Handcrafted features designed to connect tourists and guides effortlessly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={MessageSquare}
              title="Real-time Chat"
              description="Coordinate plans directly with your guide through our secure messaging system. Instant and reliable."
              delay={0.1}
            />
            <FeatureCard 
              icon={Calendar}
              title="Smart Planning"
              description="Build collaborative itineraries tailored to your interests using our drag-and-drop travel planner."
              delay={0.2}
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Secure Booking"
              description="Protect your payments with our escrow-style system. Guides get paid only after a successful trip."
              delay={0.3}
            />
            <FeatureCard 
              icon={Star}
              title="Verified Ratings"
              description="Read authentic reviews from fellow travelers. Only verified bookings can leave feedback."
              delay={0.4}
            />
            <FeatureCard 
              icon={Zap}
              title="AI Travel Advice"
              description="Get personalized recommendations and local insights powered by our smart travel AI assistant."
              delay={0.5}
            />
            <FeatureCard 
              icon={Users}
              title="Group Coordination"
              description="Easily split costs and coordinate large group tours with built-in management tools."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-sm font-black text-primary-600 uppercase tracking-[0.2em] mb-4">The Process</h2>
            <h3 className="text-4xl md:text-6xl font-black text-surface-900 dark:text-white leading-tight mb-8">How it works</h3>
            <p className="text-xl text-muted font-medium leading-relaxed mb-12">Starting your local adventure is as simple as four quick steps. No paperwork, just experiences.</p>
            
            <div className="space-y-10">
              <StepCard 
                number="01"
                title="Find a Local Expert"
                description="Browse hundreds of verified guides based on destination, language, or specialty."
              />
              <StepCard 
                number="02"
                title="Chat & Tailor Your Plan"
                description="Discuss your preferences and let your guide craft a unique itinerary just for you."
              />
              <StepCard 
                number="03"
                title="Book with Confidence"
                description="Pay securely through our platform. Funds are held until your experience is complete."
              />
              <StepCard 
                number="04"
                title="Enjoy the Journey"
                description="Meet your guide and explore the world through the eyes of a local."
              />
            </div>
          </div>
          
          <div className="relative">
            <motion.div 
               initial={{ rotate: -2, scale: 0.95 }}
               whileInView={{ rotate: 0, scale: 1 }}
               viewport={{ once: true }}
               className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <img src="/landing-assets/hero.png" alt="Travel" className="w-full h-[600px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 to-transparent"></div>
            </motion.div>
            
            {/* Floating UI Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-10 -right-10 z-20 glass-card p-6 rounded-3xl hidden md:block"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-black text-surface-900">Booking Confirmed</p>
                  <p className="text-xs font-bold text-muted uppercase">Ready to explore</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Destinations Preview */}
      <section className="py-24 md:py-32 bg-surface-100 dark:bg-surface-900/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-surface-900 dark:text-white tracking-tight">Top Destinations</h2>
              <p className="text-muted font-medium mt-2">Handpicked places where our best guides are waiting.</p>
            </div>
            <Link to="/explore" className="hidden sm:flex items-center gap-2 text-primary-600 font-black uppercase tracking-widest text-sm hover:underline">
              See All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <DestinationCard 
              image="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=800"
              title="Sacred Temples Journey"
              location="Kathmandu, Nepal"
              rating={4.9}
              price={120}
            />
            <DestinationCard 
              image="https://images.unsplash.com/photo-1524230659194-06ac90327453?auto=format&fit=crop&q=80&w=800"
              title="Old Town Secret Spots"
              location="Prague, Czechia"
              rating={4.8}
              price={85}
            />
            <DestinationCard 
              image="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=800"
              title="Iconic Coastline Walk"
              location="Sydney, Australia"
              rating={4.9}
              price={150}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-20">
                <h2 className="text-sm font-black text-primary-600 uppercase tracking-[0.2em] mb-4">Community Love</h2>
                <h3 className="text-4xl md:text-6xl font-black text-surface-900 dark:text-white tracking-tight">Trusted by thousands</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <TestimonialCard 
                    content="The best travel decision I ever made. Connecting with Sarah in Tokyo gave me insights I could never find in a guidebook."
                    author="Alex Johnson"
                    role="Solo Traveler"
                    avatar="https://i.pravatar.cc/150?u=alex"
                />
                <TestimonialCard 
                    content="Booking was effortless. Our guide for the Himalayas was incredibly professional and knew the best sunrise spots."
                    author="Elena Rossi"
                    role="Adventure Seeker"
                    avatar="https://i.pravatar.cc/150?u=elena"
                />
                <TestimonialCard 
                    content="As a guide, this platform has changed my life. I can share my culture with people from all over the world securely."
                    author="David Chen"
                    role="Local Expert"
                    avatar="https://i.pravatar.cc/150?u=david"
                />
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 max-w-7xl mx-auto px-6 md:px-12">
        <div className="relative overflow-hidden bg-primary-600 rounded-[3rem] p-12 md:p-24 text-center">
            {/* Decor */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-7xl font-black text-white leading-tight mb-8">Ready for your <br /> next adventure?</h2>
                <p className="text-xl text-primary-100 font-medium mb-12">Join thousands of travelers exploring the world like a local.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link to="/register" className="w-full sm:w-auto bg-white text-primary-600 px-12 py-5 rounded-[2rem] text-xl font-bold shadow-2xl hover:scale-105 transition-transform">
                        Get Started Free
                    </Link>
                    <Link to="/register" className="w-full sm:w-auto text-white px-8 py-5 border border-white/30 rounded-[2rem] text-lg font-bold hover:bg-white/10 transition-all">
                        Become a Guide
                    </Link>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-24 pb-12 bg-surface-50 dark:bg-surface-950 border-t border-surface-100 dark:border-surface-900 mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
                <div className="col-span-2 lg:col-span-2">
                    <Link to="/" className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                            <Globe className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-surface-900 dark:text-white">
                            Tourist<span className="text-primary-600">Connect</span>
                        </span>
                    </Link>
                    <p className="text-muted leading-relaxed max-w-xs mb-8">Connecting curious travelers with passionate local experts for authentic, unforgettable experiences.</p>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                            <span className="sr-only">Twitter</span>
                            <svg className="w-5 h-5 text-surface-600 dark:text-surface-300" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84a4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                        </div>
                        <div className="w-10 h-10 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                            <span className="sr-only">Instagram</span>
                            <svg className="w-5 h-5 text-surface-600 dark:text-surface-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-black text-surface-900 dark:text-white mb-6 uppercase text-sm tracking-widest">Platform</h4>
                    <ul className="space-y-4">
                        <li><Link to="/register" className="text-muted hover:text-primary-600 transition-colors font-medium">Explore Guides</Link></li>
                        <li><Link to="/register" className="text-muted hover:text-primary-600 transition-colors font-medium">How it Works</Link></li>
                        <li><Link to="/register" className="text-muted hover:text-primary-600 transition-colors font-medium">Pricing</Link></li>
                        <li><Link to="/register" className="text-muted hover:text-primary-600 transition-colors font-medium">Safety First</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-black text-surface-900 dark:text-white mb-6 uppercase text-sm tracking-widest">Company</h4>
                    <ul className="space-y-4">
                        <li><Link to="/about" className="text-muted hover:text-primary-600 transition-colors font-medium">About Us</Link></li>
                        <li><Link to="/careers" className="text-muted hover:text-primary-600 transition-colors font-medium">Careers</Link></li>
                        <li><Link to="/blog" className="text-muted hover:text-primary-600 transition-colors font-medium">Travel Blog</Link></li>
                        <li><Link to="/contact" className="text-muted hover:text-primary-600 transition-colors font-medium">Contact</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-black text-surface-900 dark:text-white mb-6 uppercase text-sm tracking-widest">Support</h4>
                    <ul className="space-y-4">
                        <li><Link to="/help" className="text-muted hover:text-primary-600 transition-colors font-medium">Help Center</Link></li>
                        <li><Link to="/privacy" className="text-muted hover:text-primary-600 transition-colors font-medium">Privacy Policy</Link></li>
                        <li><Link to="/terms" className="text-muted hover:text-primary-600 transition-colors font-medium">Terms of Service</Link></li>
                        <li><Link to="/trust" className="text-muted hover:text-primary-600 transition-colors font-medium">Trust & Safety</Link></li>
                    </ul>
                </div>
            </div>

            <div className="pt-8 border-t border-surface-100 dark:border-surface-900 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-sm font-bold text-muted">© 2026 TouristConnect. All rights reserved.</p>
                <div className="flex gap-8">
                    <button className="text-xs font-black text-muted uppercase tracking-widest hover:text-primary-600">English (US)</button>
                    <button className="text-xs font-black text-muted uppercase tracking-widest hover:text-primary-600">USD ($)</button>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
