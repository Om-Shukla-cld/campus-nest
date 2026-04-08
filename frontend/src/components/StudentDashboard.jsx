import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Home, Wrench, Users, MapPin,
  TrendingUp, Scale, LogOut, Filter,
  Star, ShieldCheck, Ghost, Car,
  TrendingDown, UserCheck, Bell, ChevronRight,
  MessageSquare, X, BarChart2
} from 'lucide-react';
import CompareProperties from './CompareProperties';
import RentAnalyzer from './RentAnalyzer';
import SmartTransport from './SmartTransport';
import CommunityHub from './CommunityHub';
import GetServices from './GetServices';

// ─── Demo data ───────────────────────────────────────────────────────────────
const PROPERTIES = [
  { id: 1, name: "Sunshine PG", type: "PG", area: "Kothri", rent: 8500, otherPrice: 10500, rating: 4.5, safety: 4.8, distance: "1.2km", amenities: ["Wifi", "Inverter", "Food"], gender: "Boys", slots: [{ occupied: true, pref: ["Veg", "Non-smoker"], snippet: "Quiet, clean environment preferred." }, { occupied: false }] },
  { id: 2, name: "Royal Stay PG", type: "PG", area: "Behind Petrol Pump", rent: 7000, otherPrice: 9000, rating: 3.2, safety: 2.8, distance: "3.1km", amenities: ["Wifi"], gender: "Co-ed", slots: [{ occupied: true, pref: ["Non-veg", "Smoker"], snippet: "Flexible schedule." }, { occupied: false }] },
  { id: 3, name: "Luxury Haven", type: "PG", area: "Ashta", rent: 15000, otherPrice: 18500, rating: 4.8, safety: 5.0, distance: "0.8km", amenities: ["Wifi", "Food", "AC"], gender: "Girls", slots: [{ occupied: true, pref: ["Veg"], snippet: "Early bird, library dweller." }, { occupied: false }] },
  { id: 4, name: "Zolo Horizon", type: "PG", area: "Kothri", rent: 9500, otherPrice: 12000, rating: 4.4, safety: 4.6, distance: "1.5km", amenities: ["Wifi", "Gym"], gender: "Co-ed", slots: [{ occupied: false }, { occupied: false }] },
  { id: 5, name: "Stanza Living", type: "PG", area: "Ashta", rent: 11000, otherPrice: 14500, rating: 4.3, safety: 4.7, distance: "2.0km", amenities: ["Food", "Wifi"], gender: "Girls", slots: [{ occupied: true, pref: ["Veg"], snippet: "Study from home type." }, { occupied: false }] },
  { id: 6, name: "Comfort PG", type: "PG", area: "Behind Petrol Pump", rent: 6500, otherPrice: 8500, rating: 3.5, safety: 3.0, distance: "2.8km", amenities: ["Inverter"], gender: "Boys", slots: [{ occupied: true, pref: ["Non-smoker"], snippet: "Night owl, flexible." }, { occupied: false }] },
  { id: 7, name: "Elite Stay", type: "PG", area: "Kothri", rent: 13000, otherPrice: 16000, rating: 4.9, safety: 5.0, distance: "0.5km", amenities: ["Wifi", "AC", "Food"], gender: "Co-ed", slots: [{ occupied: true, pref: ["Veg"] }, { occupied: false }] },
  { id: 8, name: "Student Home", type: "PG", area: "Ashta", rent: 8000, otherPrice: 10000, rating: 4.1, safety: 4.2, distance: "1.8km", amenities: ["Wifi", "Parking"], gender: "Co-ed", slots: [{ occupied: false }, { occupied: false }] },
  { id: 9, name: "Modern Nest", type: "PG", area: "Kothri", rent: 10000, otherPrice: 13000, rating: 4.6, safety: 4.8, distance: "1.1km", amenities: ["Wifi", "Food"], gender: "Girls", slots: [{ occupied: true, pref: ["Non-smoker"] }, { occupied: false }] },
  { id: 10, name: "Safe Haven", type: "PG", area: "Ashta", rent: 14000, otherPrice: 17500, rating: 4.7, safety: 4.9, distance: "0.9km", amenities: ["Wifi", "Inverter", "Food"], gender: "Co-ed", slots: [{ occupied: true, pref: ["Veg"] }, { occupied: false }] },
  { id: 11, name: "Gomti Apartments", type: "Flat", area: "Ashta", rent: 25000, otherPrice: 32000, rating: 4.5, safety: 4.8, distance: "2.2km", amenities: ["Parking", "Inverter"], gender: "Any", slots: [{ occupied: true, pref: ["Veg"] }, { occupied: false }] },
  { id: 12, name: "Unity Flat", type: "Flat", area: "Kothri", rent: 18000, otherPrice: 24000, rating: 4.2, safety: 4.5, distance: "1.5km", amenities: ["Wifi"], gender: "Any", slots: [{ occupied: true, pref: ["Non-smoker"] }, { occupied: false }] },
  { id: 13, name: "Urban Residencies", type: "Flat", area: "Ashta", rent: 35000, otherPrice: 45000, rating: 4.8, safety: 4.9, distance: "3.5km", amenities: ["Gym", "Parking"], gender: "Any", slots: [{ occupied: false }, { occupied: false }] },
  { id: 14, name: "Metro Heights", type: "Flat", area: "Behind Petrol Pump", rent: 22000, otherPrice: 28000, rating: 3.9, safety: 3.8, distance: "2.5km", amenities: ["Inverter"], gender: "Any", slots: [{ occupied: true, pref: ["Flexible"] }, { occupied: false }] },
  { id: 15, name: "Skyline Flat", type: "Flat", area: "Kothri", rent: 28000, otherPrice: 38000, rating: 4.6, safety: 4.7, distance: "1.8km", amenities: ["Wifi", "Parking"], gender: "Any", slots: [{ occupied: true, pref: ["Veg"] }, { occupied: false }] },
];

