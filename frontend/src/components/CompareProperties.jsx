import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, X, Plus, Star, Wifi, Zap, Utensils, Car, ShieldCheck, MapPin, TrendingDown } from 'lucide-react';

const DEMO_PROPERTIES = [
  { id: 1, name: "Sunshine PG", type: "PG", area: "Kothri", rent: 8500, otherPrice: 10500, safety: 4.8, distance: "1.2km", amenities: ["Wifi", "Inverter", "Food"], gender: "Boys", rating: 4.5, noise: 4.2, electricity: 4.0, ownerBehavior: 4.8 },
  { id: 3, name: "Luxury Haven", type: "PG", area: "Ashta", rent: 15000, otherPrice: 18500, safety: 5.0, distance: "0.8km", amenities: ["Wifi", "Food", "AC"], gender: "Girls", rating: 4.8, noise: 5.0, electricity: 4.9, ownerBehavior: 5.0 },
  { id: 7, name: "Elite Stay", type: "PG", area: "Kothri", rent: 13000, otherPrice: 16000, safety: 5.0, distance: "0.5km", amenities: ["Wifi", "AC", "Food"], gender: "Co-ed", rating: 4.9, noise: 4.8, electricity: 5.0, ownerBehavior: 4.7 },
  { id: 11, name: "Gomti Apartments", type: "Flat", area: "Ashta", rent: 25000, otherPrice: 32000, safety: 4.8, distance: "2.2km", amenities: ["Parking", "Inverter"], gender: "Any", rating: 4.5, noise: 4.3, electricity: 4.1, ownerBehavior: 4.6 },
  { id: 13, name: "Urban Residencies", type: "Flat", area: "Ashta", rent: 35000, otherPrice: 45000, safety: 4.9, distance: "3.5km", amenities: ["Gym", "Parking"], gender: "Any", rating: 4.8, noise: 4.7, electricity: 4.8, ownerBehavior: 4.9 },
];

const AMENITY_ICONS = {
  Wifi: <Wifi size={14} />,
  Inverter: <Zap size={14} />,
  Food: <Utensils size={14} />,
  Parking: <Car size={14} />,
  AC: '❄️',
  Gym: '🏋️',
};

