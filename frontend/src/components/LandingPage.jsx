import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Home, ShieldCheck, MapPin, Phone, Camera, User, ArrowRight, X, Eye, EyeOff, CheckCircle } from 'lucide-react';
import api from '../utils/api';

const LandingPage = ({ onLogin }) => {
  const [showAuth, setShowAuth] = useState(null);
  const [step, setStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    phone: '', regNo: '', otp: '', name: '', gender: 'Co-ed',
    propertyName: '', propertyLocation: '', parentPhone: '',
  });

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSendOtp = async () => {
    if (!form.phone) return;
    setLoading(true);
    await api.sendOtp(form.phone);
    setLoading(false);
    setOtpSent(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (showAuth === 'student-reg') {
        const res = await api.registerStudent({
          phone: form.phone, reg_no: form.regNo, otp_code: form.otp || '1234',
          name: form.name, gender: form.gender, parent_phone: form.parentPhone,
        });
        if (res?.access_token) {
          localStorage.setItem('campusnest_token', res.access_token);
          onLogin('student', { id: res.user_id, name: form.name || 'Student', regNo: form.regNo, profileComplete: res.profile_complete });
          return;
        }
      }
      if (showAuth === 'student-login') {
        const res = await api.loginStudent(form.regNo || form.phone, form.otp || '1234');
        if (res?.access_token) {
          localStorage.setItem('campusnest_token', res.access_token);
          onLogin('student', { id: res.user_id, name: 'Student', profileComplete: res.profile_complete });
          return;
        }
      }
      if (showAuth === 'owner-reg') {
        const res = await api.registerOwner({ name: form.name, phone: form.phone, otp_code: form.otp || '1234' });
        if (res?.access_token) {
          localStorage.setItem('campusnest_token', res.access_token);
          onLogin('owner', { id: res.user_id, name: form.name });
          return;
        }
      }
    } catch {}

    // Fallback: demo login without backend
    if (showAuth?.includes('student')) {
      onLogin('student', { id: 1, name: form.name || 'Demo Student', regNo: form.regNo || '21BCE0001', profileComplete: false });
    } else if (showAuth?.includes('owner')) {
      onLogin('owner', { id: 2, name: form.name || 'Demo Owner' });
    } else if (showAuth === 'moderator') {
      onLogin('moderator', { id: 0, name: 'Moderator' });
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src="/vit-bg.jpg" className="w-full h-full object-cover scale-105" alt="Campus" />
        <div className="absolute inset-0 bg-black/60" />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col items-center">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold px-4 py-2 rounded-full mb-6 backdrop-blur-sm"
          >
            <ShieldCheck size={12} /> Verified Housing Platform for Students
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black text-white mb-4 leading-none tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            CAMPUS<span className="text-amber-400">NEST</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 font-medium max-w-xl mx-auto leading-relaxed">
            Find Your Perfect Stay.{' '}
            <span className="text-amber-400 font-bold">Trusted by Students.</span>
          </p>

          <div className="flex items-center justify-center gap-8 mt-8 text-white/60 text-sm font-medium">
            <span className="flex items-center gap-1.5">✓ 15+ Verified Properties</span>
            <span className="flex items-center gap-1.5">✓ Anonymous Reviews</span>
            <span className="flex items-center gap-1.5">✓ Roommate Matching</span>
          </div>
        </motion.div>

        {/* Auth Cards or Form */}
        <AnimatePresence mode="wait">
          {!showAuth ? (
            <motion.div
              key="cards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl"
            >
              <AuthCard
                icon="🎓"
                title="Student Portal"
                desc="Find PGs, Flats & match roommates with AI-powered recommendations."
                onClick={() => setShowAuth('student-login')}
                cta="Student Login"
                color="amber"
                badge="Most Popular"
              />
              <AuthCard
                icon="👁️"
                title="Guest Explore"
                desc="Browse property listings without registering. No signup needed."
                onClick={() => onLogin('guest', { name: 'Guest User' })}
                cta="Browse Now"
                color="blue"
              />
              <AuthCard
                icon="🏠"
                title="List Property"
                desc="Property owners can register and manage their listings with ease."
                onClick={() => setShowAuth('owner-reg')}
                cta="Register as Owner"
                color="emerald"
              />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md"
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative">
                <button
                  onClick={() => { setShowAuth(null); setOtpSent(false); setStep(1); }}
                  className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X size={18} className="text-slate-500" />
                </button>

                <h2 className="text-2xl font-black text-slate-900 mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {showAuth === 'student-reg' && 'Student Registration'}
                  {showAuth === 'student-login' && 'Student Login'}
                  {showAuth === 'owner-reg' && 'Owner Registration'}
                  {showAuth === 'moderator' && 'Moderator Access'}
                </h2>
                <p className="text-slate-400 text-sm mb-7">
                  {showAuth?.includes('login') ? 'Use OTP 1234 for demo access' : 'All fields are required for verification'}
                </p>

                <div className="space-y-4">
                  {/* Student Login */}
                  {showAuth === 'student-login' && (
                    <>
                      <FormField icon={<GraduationCap size={16} />} label="Reg No or Phone" value={form.regNo} onChange={v => update('regNo', v)} placeholder="21BCE0001 or +91XXXXXXXXXX" />
                      <OtpField phone={form.phone} otp={form.otp} onPhoneChange={v => update('phone', v)} onOtpChange={v => update('otp', v)} sent={otpSent} onSend={handleSendOtp} />
                      <p className="text-xs text-slate-400 text-center">
                        New student?{' '}
                        <button onClick={() => setShowAuth('student-reg')} className="text-amber-600 font-bold hover:underline">Register here</button>
                      </p>
                    </>
                  )}

                  {/* Student Register */}
                  {showAuth === 'student-reg' && (
                    <>
                      <FormField icon={<User size={16} />} label="Full Name" value={form.name} onChange={v => update('name', v)} placeholder="Your full name" />
                      <FormField icon={<GraduationCap size={16} />} label="Registration Number" value={form.regNo} onChange={v => update('regNo', v)} placeholder="21BCE0001" />
                      <OtpField phone={form.phone} otp={form.otp} onPhoneChange={v => update('phone', v)} onOtpChange={v => update('otp', v)} sent={otpSent} onSend={handleSendOtp} />
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Gender</label>
                        <div className="flex gap-2">
                          {['Male', 'Female', 'Other'].map(g => (
                            <button key={g} onClick={() => update('gender', g)}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${form.gender === g ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-amber-300 transition-colors cursor-pointer group">
                        <Camera size={24} className="text-slate-300 group-hover:text-amber-400 mx-auto mb-2 transition-colors" />
                        <p className="text-xs text-slate-400 font-medium">Face ID Registration (Optional)</p>
                        <p className="text-[10px] text-slate-300 mt-0.5">Upload a photo for biometric verification</p>
                      </div>
                      <FormField icon={<Phone size={16} />} label="Parent Phone (Optional)" value={form.parentPhone} onChange={v => update('parentPhone', v)} placeholder="+91XXXXXXXXXX" />
                      <p className="text-xs text-slate-400 text-center">
                        Already registered?{' '}
                        <button onClick={() => setShowAuth('student-login')} className="text-amber-600 font-bold hover:underline">Login here</button>
                      </p>
                    </>
                  )}

                  {/* Owner Register */}
                  {showAuth === 'owner-reg' && (
                    <>
                      <FormField icon={<User size={16} />} label="Owner Full Name" value={form.name} onChange={v => update('name', v)} placeholder="Your full name" />
                      <OtpField phone={form.phone} otp={form.otp} onPhoneChange={v => update('phone', v)} onOtpChange={v => update('otp', v)} sent={otpSent} onSend={handleSendOtp} />
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-emerald-300 transition-colors cursor-pointer">
                        <Camera size={24} className="text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-400 font-medium">Upload Owner Photo (Optional)</p>
                      </div>
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 font-medium">
                        ⚠️ Owner accounts require moderator approval before you can list properties.
                      </div>
                    </>
                  )}

                  {/* Moderator */}
                  {showAuth === 'moderator' && (
                    <>
                      <FormField icon={<ShieldCheck size={16} />} label="Moderator Phone" value={form.phone} onChange={v => update('phone', v)} placeholder="+910000000000" />
                      <p className="text-xs text-slate-400 text-center">Demo: use +910000000000</p>
                    </>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full btn-primary py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {showAuth?.includes('login') ? 'Login to Portal' : 'Create Account'}
                        <ArrowRight size={16} />
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Moderator link */}
              {showAuth !== 'moderator' && (
                <p className="text-center mt-4 text-white/40 text-xs">
                  Moderator?{' '}
                  <button onClick={() => setShowAuth('moderator')} className="text-white/60 font-bold hover:text-white transition-colors underline">
                    Access here
                  </button>
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const AuthCard = ({ icon, title, desc, onClick, cta, color, badge }) => {
  const colors = {
    amber: 'hover:border-amber-400/50 hover:bg-amber-500/10',
    blue: 'hover:border-blue-400/50 hover:bg-blue-500/10',
    emerald: 'hover:border-emerald-400/50 hover:bg-emerald-500/10',
  };
  const btnColors = {
    amber: 'bg-amber-500 hover:bg-amber-400 text-white',
    blue: 'bg-blue-600 hover:bg-blue-500 text-white',
    emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white',
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      onClick={onClick}
      className={`relative bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-7 flex flex-col items-center text-center cursor-pointer transition-all duration-200 ${colors[color]} group`}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap">
          {badge}
        </div>
      )}
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h3>
      <p className="text-white/60 text-sm leading-relaxed mb-6">{desc}</p>
      <span className={`w-full py-2.5 px-5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${btnColors[color]}`}>
        {cta} <ArrowRight size={14} />
      </span>
    </motion.div>
  );
};

const FormField = ({ icon, label, value, onChange, placeholder, type = 'text' }) => (
  <div>
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">{label}</label>
    <div className="relative group">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors">
        {icon}
      </div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10"
      />
    </div>
  </div>
);

const OtpField = ({ phone, otp, onPhoneChange, onOtpChange, sent, onSend }) => (
  <div className="space-y-3">
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Phone Number</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="tel"
            value={phone}
            onChange={e => onPhoneChange(e.target.value)}
            placeholder="+91XXXXXXXXXX"
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={onSend}
          disabled={!phone}
          className="px-4 py-2.5 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 border border-slate-200 hover:border-amber-200 text-slate-600 text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {sent ? '✓ Sent' : 'Send OTP'}
        </button>
      </div>
    </div>
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">OTP Code</label>
      <div className="relative">
        <ShieldCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={otp}
          onChange={e => onOtpChange(e.target.value)}
          placeholder="Enter OTP (Demo: 1234)"
          maxLength={6}
          className="input-field pl-10 tracking-widest"
        />
      </div>
    </div>
  </div>
);

export default LandingPage;
