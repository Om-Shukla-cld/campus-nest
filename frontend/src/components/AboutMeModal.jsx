import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cigarette, Utensils, Moon, Sparkles, 
  BookOpen, Edit3, CheckCircle, Smartphone
} from 'lucide-react';

const AboutMeModal = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    smoker: 'Non-smoker',
    veg: 'Veg',
    sleep: 'Early Bird',
    cleanliness: 'Neat Freak',
    study: 'Library Dweller',
    aboutMe: ''
  });

  const options = {
    smoker: ['Smoker', 'Non-smoker', 'Occasional'],
    veg: ['Veg', 'Non-veg', 'Vegan'],
    sleep: ['Early Bird', 'Night Owl', 'Flexible'],
    cleanliness: ['Minimalist', 'Neat Freak', 'Messy but Organized'],
    study: ['In Groups', 'Library Dweller', 'Home Body']
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl glass-card border-accent-gold/20 shadow-accent-gold/10 p-10 overflow-hidden"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
          <motion.div 
            className="h-full bg-accent-gold"
            animate={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-accent-gold uppercase italic tracking-tighter mb-2">Build Your Nest Profile</h2>
          <p className="text-slate-400 text-sm">Help us find the perfect roommate for you. These preferences will be visible anonymously to others.</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField 
                  label="Dietary Preference" 
                  icon={<Utensils size={18}/>} 
                  value={profile.veg} 
                  options={options.veg} 
                  onChange={(v) => setProfile({...profile, veg: v})} 
                />
                <SelectField 
                  label="Smoking Habits" 
                  icon={<Cigarette size={18}/>} 
                  value={profile.smoker} 
                  options={options.smoker} 
                  onChange={(v) => setProfile({...profile, smoker: v})} 
                />
                <SelectField 
                  label="Sleep Schedule" 
                  icon={<Moon size={18}/>} 
                  value={profile.sleep} 
                  options={options.sleep} 
                  onChange={(v) => setProfile({...profile, sleep: v})} 
                />
                <SelectField 
                  label="Cleanliness" 
                  icon={<Sparkles size={18}/>} 
                  value={profile.cleanliness} 
                  options={options.cleanliness} 
                  onChange={(v) => setProfile({...profile, cleanliness: v})} 
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <SelectField 
                  label="Study Habits" 
                  icon={<BookOpen size={18}/>} 
                  value={profile.study} 
                  options={options.study} 
                  onChange={(v) => setProfile({...profile, study: v})} 
                />
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase px-1">
                    <Edit3 size={14}/> Tell us about yourself
                  </label>
                  <textarea 
                    value={profile.aboutMe}
                    onChange={(e) => setProfile({...profile, aboutMe: e.target.value})}
                    placeholder="Describe your hobbies, interests, or what you're looking for in a roommate..."
                    className="w-full h-32 p-4 bg-slate-950/40 border border-white/10 rounded-xl focus:border-accent-gold/50 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center py-10 space-y-6">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 text-emerald-500 mb-4 animate-pulse">
                  <CheckCircle size={48} />
                </div>
                <h3 className="text-2xl font-bold">Profile Ready!</h3>
                <p className="text-slate-400">Your preferences are saved. We will now prioritize roommate matches that fit your lifestyle.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4 text-xs">
                  {Object.values(profile).filter(v => v.length < 20).map(v => (
                    <span key={v} className="px-3 py-1 bg-white/5 rounded-full border border-white/5 text-slate-400 uppercase tracking-widest">{v}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex justify-between items-center gap-4">
          <button 
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="text-slate-500 hover:text-white disabled:opacity-0 transition-opacity"
          >Back</button>
          
          <button 
            onClick={handleNext}
            className="premium-btn btn-gold w-full md:w-auto px-12"
          >
            {step === 3 ? 'Get Started' : 'Next Step'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const SelectField = ({ label, icon, value, options, onChange }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase px-1">
      {icon} {label}
    </label>
    <div className="grid grid-cols-1 gap-2">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 bg-slate-950/40 border border-white/10 rounded-xl focus:border-accent-gold/50 outline-none transition-all cursor-pointer appearance-none text-sm"
      >
        {options.map(o => <option key={o} value={o} className="bg-slate-900">{o}</option>)}
      </select>
    </div>
  </div>
);

export default AboutMeModal;