const CompareProperties = () => {
  const [selected, setSelected] = useState([DEMO_PROPERTIES[0], DEMO_PROPERTIES[1]]);
  const [picker, setPicker] = useState(null); // index slot being picked

  const addToCompare = (prop) => {
    if (picker !== null) {
      const updated = [...selected];
      updated[picker] = prop;
      setSelected(updated);
      setPicker(null);
    }
  };

  const removeSlot = (idx) => {
    const updated = [...selected];
    updated.splice(idx, 1);
    setSelected(updated);
  };

  const addSlot = () => {
    if (selected.length < 3) {
      setSelected([...selected, null]);
      setPicker(selected.length);
    }
  };

  const getBest = (key) => {
    const vals = selected.filter(Boolean).map(p => p[key]);
    return Math.max(...vals);
  };

  const rows = [
    { label: 'Monthly Rent', key: 'rent', format: v => `₹${v.toLocaleString()}`, lowerIsBetter: true },
    { label: 'Other Platform Price', key: 'otherPrice', format: v => `₹${v.toLocaleString()}`, lowerIsBetter: true },
    { label: 'Safety Score', key: 'safety', format: v => `${v}/5`, lowerIsBetter: false },
    { label: 'Distance', key: 'distance', format: v => v, lowerIsBetter: true, skip: true },
    { label: 'Overall Rating', key: 'rating', format: v => `⭐ ${v}`, lowerIsBetter: false },
    { label: 'Noise Level', key: 'noise', format: v => `${v}/5`, lowerIsBetter: false },
    { label: 'Electricity', key: 'electricity', format: v => `${v}/5`, lowerIsBetter: false },
    { label: 'Owner Behavior', key: 'ownerBehavior', format: v => `${v}/5`, lowerIsBetter: false },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title flex items-center gap-2"><Scale size={24} className="text-amber-500" /> Compare Properties</h2>
          <p className="text-slate-500 text-sm mt-1">Side-by-side comparison of up to 3 properties</p>
        </div>
        {selected.length < 3 && (
          <button onClick={addSlot} className="btn-primary flex items-center gap-2 text-xs">
            <Plus size={14} /> Add Property
          </button>
        )}
      </div>

      {/* Property Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {selected.map((prop, idx) => (
          <div key={idx} className="glass-card p-5 relative">
            <button
              onClick={() => removeSlot(idx)}
              className="absolute top-3 right-3 p-1 rounded-full bg-slate-100 hover:bg-red-100 hover:text-red-500 transition-colors"
            >
              <X size={14} />
            </button>
            {prop ? (
              <div>
                <div className="h-28 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl mb-4 flex items-center justify-center">
                  <img src="/pg-preview.png" className="h-full w-full object-cover rounded-xl opacity-70" alt={prop.name} />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{prop.name}</h3>
                <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                  <MapPin size={12} /> {prop.area} • {prop.distance}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xl font-black text-amber-600">₹{prop.rent.toLocaleString()}</span>
                  <span className={`tag ${prop.gender === 'Boys' ? 'tag-blue' : prop.gender === 'Girls' ? 'tag-red' : 'tag-green'}`}>
                    {prop.gender}
                  </span>
                </div>
                <button
                  onClick={() => setPicker(idx)}
                  className="mt-3 w-full btn-secondary text-xs py-2"
                >
                  Change Property
                </button>
              </div>
            ) : (
              <button
                onClick={() => setPicker(idx)}
                className="w-full h-48 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-xl hover:border-amber-300 hover:bg-amber-50 transition-all"
              >
                <Plus size={28} className="text-slate-300" />
                <span className="text-slate-400 text-sm font-medium">Select Property</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Property Picker Modal */}
      <AnimatePresence>
        {picker !== null && (
          <div className="modal-overlay" onClick={() => setPicker(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-card p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
            >
              <h3 className="font-bold text-lg mb-4 text-slate-900">Select a Property</h3>
              <div className="space-y-3">
                {DEMO_PROPERTIES.filter(p => !selected.find(s => s?.id === p.id)).map(p => (
                  <button
                    key={p.id}
                    onClick={() => addToCompare(p)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 rounded-xl transition-all text-left"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      <p className="text-slate-500 text-xs">{p.area} • {p.type}</p>
                    </div>
                    <span className="font-bold text-amber-600">₹{p.rent.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Comparison Table */}
      {selected.filter(Boolean).length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-900">Detailed Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wide w-40">Feature</th>
                  {selected.filter(Boolean).map(p => (
                    <th key={p.id} className="p-4 text-center text-sm font-bold text-slate-700">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map(row => {
                  if (row.skip) return null;
                  const best = row.lowerIsBetter
                    ? Math.min(...selected.filter(Boolean).map(p => p[row.key]))
                    : Math.max(...selected.filter(Boolean).map(p => p[row.key]));
                  return (
                    <tr key={row.key} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">{row.label}</td>
                      {selected.filter(Boolean).map(p => {
                        const isBest = p[row.key] === best;
                        return (
                          <td key={p.id} className="p-4 text-center">
                            <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-bold ${
                              isBest ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-700'
                            }`}>
                              {row.format(p[row.key])}
                              {isBest && <span className="ml-1 text-xs">✓</span>}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Amenities Row */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amenities</td>
                  {selected.filter(Boolean).map(p => (
                    <td key={p.id} className="p-4">
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {p.amenities.map(a => (
                          <span key={a} className="tag tag-slate flex items-center gap-1">
                            {AMENITY_ICONS[a] || '•'} {a}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Savings Row */}
                <tr className="bg-emerald-50">
                  <td className="p-4 text-xs font-semibold text-emerald-700 uppercase tracking-wide">💰 Your Saving vs Others</td>
                  {selected.filter(Boolean).map(p => (
                    <td key={p.id} className="p-4 text-center">
                      <span className="text-emerald-700 font-black text-sm">
                        ₹{(p.otherPrice - p.rent).toLocaleString()}/mo
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CompareProperties;
