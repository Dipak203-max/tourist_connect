import React from 'react';
import { MessageSquare, Phone, Mail, Clock, ShieldCheck, Share2 } from 'lucide-react';
import { Button, Card } from '../../ui/BaseComponents';

const ContactItem = ({ icon: Icon, label, value, colorClass }) => (
  <div className="flex items-center gap-4 p-4 bg-surface-50 dark:bg-surface-800/50 rounded-2xl border border-surface-100 dark:border-surface-700/50 group hover:border-primary-500/30 transition-all">
    <div className={`p-3 rounded-xl ${colorClass} group-hover:scale-110 transition-transform`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-sm font-black text-surface-900 dark:text-surface-100 uppercase tracking-tight">{value}</p>
    </div>
  </div>
);

const GuideContact = ({ guide }) => {
  return (
    <Card className="mb-12 overflow-hidden border-none shadow-none bg-transparent p-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
              <MessageSquare className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-black text-surface-900 dark:text-surface-100 uppercase tracking-tight">Contact Info</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ContactItem 
              icon={Phone} 
              label="WhatsApp / Call" 
              value={guide?.phoneNumber || "+977 98X-XXXXXXX"} 
              colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
            />
            <ContactItem 
              icon={Mail} 
              label="Email Address" 
              value={guide?.email || "contact@guide.com"} 
              colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
            />
            <ContactItem 
              icon={Clock} 
              label="Response Time" 
              value={guide?.responseTime || "Within 3 hours"} 
              colorClass="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" 
            />
            <ContactItem 
              icon={ShieldCheck} 
              label="Identity Status" 
              value={guide?.userId ? "Fully Verified" : "Verification Pending"} 
              colorClass="bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" 
            />
          </div>
          
          <div className="mt-8 flex items-center gap-4">
            <Button variant="secondary" className="gap-2 font-black uppercase tracking-widest text-xs h-[48px] rounded-xl px-6 border-surface-200 dark:border-surface-800">
              <Share2 className="w-4 h-4" /> Share Profile
            </Button>
            <p className="text-[10px] text-surface-400 font-bold uppercase tracking-widest max-w-[200px]">
              Share this profile with friends planning a trip to {guide?.country || 'Nepal'}.
            </p>
          </div>
        </div>

        <div className="relative rounded-[2rem] overflow-hidden group shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1551882547-ff43c63faf7c?auto=format&fit=crop&q=80&w=1470" 
            alt="Guide Map" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Based in {guide?.city || 'Kathmandu'}</h3>
            <p className="text-white/70 text-sm font-bold leading-relaxed uppercase tracking-widest">
              Available for treks in {guide?.specialization || 'local highlights'} and surrounding areas.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
              <span className="text-white text-[10px] font-black uppercase tracking-widest">Currently Available</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GuideContact;
