import React from 'react';
import { Award, Heart, Shield, Info, BookOpen } from 'lucide-react';
import { Card } from '../../ui/BaseComponents';

const Highlight = ({ icon: Icon, text, colorClass }) => (
  <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-2xl border border-surface-100 dark:border-surface-700">
    <div className={`p-2 rounded-xl ${colorClass}`}>
      <Icon className="w-5 h-5" />
    </div>
    <span className="font-bold text-surface-700 dark:text-surface-300">{text}</span>
  </div>
);

const GuideAbout = ({ bio, certifications, languages }) => {
  return (
    <Card className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
          <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-2xl font-black text-surface-900 dark:text-surface-100 uppercase tracking-tight">About Me</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <p className="text-lg leading-relaxed text-surface-600 dark:text-surface-400 font-medium whitespace-pre-line">
            {bio || "This guide hasn't provided a bio yet. They are likely busy preparing for their next adventure!"}
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Highlight 
                icon={Award} 
                text={certifications?.length > 0 ? `${certifications.length} Professional Certs` : "Identity Verified"} 
                colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
            />
            <Highlight 
                icon={Heart} 
                text="Local Area Expert" 
                colorClass="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" 
            />
            <Highlight 
                icon={Shield} 
                text={certifications?.some(c => c.toLowerCase().includes('first aid')) ? "First Aid Trained" : "Secure Bookings"} 
                colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
            />
            <Highlight 
                icon={Info} 
                text={`${languages?.length || 0} Languages Spoken`} 
                colorClass="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" 
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-surface-50 dark:bg-surface-800/50 rounded-3xl border border-surface-100 dark:border-surface-700">
            <h3 className="text-sm font-black text-surface-400 uppercase tracking-widest mb-4">Certifications</h3>
            <ul className="space-y-3">
              {certifications && certifications.length > 0 ? (
                certifications.map((cert, index) => (
                  <li key={index} className="flex items-start gap-2 text-surface-700 dark:text-surface-300 font-bold">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                    {cert}
                  </li>
                ))
              ) : (
                <li className="text-surface-400 text-xs italic font-bold">No certifications listed yet.</li>
              )}
            </ul>
          </div>

          <div className="p-6 bg-surface-50 dark:bg-surface-800/50 rounded-3xl border border-surface-100 dark:border-surface-700">
            <h3 className="text-sm font-black text-surface-400 uppercase tracking-widest mb-4">Languages Spoken</h3>
            <div className="flex flex-wrap gap-2">
              {languages && languages.length > 0 ? (
                languages.map((lang, index) => (
                  <span key={index} className="px-3 py-1 bg-white dark:bg-surface-900 rounded-lg text-xs font-black uppercase border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400">
                    {lang}
                  </span>
                ))
              ) : (
                <>
                  <span className="px-3 py-1 bg-white dark:bg-surface-900 rounded-lg text-xs font-black uppercase border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400">English</span>
                  <span className="px-3 py-1 bg-white dark:bg-surface-900 rounded-lg text-xs font-black uppercase border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400">Nepali</span>
                  <span className="px-3 py-1 bg-white dark:bg-surface-900 rounded-lg text-xs font-black uppercase border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400">Hindi</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GuideAbout;