const NAV = [
  { id: 'home', label: 'Dashboard', icon: <Home size={18} /> },
  { id: 'search-pg', label: 'Search PG', icon: <Search size={18} /> },
  { id: 'search-flat', label: 'Search Flat', icon: <Search size={18} /> },
  { id: 'services', label: 'Get Services', icon: <Wrench size={18} /> },
  null,
  { id: 'trends', label: 'Rent Analyzer', icon: <BarChart2 size={18} /> },
  { id: 'compare', label: 'Compare', icon: <Scale size={18} /> },
  { id: 'transport', label: 'Smart Transport', icon: <Car size={18} /> },
  { id: 'community', label: 'Community', icon: <Users size={18} /> },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const StudentDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [filters, setFilters] = useState({ gender: 'all', amenity: 'all', maxRent: '' });
  const [showFilters, setShowFilters] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeView user={user} onSelect={setActiveTab} />;
      case 'search-pg':
      case 'search-flat':
        const type = activeTab === 'search-pg' ? 'PG' : 'Flat';
        const filtered = PROPERTIES.filter(p => {
          if (p.type !== type) return false;
          if (filters.gender !== 'all' && p.gender !== filters.gender && p.gender !== 'Co-ed' && p.gender !== 'Any') return false;
          if (filters.amenity !== 'all' && !p.amenities.includes(filters.amenity)) return false;
          if (filters.maxRent && p.rent > Number(filters.maxRent)) return false;
          return true;
        });
        return (
          <PropertySearch
            type={type} properties={filtered}
            onDetail={setSelectedProperty}
            filters={filters} setFilters={setFilters}
            showFilters={showFilters} setShowFilters={setShowFilters}
          />
        );
      case 'services': return <GetServices />;
      case 'trends': return <RentAnalyzer />;
      case 'compare': return <CompareProperties />;
      case 'transport': return <SmartTransport />;
      case 'community': return <CommunityHub />;
      default: return <HomeView user={user} onSelect={setActiveTab} />;
    }
  };

  return (
    <div className="sidebar-layout">
      {/* Sidebar */}
      <aside className="sidebar p-5 flex flex-col shadow-sm">
        <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Home size={16} className="text-white" />
          </div>
          <span className="font-black text-slate-900 text-lg tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            CampusNest
          </span>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto hide-scrollbar">
          {NAV.map((item, i) =>
            item === null ? (
              <div key={i} className="my-3 border-t border-slate-100" />
            ) : (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item w-full text-left ${activeTab === item.id ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            )
          )}
        </nav>

        <div className="mt-4 pt-4 border-t border-slate-100 space-y-1">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-black text-amber-700 text-sm">
              {user?.name?.[0] || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Student'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.regNo || user?.reg_no || 'Verified Student'}</p>
            </div>
          </div>
          <button onClick={onLogout} className="nav-item w-full text-red-400 hover:bg-red-50 hover:text-red-500">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-8 py-3 flex items-center justify-between">
          <h1 className="font-bold text-slate-800 capitalize text-sm">
            {NAV.find(n => n?.id === activeTab)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-3">
            <div className="verified-badge text-xs">
              <ShieldCheck size={12} /> Face ID Verified
            </div>
            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell size={16} className="text-slate-500" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Property Detail Modal */}
      <AnimatePresence>
        {selectedProperty && (
          <PropertyDetailModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Home View ────────────────────────────────────────────────────────────────
const HomeView = ({ user, onSelect }) => (
  <div className="space-y-8 pb-12">
    <div>
      <h1 className="text-3xl font-black text-slate-900" style={{ fontFamily: 'Syne, sans-serif' }}>
        Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋
      </h1>
      <p className="text-slate-500 mt-1">Find your perfect stay, connect with peers, and save money.</p>
    </div>

    {/* Quick Actions */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Search PG', tab: 'search-pg', icon: '🏠', color: 'from-amber-50 to-orange-50', border: 'border-amber-100' },
        { label: 'Search Flat', tab: 'search-flat', icon: '🏢', color: 'from-blue-50 to-indigo-50', border: 'border-blue-100' },
        { label: 'Get Services', tab: 'services', icon: '🛠️', color: 'from-emerald-50 to-teal-50', border: 'border-emerald-100' },
        { label: 'Community', tab: 'community', icon: '💬', color: 'from-purple-50 to-pink-50', border: 'border-purple-100' },
      ].map(card => (
        <motion.button
          key={card.tab}
          whileHover={{ y: -4, scale: 1.02 }}
          onClick={() => onSelect(card.tab)}
          className={`glass-card p-5 text-left bg-gradient-to-br ${card.color} border ${card.border} group cursor-pointer`}
        >
          <div className="text-3xl mb-3">{card.icon}</div>
          <p className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition-colors">{card.label}</p>
          <ChevronRight size={14} className="text-slate-300 group-hover:text-amber-500 transition-colors mt-1" />
        </motion.button>
      ))}
    </div>

    {/* AI Recommendations */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="glass-card p-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Star size={16} className="text-amber-500" /> AI Recommendations For You
        </h3>
        <div className="space-y-3">
          {[
            { name: 'Luxury Haven', tags: ['Library Dweller', 'Veg-Friendly'], price: '₹15,000', saving: '₹3,500' },
            { name: 'Elite Stay', tags: ['Best Rated', 'Near Campus'], price: '₹13,000', saving: '₹3,000' },
            { name: 'Modern Nest', tags: ['Girls PG', 'Clean Area'], price: '₹10,000', saving: '₹3,000' },
          ].map(r => (
            <div key={r.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
              <div>
                <p className="font-semibold text-slate-800 text-sm">{r.name}</p>
                <div className="flex gap-1 mt-1">
                  {r.tags.map(t => <span key={t} className="tag tag-gold text-[10px]">{t}</span>)}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-slate-900">{r.price}</p>
                <p className="text-[10px] text-emerald-600 font-semibold">Save {r.saving}/mo</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingDown size={16} className="text-emerald-500" /> Your Savings Tracker
        </h3>
        <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 text-center mb-4">
          <p className="text-xs text-emerald-600 font-medium mb-1">Booking through CampusNest saves you:</p>
          <p className="text-3xl font-black text-emerald-700">₹2,000–₹3,500</p>
          <p className="text-xs text-emerald-500 mt-1">per month vs Zolo/Stanza Living</p>
        </div>
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex justify-between py-1 border-b border-slate-50">
            <span>Zolo average (Kothri)</span>
            <span className="font-bold text-red-400">₹10,500</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-50">
            <span>Stanza Living average</span>
            <span className="font-bold text-red-400">₹11,000</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="font-semibold text-slate-800">CampusNest average</span>
            <span className="font-bold text-emerald-600">₹8,500</span>
          </div>
        </div>
      </div>
    </div>

    {/* Quick Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Properties Listed', value: '15+', icon: '🏠' },
        { label: 'Verified Reviews', value: '120+', icon: '⭐' },
        { label: 'Students Helped', value: '500+', icon: '🎓' },
        { label: 'Avg. Saving/Month', value: '₹2,500', icon: '💰' },
      ].map(s => (
        <div key={s.label} className="glass-card p-4 text-center">
          <div className="text-2xl mb-1">{s.icon}</div>
          <p className="text-xl font-black text-slate-900">{s.value}</p>
          <p className="text-xs text-slate-500 font-medium">{s.label}</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── Property Search ──────────────────────────────────────────────────────────
const PropertySearch = ({ type, properties, onDetail, filters, setFilters, showFilters, setShowFilters }) => (
  <div className="space-y-6 pb-12">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="section-title">Verified {type}s</h2>
        <p className="text-slate-500 text-sm mt-1">{properties.length} listings • Anonymous reviews only</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500">
          <Ghost size={12} /> Anonymous Reviews
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary text-xs flex items-center gap-1.5 ${showFilters ? 'border-amber-300 bg-amber-50 text-amber-700' : ''}`}
        >
          <Filter size={12} /> Filters
        </button>
      </div>
    </div>

    {/* Filters Panel */}
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="glass-card p-5 overflow-hidden"
        >
          <div className="flex flex-wrap gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Gender Type</label>
              <div className="flex gap-2">
                {['all', 'Boys', 'Girls', 'Co-ed'].map(g => (
                  <button
                    key={g}
                    onClick={() => setFilters(f => ({ ...f, gender: g }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      filters.gender === g ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-slate-200 text-slate-600 hover:border-amber-200'
                    }`}
                  >
                    {g === 'all' ? 'All' : g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Amenity</label>
              <div className="flex gap-2 flex-wrap">
                {['all', 'Wifi', 'Inverter', 'Food', 'Parking', 'AC', 'Gym'].map(a => (
                  <button
                    key={a}
                    onClick={() => setFilters(f => ({ ...f, amenity: a }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      filters.amenity === a ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-slate-200 text-slate-600 hover:border-amber-200'
                    }`}
                  >
                    {a === 'all' ? 'All' : a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Max Rent (₹)</label>
              <input
                type="number"
                className="input-field w-36 py-1.5 text-xs"
                placeholder="e.g. 10000"
                value={filters.maxRent}
                onChange={e => setFilters(f => ({ ...f, maxRent: e.target.value }))}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Property Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {properties.map(p => (
        <motion.div
          key={p.id}
          whileHover={{ y: -4 }}
          onClick={() => onDetail(p)}
          className="property-card group"
        >
          <div className="relative h-44 overflow-hidden">
            <img src="/pg-preview.png" className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500" alt={p.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute top-3 left-3">
              <span className={`tag text-[10px] border ${p.gender === 'Boys' ? 'bg-blue-50/90 text-blue-700 border-blue-200' : p.gender === 'Girls' ? 'bg-pink-50/90 text-pink-700 border-pink-200' : 'bg-white/90 text-slate-700 border-slate-200'}`}>
                {p.gender}
              </span>
            </div>
            <div className="absolute top-3 right-3 px-2 py-1 bg-amber-500 rounded-lg text-[10px] font-bold text-white shadow-sm">
              ✓ Verified
            </div>
            <div className="absolute bottom-3 right-3">
              <div className={`w-2 h-2 rounded-full ${p.slots.some(s => !s.occupied) ? 'bg-emerald-400 slot-available' : 'bg-red-400'}`} />
            </div>
          </div>

          <div className="p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{p.name}</h3>
                <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                  <MapPin size={10} /> {p.area} • {p.distance}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-slate-900">₹{p.rent.toLocaleString()}</p>
                <p className="text-xs text-red-400 line-through">₹{p.otherPrice.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {p.amenities.map(a => <span key={a} className="tag tag-slate text-[10px]">{a}</span>)}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
              <div className="flex items-center gap-1 text-amber-600 font-bold">
                <Star size={12} fill="currentColor" /> {p.rating}
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <ShieldCheck size={12} className="text-emerald-500" /> Safety {p.safety}/5
              </div>
              <div className={`font-bold ${p.slots.some(s => !s.occupied) ? 'text-emerald-600' : 'text-red-400'}`}>
                {p.slots.filter(s => !s.occupied).length} slots open
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>

    {properties.length === 0 && (
      <div className="glass-card p-12 text-center">
        <p className="text-4xl mb-3">🏠</p>
        <p className="font-semibold text-slate-500">No properties match your filters.</p>
        <button onClick={() => setFilters({ gender: 'all', amenity: 'all', maxRent: '' })} className="btn-primary mt-4 text-sm">
          Clear Filters
        </button>
      </div>
    )}
  </div>
);

// ─── Property Detail Modal ────────────────────────────────────────────────────
const PropertyDetailModal = ({ property: p, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      className="relative w-full max-w-5xl bg-white max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-3xl shadow-2xl"
    >
      <button onClick={onClose} className="absolute top-5 right-5 z-10 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors">
        <X size={18} />
      </button>

      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="md:w-2/5 h-64 md:h-auto relative flex-shrink-0">
          <img src="/pg-preview.png" className="w-full h-full object-cover" alt={p.name} />
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className={`tag border ${p.gender === 'Boys' ? 'bg-blue-50/90 text-blue-700 border-blue-200' : p.gender === 'Girls' ? 'bg-pink-50/90 text-pink-700 border-pink-200' : 'bg-white/90 text-slate-700 border-slate-200'}`}>
              {p.gender}
            </span>
            <span className="tag bg-amber-500/90 text-white border-0">✓ Verified</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 p-8 space-y-7 overflow-y-auto">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Syne, sans-serif' }}>{p.name}</h2>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-1"><MapPin size={12} /> {p.area} • {p.distance} from campus</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-amber-500" fill="currentColor" />
                <span className="font-bold text-sm">{p.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                <ShieldCheck size={14} /> Safety {p.safety}/5
              </div>
            </div>
          </div>

          {/* Price Comparison */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
            <h4 className="text-xs font-black text-emerald-700 uppercase tracking-wide mb-4 flex items-center gap-1.5">
              <TrendingDown size={14} /> Price Comparison
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-emerald-100">
                <span className="font-bold text-slate-800">CampusNest (Verified)</span>
                <span className="font-black text-emerald-600 text-lg">₹{p.rent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                <span className="text-slate-500">Zolo Stays</span>
                <span className="text-red-400 line-through font-semibold">₹{p.otherPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                <span className="text-slate-500">Stanza Living</span>
                <span className="text-red-400 line-through font-semibold">₹{Math.round(p.otherPrice * 1.08).toLocaleString()}</span>
              </div>
              <div className="text-center pt-1">
                <span className="text-xs font-black text-emerald-700">
                  💰 You save ₹{(p.otherPrice - p.rent).toLocaleString()} every month!
                </span>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {p.amenities.map(a => <span key={a} className="tag tag-slate">{a}</span>)}
            </div>
          </div>

          {/* Roommate Matching */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <UserCheck size={14} /> Room Occupancy & Roommate Preferences
            </h4>
            <div className="space-y-3">
              {p.slots.map((slot, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-4 border ${slot.occupied ? 'bg-slate-50 border-slate-200' : 'bg-emerald-50 border-emerald-200'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Slot {i + 1}</span>
                    <span className={`tag text-[10px] border ${slot.occupied ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200 slot-available'}`}>
                      {slot.occupied ? '● Occupied' : '● Available'}
                    </span>
                  </div>
                  {slot.occupied ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {(slot.pref || []).map(pref => (
                          <span key={pref} className="tag tag-blue text-[10px]">{pref}</span>
                        ))}
                      </div>
                      {slot.snippet && (
                        <p className="text-xs text-slate-500 italic">"{slot.snippet}"</p>
                      )}
                    </div>
                  ) : (
                    <button className="btn-primary w-full text-xs py-2 mt-1">
                      Book This Slot
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2 italic">
              🔒 Privacy: Tenant names and identities are never revealed.
            </p>
          </div>

          {/* Reviews preview */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <Ghost size={12} /> Anonymous Review
            </h4>
            <p className="text-sm text-slate-700 italic">
              "Great place, very clean and safe. Highly recommended for students who want peace and quiet."
            </p>
            <div className="flex gap-2 text-xs">
              {[['Noise', '4.2'], ['Electricity', '4.0'], ['Owner', '4.8']].map(([k, v]) => (
                <span key={k} className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-semibold text-slate-600">
                  {k}: {v}⭐
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3 pt-2">
            <button className="btn-primary flex-1 flex items-center justify-center gap-2">
              Request Visit
            </button>
            <button className="btn-secondary flex items-center gap-1.5 text-sm">
              <MapPin size={14} /> Map
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);

export default StudentDashboard;
