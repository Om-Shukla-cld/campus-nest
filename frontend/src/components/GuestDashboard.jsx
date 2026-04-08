import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, TrendingUp, Info, LogOut, Star, ShieldCheck, Ghost, Lock, ArrowRight } from 'lucide-react';

const DEMO_LISTINGS = [
  { id: 1, name: 'Sunshine PG', area: 'Kothri', rent: 8500, rating: 4.5, type: 'PG', gender: 'Boys', available: true },
  { id: 2, name: 'Luxury Haven', area: 'Ashta', rent: 15000, rating: 4.8, type: 'PG', gender: 'Girls', available: true },
  { id: 3, name: 'Elite Stay', area: 'Kothri', rent: 13000, rating: 4.9, type: 'PG', gender: 'Co-ed', available: true },
  { id: 4, name: 'Gomti Apartments', area: 'Ashta', rent: 25000, rating: 4.5, type: 'Flat', gender: 'Any', available: true },
  { id: 5, name: 'Urban Residencies', area: 'Ashta', rent: 35000, rating: 4.8, type: 'Flat', gender: 'Any', available: false },
];

const GuestDashboard = ({ onLogout }) => {
  const [search, setSearch] = useState('');

  const filtered = DEMO_LISTINGS.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.area.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">C</span>
          </div>
          <span className="font-black text-slate-900 text-lg tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            CampusNest
          </span>
          <span className="tag bg-slate-100 text-slate-500 border-slate-200 text-[10px] border flex items-center gap-1">
            <Ghost size={9} /> Guest Mode
          </span>
        </div>
        <button onClick={onLogout} className="btn-secondary text-xs flex items-center gap-1.5">
          <LogOut size={14} /> Exit Guest Mode
        </button>
      </header>

      <div className="max-w-5xl mx-auto p-8 space-y-10">
        {/* Upgrade Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4"
        >
          <div className="text-3xl flex-shrink-0">🎓</div>
          <div className="flex-1">
            <p className="font-bold text-amber-800">You're browsing as a Guest</p>
            <p className="text-amber-700 text-sm mt-0.5">
              Login with your VTOP student ID to unlock reviews, roommate matching, community, and services.
            </p>
          </div>
          <button onClick={onLogout} className="btn-primary text-sm flex-shrink-0 flex items-center gap-1.5">
            Login as Student <ArrowRight size={14} />
          </button>
        </motion.div>

        {/* Search */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            Explore Properties 🏠
          </h1>
          <p className="text-slate-500 text-sm mb-5">Browse verified PGs and flats near campus. Log in for full access.</p>
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input-field pl-11 text-base py-3.5"
              placeholder="Search by property name or area..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Properties Listed', value: '15+', icon: '🏠' },
            { label: 'Areas Covered', value: '3', icon: '📍' },
            { label: 'Avg. Rent (PG)', value: '₹9,500', icon: '💰' },
          ].map(s => (
            <div key={s.label} className="glass-card p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="text-xl font-black text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Listings */}
        <div>
          <h2 className="font-bold text-slate-800 mb-4">{filtered.length} Properties Available</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => (
              <motion.div
                key={p.id}
                whileHover={{ y: -3 }}
                className="glass-card overflow-hidden group cursor-pointer hover:shadow-md transition-all hover:border-amber-200"
              >
                <div className="relative h-40 overflow-hidden bg-slate-100">
                  <img src="/pg-preview.png" className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500" alt={p.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className={`tag border text-[10px] ${p.type === 'PG' ? 'tag-blue' : 'tag-green'}`}>{p.type}</span>
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-lg">
                    ✓ Verified
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                      <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5"><MapPin size={9} /> {p.area}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">₹{p.rent.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">/month</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star size={11} fill="currentColor" /> {p.rating}
                    </div>
                    <span className={`font-semibold ${p.available ? 'text-emerald-600' : 'text-red-400'}`}>
                      {p.available ? '● Slots Available' : '● Full'}
                    </span>
                  </div>

                  {/* Blurred features (login required) */}
                  <div className="relative">
                    <div className="text-[10px] text-slate-300 blur-sm select-none">
                      Reviews • Roommate info • Services nearby • Book slot
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-1 bg-white/90 border border-slate-200 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-500 shadow-sm">
                        <Lock size={8} /> Login to unlock
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Locked features preview */}
        <div className="glass-card p-6 border-blue-100 bg-blue-50/30">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Lock size={16} className="text-blue-500" /> Features Unlocked with Student Login
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: '⭐', label: 'Anonymous Reviews' },
              { icon: '👥', label: 'Roommate Matching' },
              { icon: '💬', label: 'Community Hub' },
              { icon: '🛠️', label: 'Local Services' },
              { icon: '🚗', label: 'Smart Transport' },
              { icon: '📊', label: 'Rent Analyzer' },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-2 bg-white rounded-xl p-3 border border-slate-100 text-sm font-medium text-slate-700">
                <span>{f.icon}</span> {f.label}
              </div>
            ))}
          </div>
          <button onClick={onLogout} className="btn-primary mt-5 flex items-center gap-2">
            Create Student Account <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestDashboard;
