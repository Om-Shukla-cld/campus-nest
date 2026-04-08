import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Users, CreditCard, AlertCircle,
  Plus, CheckCircle, XCircle, LogOut,
  TrendingUp, ChevronRight, Home, Bell,
  DollarSign, BarChart2, CheckSquare, X
} from 'lucide-react';

const PROPERTIES = [
  {
    id: 1, name: 'Sunshine PG', area: 'Kothri', type: 'PG', rent: 8500,
    totalStudents: 3, pendingIssues: 1, totalRent: '₹25,500',
    approval_status: 'APPROVED',
    students: [
      { id: '21BCE0001', name: 'Abhishek Kumar', rentStatus: 'PAID', issue: false, slot: 'Room A – Slot 1' },
      { id: '21BCE0042', name: 'Rahul Sharma', rentStatus: 'UNPAID', issue: true, issueDesc: 'Water supply issue in bathroom', slot: 'Room A – Slot 2' },
      { id: '21BCE0115', name: 'Sneha Kapoor', rentStatus: 'PAID', issue: false, slot: 'Room B – Slot 1' },
    ],
  },
  {
    id: 2, name: 'Green View Flat', area: 'Ashta', type: 'Flat', rent: 18000,
    totalStudents: 2, pendingIssues: 0, totalRent: '₹36,000',
    approval_status: 'APPROVED',
    students: [
      { id: '21BCE0998', name: 'Ishaan Patel', rentStatus: 'PAID', issue: false, slot: 'Room A – Slot 1' },
      { id: '21BCE1042', name: 'Meera Singh', rentStatus: 'PARTIAL', issue: false, slot: 'Room B – Slot 1' },
    ],
  },
  {
    id: 3, name: 'Sunrise Hostel', area: 'Behind Petrol Pump', type: 'PG', rent: 7000,
    totalStudents: 0, pendingIssues: 0, totalRent: '₹0',
    approval_status: 'PENDING',
    students: [],
  },
];

