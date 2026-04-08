import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Star, MapPin, ShieldCheck, Search, Zap, Droplets, ChefHat, UtensilsCrossed, Truck, Filter } from 'lucide-react';

const SERVICE_TYPES = [
  { key: 'all', label: 'All', icon: '✦' },
  { key: 'Electrician', label: 'Electrician', icon: '⚡' },
  { key: 'Plumber', label: 'Plumber', icon: '🔧' },
  { key: 'Maid', label: 'Maid', icon: '🧹' },
  { key: 'Cook', label: 'Cook', icon: '👨‍🍳' },
  { key: 'Tiffin', label: 'Tiffin', icon: '🍱' },
];

const SERVICES = [
  { id: 1, service_type: 'Electrician', provider_name: 'Ram Singh Electricals', phone: '+91 98321 44556', area: 'Kothri', rating: 4.9, is_verified: true, description: 'All types of electrical work, AC servicing, wiring', response: '< 30 min', price: '₹200–500' },
  { id: 2, service_type: 'Electrician', provider_name: 'Mohan Repairs', phone: '+91 92345 67890', area: 'Ashta', rating: 4.5, is_verified: true, description: 'Fan, inverter, switchboard repair & installation', response: '< 1 hr', price: '₹150–400' },
  { id: 3, service_type: 'Plumber', provider_name: 'Quick Fix Co.', phone: '+91 99887 76655', area: 'Kothri', rating: 4.7, is_verified: true, description: 'Pipe leaks, tap repair, bathroom fitting', response: '< 45 min', price: '₹200–600' },
  { id: 4, service_type: 'Plumber', provider_name: 'Pipe Masters', phone: '+91 98765 43210', area: 'Behind Petrol Pump', rating: 4.2, is_verified: false, description: 'Emergency plumbing, drainage clearing, fitting', response: '< 2 hr', price: '₹180–500' },
  { id: 5, service_type: 'Maid', provider_name: 'Home Help Co.', phone: '+91 91234 56789', area: 'Ashta', rating: 4.5, is_verified: true, description: 'Daily cleaning, utensil washing, room tidying. Flexible schedule.', response: 'Next morning', price: '₹1,500/mo' },
  { id: 6, service_type: 'Cook', provider_name: 'Chef Sunita', phone: '+91 98760 12345', area: 'Kothri', rating: 4.8, is_verified: true, description: 'Home-cooked Veg/Non-veg meals. North Indian cuisine specialist.', response: 'Daily 7am–9am', price: '₹2,500/mo' },
  { id: 7, service_type: 'Tiffin', provider_name: "Ma's Kitchen", phone: '+91 88776 65544', area: 'Kothri', rating: 5.0, is_verified: true, description: 'Fresh homestyle tiffin. Lunch + Dinner. Veg only. Monthly subscription.', response: 'Daily delivery', price: '₹2,800/mo' },
  { id: 8, service_type: 'Tiffin', provider_name: 'Shree Tiffin Centre', phone: '+91 87654 32109', area: 'Ashta', rating: 4.6, is_verified: true, description: 'Veg & Non-veg thali. Trial week available at no extra cost.', response: 'Daily 1pm & 8pm', price: '₹2,500/mo' },
];

const ServiceCard = ({ service }) => {
  const [showContact, setShowContact] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="glass-card p-5 space-y-4 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{SERVICE_TYPES.find(s => s.key === service.service_type)?.icon || '⚙️'}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{service.service_type}</span>
            {service.is_verified && (
              <span className="verified-badge text-[10px]">
                <ShieldCheck size={10} /> Verified
              </span>
            )}
          </div>
          <h3 className="font-black text-slate-900 text-lg">{service.provider_name}</h3>
          <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
            <MapPin size={10} /> {service.area}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2.5 py-1.5 rounded-xl">
          <Star size={12} className="text-amber-500" fill="currentColor" />
          <span className="text-sm font-black text-amber-700">{service.rating}</span>
        </div>
      </div>

      <p className="text-slate-600 text-sm leading-relaxed">{service.description}</p>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-50 rounded-lg p-2.5">
          <p className="text-slate-400 font-medium">Response Time</p>
          <p className="font-bold text-slate-700 mt-0.5">{service.response}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2.5">
          <p className="text-slate-400 font-medium">Starting Price</p>
          <p className="font-bold text-amber-600 mt-0.5">{service.price}</p>
        </div>
      </div>

      <div className="flex gap-3 pt-2 border-t border-slate-50">
        <button
          onClick={() => setShowContact(!showContact)}
          className="flex-1 btn-primary text-xs flex items-center justify-center gap-2"
        >
          <Phone size={12} /> {showContact ? service.phone : 'Show Contact'}
        </button>
        <button className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-1 transition-all">
          <MapPin size={12} /> Map
        </button>
      </div>
    </motion.div>
  );
};

const GetServices = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = SERVICES.filter(s => {
    const matchType = selectedType === 'all' || s.service_type === selectedType;
    const matchSearch = !search || s.provider_name.toLowerCase().includes(search.toLowerCase()) || s.area.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="section-title">🛠️ Nest Care Services</h2>
        <p className="text-slate-500 text-sm mt-1">Trusted local service providers, vetted by CampusNest team.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input-field pl-10"
          placeholder="Search provider or area..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Type Filter */}
      <div className="flex flex-wrap gap-2">
        {SERVICE_TYPES.map(t => (
          <button
            key={t.key}
            onClick={() => setSelectedType(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              selectedType === t.key
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-amber-200 hover:bg-amber-50'
            }`}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2">
        <div className="text-sm text-slate-500 font-medium">{filtered.length} service providers found</div>
        {filtered.some(s => s.is_verified) && (
          <span className="verified-badge text-[10px]"><ShieldCheck size={10} /> CampusNest Verified</span>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-12 text-center">
          <p className="text-3xl mb-3">🔍</p>
          <p className="font-semibold text-slate-500">No services found matching your criteria.</p>
        </div>
      )}

      {/* Submit new service CTA */}
      <div className="glass-card p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-800">Know a reliable service provider?</h4>
            <p className="text-sm text-slate-500 mt-1">Help your fellow students by recommending trusted providers.</p>
          </div>
          <button className="btn-primary text-sm flex-shrink-0">Submit Provider</button>
        </div>
      </div>
    </div>
  );
};

export default GetServices;
