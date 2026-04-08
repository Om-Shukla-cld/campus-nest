import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Clock, MapPin, Users, Plus, CheckCircle, ArrowRight } from 'lucide-react';

const TIMES = ['07:30 AM', '08:00 AM', '09:00 AM', '09:30 AM', '10:00 AM', '12:00 PM', '02:00 PM', '05:00 PM'];

const DEMO_GROUPS = [
  { id: 1, departure_time: '08:00 AM', from_area: 'Kothri Junction', to_area: 'VIT Campus', transport_type: 'Car', max_members: 4, member_count: 2, members: ['Rahul', 'Priya'] },
  { id: 2, departure_time: '09:00 AM', from_area: 'Ashta Main Road', to_area: 'VIT Campus', transport_type: 'Auto', max_members: 3, member_count: 1, members: ['Sneha'] },
  { id: 3, departure_time: '09:00 AM', from_area: 'Behind Petrol Pump', to_area: 'VIT Campus', transport_type: 'Bike', max_members: 2, member_count: 1, members: ['Aman'] },
  { id: 4, departure_time: '10:00 AM', from_area: 'Kothri Gate', to_area: 'VIT Campus', transport_type: 'Car', max_members: 4, member_count: 3, members: ['Vivek', 'Riya', 'Harsh'] },
];

const TRANSPORT_ICONS = { Car: '🚗', Auto: '🛺', Bike: '🏍️', Bus: '🚌' };

const SmartTransport = () => {
  const [selectedTime, setSelectedTime] = useState('09:00 AM');
  const [joined, setJoined] = useState(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ time: '09:00 AM', from: '', transport: 'Car' });

  const filtered = DEMO_GROUPS.filter(g => !selectedTime || g.departure_time === selectedTime);

  const handleJoin = (groupId) => {
    setJoined(prev => new Set([...prev, groupId]));
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <Car size={24} className="text-emerald-500" /> Smart Transport
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Match with students travelling to campus at the same time. Save money, make friends.
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-xs">
          <Plus size={14} /> Create Group
        </button>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Groups', value: '12', icon: '🚗', color: 'amber' },
          { label: 'Students Matched', value: '48', icon: '👥', color: 'blue' },
          { label: 'Avg. Saving/Month', value: '₹800', icon: '💰', color: 'emerald' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="text-xl font-black text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Time Picker */}
      <div className="glass-card p-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Clock size={12} /> Filter by Departure Time
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTime(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              !selectedTime ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Times
          </button>
          {TIMES.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTime(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedTime === t ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Groups List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <Car size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="font-semibold text-slate-500">No groups for this time slot yet.</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary mt-4 text-sm">
              Create the first group
            </button>
          </div>
        ) : (
          filtered.map(group => {
            const hasJoined = joined.has(group.id);
            const isFull = group.member_count >= group.max_members;
            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card p-5 flex items-center justify-between hover:shadow-md transition-all ${
                  hasJoined ? 'border-emerald-200 bg-emerald-50/30' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{TRANSPORT_ICONS[group.transport_type] || '🚗'}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">{group.from_area}</span>
                      <ArrowRight size={14} className="text-slate-400" />
                      <span className="font-bold text-slate-900">{group.to_area}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={10} /> {group.departure_time}</span>
                      <span className="flex items-center gap-1"><Users size={10} /> {group.member_count}/{group.max_members} members</span>
                      <span className="flex items-center gap-1"><Car size={10} /> {group.transport_type}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {group.members.map((m, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-amber-700">
                          {m[0]}
                        </div>
                      ))}
                      {group.max_members - group.member_count > 0 && (
                        <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400">
                          +{group.max_members - group.member_count}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                    isFull ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {isFull ? 'Full' : `${group.max_members - group.member_count} slots left`}
                  </div>
                  {hasJoined ? (
                    <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
                      <CheckCircle size={16} /> Joined!
                    </div>
                  ) : (
                    <button
                      onClick={() => handleJoin(group.id)}
                      disabled={isFull}
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                        isFull
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                      }`}
                    >
                      Join Trip
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-card p-8 w-full max-w-md"
            >
              <h3 className="font-bold text-xl text-slate-900 mb-6">Create Commute Group</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">From Area</label>
                  <input
                    className="input-field"
                    placeholder="e.g. Kothri Junction"
                    value={newGroup.from}
                    onChange={e => setNewGroup({ ...newGroup, from: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Departure Time</label>
                  <select
                    className="input-field"
                    value={newGroup.time}
                    onChange={e => setNewGroup({ ...newGroup, time: e.target.value })}
                  >
                    {TIMES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Transport Type</label>
                  <div className="flex gap-2">
                    {['Car', 'Auto', 'Bike', 'Bus'].map(t => (
                      <button
                        key={t}
                        onClick={() => setNewGroup({ ...newGroup, transport: t })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          newGroup.transport === t ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {TRANSPORT_ICONS[t]} {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={() => {
                    setShowCreate(false);
                    alert('Commute group created! Others can now join your trip.');
                  }}
                  className="btn-primary flex-1"
                >
                  Create Group
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartTransport;