const OwnerDashboard = ({ user, onLogout }) => {
  const [activeProperty, setActiveProperty] = useState(null);
  const [properties, setProperties] = useState(PROPERTIES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [rentUpdating, setRentUpdating] = useState(null);

  const totalRent = properties.reduce((sum, p) => sum + p.students.filter(s => s.rentStatus === 'PAID').length * (p.rent), 0);
  const totalStudents = properties.reduce((sum, p) => sum + p.totalStudents, 0);
  const totalIssues = properties.reduce((sum, p) => sum + p.pendingIssues, 0);

  const markRentPaid = (propId, studentId) => {
    setProperties(prev => prev.map(p =>
      p.id === propId
        ? { ...p, students: p.students.map(s => s.id === studentId ? { ...s, rentStatus: 'PAID' } : s) }
        : p
    ));
  };

  const resolveIssue = (propId, studentId) => {
    setProperties(prev => prev.map(p =>
      p.id === propId
        ? {
            ...p,
            students: p.students.map(s => s.id === studentId ? { ...s, issue: false } : s),
            pendingIssues: Math.max(0, p.pendingIssues - 1),
          }
        : p
    ));
  };

  return (
    <div className="sidebar-layout">
      {/* Sidebar */}
      <aside className="sidebar p-5 flex flex-col shadow-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <span className="font-black text-slate-900 text-lg tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            Owner Portal
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          <button
            onClick={() => setActiveProperty(null)}
            className={`nav-item w-full text-left ${!activeProperty ? 'active' : ''}`}
          >
            <TrendingUp size={18} /> Overview
          </button>
          <div className="pt-3 pb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">My Properties</p>
          </div>
          {properties.map(p => (
            <button
              key={p.id}
              onClick={() => setActiveProperty(p)}
              className={`nav-item w-full text-left relative ${activeProperty?.id === p.id ? 'active' : ''}`}
            >
              <Building2 size={16} />
              <span className="truncate flex-1">{p.name}</span>
              {p.pendingIssues > 0 && (
                <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
              )}
            </button>
          ))}
          <button
            onClick={() => setShowAddModal(true)}
            className="nav-item w-full text-left text-emerald-600 hover:bg-emerald-50"
          >
            <Plus size={16} /> List New Property
          </button>
        </nav>

        <div className="mt-4 pt-4 border-t border-slate-100 space-y-1">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-black text-emerald-700 text-sm">
              {user?.name?.[0] || 'O'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Property Owner'}</p>
              <p className="text-[10px] text-slate-400">Owner Account</p>
            </div>
          </div>
          <button onClick={onLogout} className="nav-item w-full text-red-400 hover:bg-red-50 hover:text-red-500">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-8 py-3 flex items-center justify-between">
          <h1 className="font-bold text-slate-800 text-sm">
            {activeProperty ? activeProperty.name : 'Overview'}
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus size={14} /> List New Property
          </button>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProperty?.id || 'overview'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {!activeProperty ? (
                <Overview
                  properties={properties}
                  totalRent={totalRent}
                  totalStudents={totalStudents}
                  totalIssues={totalIssues}
                  onSelect={setActiveProperty}
                />
              ) : (
                <PropertyView
                  property={properties.find(p => p.id === activeProperty.id)}
                  onMarkPaid={markRentPaid}
                  onResolveIssue={resolveIssue}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Add Property Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-card p-8 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-xl text-slate-900">List New Property</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                  <X size={18} className="text-slate-500" />
                </button>
              </div>
              <div className="space-y-4">
                <input className="input-field" placeholder="Property Name" />
                <div className="grid grid-cols-2 gap-3">
                  <select className="input-field">
                    <option>PG</option>
                    <option>Flat</option>
                  </select>
                  <select className="input-field">
                    <option>Boys</option>
                    <option>Girls</option>
                    <option>Co-ed</option>
                  </select>
                </div>
                <input className="input-field" placeholder="Area / Location" />
                <input className="input-field" type="number" placeholder="Monthly Rent (₹)" />
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 font-medium">
                  📍 Google Maps integration — click to pin your property location (coming soon)
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Property Images</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-amber-300 transition-colors cursor-pointer">
                    <p className="text-slate-400 text-sm">Click to upload property images</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-amber-600 font-medium mt-4 bg-amber-50 rounded-lg p-3 border border-amber-100">
                ⚠️ Your listing will go live after moderator approval (usually within 24 hours).
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={() => { setShowAddModal(false); alert('Property submitted for approval!'); }} className="btn-primary flex-1">
                  Submit for Approval
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Overview = ({ properties, totalRent, totalStudents, totalIssues, onSelect }) => (
  <div className="space-y-8 pb-12">
    <div>
      <h2 className="section-title">Portfolio Overview</h2>
      <p className="text-slate-500 text-sm mt-1">Manage all your properties and tenants from one place.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <StatCard label="Total Monthly Revenue" value={`₹${totalRent.toLocaleString()}`} color="emerald" icon={<DollarSign size={20} />} />
      <StatCard label="Active Tenants" value={String(totalStudents)} color="blue" icon={<Users size={20} />} />
      <StatCard label="Pending Issues" value={String(totalIssues)} color={totalIssues > 0 ? 'red' : 'emerald'} icon={<AlertCircle size={20} />} />
    </div>

    <div>
      <h3 className="font-bold text-slate-800 mb-4">My Properties</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {properties.map(p => (
          <motion.div
            key={p.id}
            whileHover={{ y: -2 }}
            onClick={() => onSelect(p)}
            className="glass-card p-5 cursor-pointer hover:shadow-md transition-all hover:border-emerald-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-black text-slate-900">{p.name}</h4>
                  <span className={`tag text-[10px] border ${
                    p.approval_status === 'APPROVED' ? 'tag-green' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {p.approval_status}
                  </span>
                </div>
                <p className="text-slate-400 text-xs">{p.area} • {p.type}</p>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 rounded-xl p-2.5">
                <p className="text-lg font-black text-slate-900">{p.totalStudents}</p>
                <p className="text-[10px] text-slate-400 font-medium">Tenants</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-2.5">
                <p className="text-lg font-black text-emerald-700">{p.totalRent}</p>
                <p className="text-[10px] text-emerald-500 font-medium">Revenue</p>
              </div>
              <div className={`rounded-xl p-2.5 ${p.pendingIssues > 0 ? 'bg-red-50' : 'bg-slate-50'}`}>
                <p className={`text-lg font-black ${p.pendingIssues > 0 ? 'text-red-600' : 'text-slate-500'}`}>
                  {p.pendingIssues}
                </p>
                <p className={`text-[10px] font-medium ${p.pendingIssues > 0 ? 'text-red-400' : 'text-slate-400'}`}>Issues</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, color, icon }) => {
  const colorMap = {
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    red: 'bg-red-50 border-red-100 text-red-700',
  };
  return (
    <div className={`glass-card p-5 border ${colorMap[color] || colorMap.emerald}`}>
      <div className="flex items-center gap-2 mb-3 opacity-70">{icon} <span className="text-xs font-bold uppercase tracking-wide">{label}</span></div>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
};

const PropertyView = ({ property: p, onMarkPaid, onResolveIssue }) => {
  if (!p) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="section-title">{p.name}</h2>
          <p className="text-slate-500 text-sm mt-1">{p.area} • {p.type} • ₹{p.rent.toLocaleString()}/mo per slot</p>
        </div>
        <span className={`tag border text-xs ${p.approval_status === 'APPROVED' ? 'tag-green' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
          {p.approval_status}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-black text-slate-900">{p.totalStudents}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Active Tenants</p>
        </div>
        <div className="glass-card p-4 text-center bg-emerald-50 border-emerald-100">
          <p className="text-2xl font-black text-emerald-700">{p.students.filter(s => s.rentStatus === 'PAID').length}</p>
          <p className="text-xs text-emerald-500 font-medium mt-0.5">Rent Paid</p>
        </div>
        <div className={`glass-card p-4 text-center ${p.pendingIssues > 0 ? 'bg-red-50 border-red-100' : ''}`}>
          <p className={`text-2xl font-black ${p.pendingIssues > 0 ? 'text-red-600' : 'text-slate-900'}`}>{p.pendingIssues}</p>
          <p className={`text-xs font-medium mt-0.5 ${p.pendingIssues > 0 ? 'text-red-400' : 'text-slate-500'}`}>Open Issues</p>
        </div>
      </div>

      {/* Student Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Tenant Management</h3>
        </div>
        {p.students.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No tenants yet.</p>
            {p.approval_status === 'PENDING' && (
              <p className="text-amber-600 text-sm mt-2">⏳ Awaiting moderator approval before students can book.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {['Student ID', 'Name', 'Room/Slot', 'Rent Status', 'Issue', 'Actions'].map(h => (
                    <th key={h} className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {p.students.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-xs text-amber-600 font-bold">{s.id}</td>
                    <td className="p-4 font-semibold text-slate-800 text-sm">{s.name}</td>
                    <td className="p-4 text-xs text-slate-500">{s.slot}</td>
                    <td className="p-4">
                      <span className={`tag border text-[10px] ${
                        s.rentStatus === 'PAID' ? 'tag-green' :
                        s.rentStatus === 'PARTIAL' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'tag-red'
                      }`}>
                        {s.rentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`status-dot ${s.issue ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <span className="text-[10px] font-semibold text-slate-500">
                          {s.issue ? 'Issue Raised' : 'All Clear'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {s.rentStatus !== 'PAID' && (
                          <button
                            onClick={() => onMarkPaid(p.id, s.id)}
                            className="text-[10px] px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle size={10} /> Mark Paid
                          </button>
                        )}
                        {s.issue && (
                          <button
                            onClick={() => onResolveIssue(p.id, s.id)}
                            className="text-[10px] px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition-colors flex items-center gap-1"
                          >
                            <CheckSquare size={10} /> Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Issue Details */}
      {p.students.some(s => s.issue) && (
        <div className="glass-card p-5 border-red-100 bg-red-50/50">
          <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
            <AlertCircle size={16} /> Open Issues
          </h4>
          {p.students.filter(s => s.issue).map(s => (
            <div key={s.id} className="bg-white rounded-xl p-4 border border-red-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{s.name} ({s.id})</p>
                  <p className="text-slate-600 text-sm mt-1">"{s.issueDesc || 'Issue reported by tenant'}"</p>
                </div>
                <button
                  onClick={() => onResolveIssue(p.id, s.id)}
                  className="btn-primary text-xs flex items-center gap-1 flex-shrink-0"
                >
                  <CheckCircle size={12} /> Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default OwnerDashboard;
