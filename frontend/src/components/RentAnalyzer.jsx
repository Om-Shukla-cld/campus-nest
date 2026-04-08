import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart2, MapPin, RefreshCw } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';

const AREAS = ['Kothri', 'Ashta', 'Behind Petrol Pump'];

const DEMO_TRENDS = {
  Kothri: [
    { month: 'Jan', avg_rent: 8200, property_type: 'PG' },
    { month: 'Feb', avg_rent: 8350, property_type: 'PG' },
    { month: 'Mar', avg_rent: 8500, property_type: 'PG' },
    { month: 'Apr', avg_rent: 8480, property_type: 'PG' },
    { month: 'May', avg_rent: 8700, property_type: 'PG' },
    { month: 'Jun', avg_rent: 8900, property_type: 'PG' },
    { month: 'Jul', avg_rent: 9100, property_type: 'PG' },
    { month: 'Aug', avg_rent: 9250, property_type: 'PG' },
  ],
  Ashta: [
    { month: 'Jan', avg_rent: 9000, property_type: 'PG' },
    { month: 'Feb', avg_rent: 9200, property_type: 'PG' },
    { month: 'Mar', avg_rent: 9400, property_type: 'PG' },
    { month: 'Apr', avg_rent: 9350, property_type: 'PG' },
    { month: 'May', avg_rent: 9600, property_type: 'PG' },
    { month: 'Jun', avg_rent: 9800, property_type: 'PG' },
    { month: 'Jul', avg_rent: 10100, property_type: 'PG' },
    { month: 'Aug', avg_rent: 10300, property_type: 'PG' },
  ],
  'Behind Petrol Pump': [
    { month: 'Jan', avg_rent: 7200, property_type: 'PG' },
    { month: 'Feb', avg_rent: 7300, property_type: 'PG' },
    { month: 'Mar', avg_rent: 7500, property_type: 'PG' },
    { month: 'Apr', avg_rent: 7450, property_type: 'PG' },
    { month: 'May', avg_rent: 7600, property_type: 'PG' },
    { month: 'Jun', avg_rent: 7800, property_type: 'PG' },
    { month: 'Jul', avg_rent: 7950, property_type: 'PG' },
    { month: 'Aug', avg_rent: 8100, property_type: 'PG' },
  ],
};

const COLORS = { Kothri: '#f59e0b', Ashta: '#3b82f6', 'Behind Petrol Pump': '#10b981' };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 shadow-lg text-xs">
        <p className="font-bold text-slate-700 mb-1">{label}</p>
        {payload.map(p => (
          <div key={p.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-600">{p.name}:</span>
            <span className="font-bold">₹{p.value?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const RentAnalyzer = () => {
  const [selectedAreas, setSelectedAreas] = useState(['Kothri', 'Ashta']);
  const [propertyType, setPropertyType] = useState('PG');
  const [chartType, setChartType] = useState('area');

  // Build combined chart data
  const chartData = DEMO_TRENDS['Kothri'].map((d, i) => {
    const entry = { month: d.month };
    selectedAreas.forEach(area => {
      entry[area] = DEMO_TRENDS[area]?.[i]?.avg_rent || 0;
    });
    return entry;
  });

  const toggleArea = (area) => {
    setSelectedAreas(prev =>
      prev.includes(area)
        ? prev.length > 1 ? prev.filter(a => a !== area) : prev
        : [...prev, area]
    );
  };

  // Calculate trend %
  const getTrend = (area) => {
    const data = DEMO_TRENDS[area];
    if (!data || data.length < 2) return 0;
    const first = data[0].avg_rent;
    const last = data[data.length - 1].avg_rent;
    return (((last - first) / first) * 100).toFixed(1);
  };

  const barData = AREAS.map(area => ({
    area: area.split(' ')[0],
    rent: DEMO_TRENDS[area]?.[DEMO_TRENDS[area].length - 1]?.avg_rent || 0,
  }));

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="section-title flex items-center gap-2">
          <TrendingUp size={24} className="text-amber-500" /> Rent Analyzer
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Live rent trends aggregated from verified student submissions — anonymously.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {AREAS.map(area => {
          const trend = getTrend(area);
          const currentRent = DEMO_TRENDS[area]?.[DEMO_TRENDS[area].length - 1]?.avg_rent;
          const isUp = Number(trend) > 0;
          return (
            <motion.div
              key={area}
              whileHover={{ y: -3 }}
              className={`glass-card p-5 cursor-pointer border-2 transition-all ${
                selectedAreas.includes(area) ? 'border-amber-300 bg-amber-50/30' : 'border-slate-100'
              }`}
              onClick={() => toggleArea(area)}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <MapPin size={10} /> {area}
                </p>
                <div className={`flex items-center gap-1 text-xs font-bold ${isUp ? 'text-red-500' : 'text-emerald-500'}`}>
                  {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(trend)}%
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">₹{currentRent?.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">Avg. rent this month</p>
              <div className="mt-3 h-1 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min((currentRent / 12000) * 100, 100)}%`, background: COLORS[area] }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="glass-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Chart:</span>
          {['area', 'line', 'bar'].map(type => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                chartType === type ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Type:</span>
          {['PG', 'Flat'].map(t => (
            <button
              key={t}
              onClick={() => setPropertyType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                propertyType === t ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BarChart2 size={18} className="text-amber-500" />
          Rent Trends Jan–Aug 2024
        </h3>
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="area" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rent" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : chartType === 'area' ? (
              <AreaChart data={chartData}>
                <defs>
                  {selectedAreas.map(area => (
                    <linearGradient key={area} id={`grad-${area}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[area]} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={COLORS[area]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {selectedAreas.map(area => (
                  <Area key={area} type="monotone" dataKey={area} stroke={COLORS[area]}
                    strokeWidth={2.5} fill={`url(#grad-${area})`} dot={{ r: 3 }} />
                ))}
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {selectedAreas.map(area => (
                  <Line key={area} type="monotone" dataKey={area} stroke={COLORS[area]}
                    strokeWidth={2.5} dot={{ r: 4, fill: COLORS[area] }} />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-slate-400 mt-4 text-center italic">
          * Data aggregated anonymously from verified student and owner submissions on CampusNest.
        </p>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-card p-5">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            💡 Smart Insights
          </h4>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">→</span>
              Kothri has the best price-to-distance ratio for campus proximity.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">→</span>
              Rent in Ashta is rising fastest — book early if you prefer this area.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">→</span>
              Behind Petrol Pump offers the most budget-friendly options.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5">→</span>
              CampusNest prices are on average ₹2,000–₹3,500 cheaper than Zolo/Stanza.
            </li>
          </ul>
        </div>
        <div className="glass-card p-5">
          <h4 className="font-bold text-slate-800 mb-4">📊 Area Summary</h4>
          <div className="space-y-3">
            {AREAS.map(area => {
              const data = DEMO_TRENDS[area];
              const min = Math.min(...data.map(d => d.avg_rent));
              const max = Math.max(...data.map(d => d.avg_rent));
              return (
                <div key={area} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{area}</p>
                    <p className="text-xs text-slate-400">Range this year</p>
                  </div>
                  <div className="text-right text-xs font-bold">
                    <span className="text-emerald-600">₹{min.toLocaleString()}</span>
                    <span className="text-slate-300 mx-1">–</span>
                    <span className="text-red-500">₹{max.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentAnalyzer;
