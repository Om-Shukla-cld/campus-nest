import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, CheckCircle, XCircle, AlertTriangle,
  FileText, Settings, LogOut, Users, ShieldAlert,
  Award, BarChart2, Eye, MessageSquare, Home, X
} from 'lucide-react';

const PENDING_OWNERS = [
  { id: 101, name: 'Rajesh Gupta', phone: '+91 98001 11223', created: '2 hours ago', properties: 'Comfort PG, Kothri' },
  { id: 102, name: 'Anita Sharma', phone: '+91 97654 32109', created: '5 hours ago', properties: 'Girls Nest Hostel, Ashta' },
];

const PENDING_PROPERTIES = [
  { id: 201, name: 'Royal Flat 4BHK', area: 'Ashta', rent: 32000, type: 'Flat', owner: 'Ramesh K.', images: 2 },
  { id: 202, name: 'New Boys PG', area: 'Kothri', rent: 9000, type: 'PG', owner: 'Sanjay M.', images: 5 },
];

const PENDING_REVIEWS = [
  { id: 301, property: 'Royal Stay PG', comment: 'Owner is very rude and never responds to issues.', rating: 1.5, flag: 'Reported as potentially fake' },
  { id: 302, property: 'Comfort PG', comment: 'Great place, clean rooms, highly recommend!', rating: 4.8, flag: null },
];

const ALL_PROPERTIES = [
  { id: 1, name: 'Sunshine PG', rent: '₹8,500', owner: 'Ramesh K.', status: 'APPROVED', area: 'Kothri' },
  { id: 2, name: 'Luxury Haven', rent: '₹15,000', owner: 'Sneha S.', status: 'APPROVED', area: 'Ashta' },
  { id: 3, name: 'Green View Flat', rent: '₹18,000', owner: 'Amit M.', status: 'APPROVED', area: 'Ashta' },
  { id: 4, name: 'Sunrise Hostel', rent: '₹7,000', owner: 'Rajesh G.', status: 'PENDING', area: 'Behind Petrol Pump' },
];

const NAV = [
  { id: 'queue', label: 'Verification Queue', icon: <Award size={18} /> },
  { id: 'properties', label: 'All Properties', icon: <FileText size={18} /> },
  { id: 'disputes', label: 'Disputes & Safety', icon: <AlertTriangle size={18} /> },
  { id: 'reviews', label: 'Review Moderation', icon: <MessageSquare size={18} /> },
  null,
  { id: 'stats', label: 'Platform Stats', icon: <BarChart2 size={18} /> },
  { id: 'users', label: 'User Management', icon: <Users size={18} /> },
];

const ModeratorDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('queue');
  const [pendingOwners, setPendingOwners] = useState(PENDING_OWNERS);
  const [pendingProps, setPendingProps] = useState(PENDING_PROPERTIES);
  const [pendingReviews, setPendingReviews] = useState(PENDING_REVIEWS);

  const totalPending = pendingOwners.length + pendingProps.length + pendingReviews.length;

  const approveOwner = (id) => setPendingOwners(prev => prev.filter(o => o.id !== id));
  const rejectOwner = (id) => setPendingOwners(prev => prev.filter(o => o.id !== id));
  const approveProperty = (id) => setPendingProps(prev => prev.filter(p => p.id !== id));
  const rejectProperty = (id) => setPendingProps(prev => prev.filter(p => p.id !== id));
  const approveReview = (id) => setPendingReviews(prev => prev.filter(r => r.id !== id));
  const rejectReview = (id) => setPendingReviews(prev => prev.filter(r => r.id !== id));

  const renderContent = () => {
    switch (activeTab) {
      case 'queue': return <VerificationQueue pendingOwners={pendingOwners} pendingProps={pendingProps} onApproveOwner={approveOwner} onRejectOwner={rejectOwner} onApproveProp={approveProperty} onRejectProp={rejectProperty} />;
      case 'properties': return <AllPropertiesView />;
      case 'disputes': return <DisputeView />;
      case 'reviews': return <ReviewModerationView pendingReviews={pendingReviews} onApprove={approveReview} onReject={rejectReview} />;
      case 'stats': return <PlatformStats />;
      case 'users': return <UserManagement />;
      default: return null;
    }
  };

  return (
    <div className="sidebar-layout">
      <aside className="sidebar p-5 flex flex-col shadow-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShieldAlert size={16} className="text-white" />
          </div>
          <span className="font-black text-slate-900 text-lg tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            Moderator
          </span>
        </div>

        <nav className="flex-1 space-y-0.5">
          {NAV.map((item, i) =>
            item === null ? (
              <div key={i} className="my-3 border-t border-slate-100" />
            ) : (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item w-full text-left relative ${activeTab === item.id ? 'active' : ''}`}
              >
                {item.icon} {item.label}
                {item.id === 'queue' && totalPending > 0 && (
                  <span className="absolute right-3 bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    {totalPending}
                  </span>
                )}
              </button>
            )
          )}
        </nav>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">M</div>
            <div>
              <p className="text-xs font-bold text-slate-800">Admin Moderator</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1"><ShieldCheck size={9} /> Full Access</p>
            </div>
          </div>
          <button onClick={onLogout} className="nav-item w-full text-red-400 hover:bg-red-50 hover:text-red-500">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-slate-800 text-sm">{NAV.find(n => n?.id === activeTab)?.label}</h1>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold rounded-full flex items-center gap-1">
              <ShieldCheck size={9} /> Verified Access
            </span>
          </div>
          {totalPending > 0 && (
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
              <AlertTriangle size={12} /> {totalPending} items need review
            </div>
          )}
        </header>

        <div className="p-8">
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
    </div>
  );
};

const ActionButtons = ({ onApprove, onReject }) => (
  <div className="flex items-center gap-2">
    <button
      onClick={onApprove}
      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
    >
      <CheckCircle size={14} /> Approve
    </button>
    <button
      onClick={onReject}
      className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-colors"
    >
      <XCircle size={14} /> Reject
    </button>
  </div>
);

const VerificationQueue = ({ pendingOwners, pendingProps, onApproveOwner, onRejectOwner, onApproveProp, onRejectProp }) => (
  <div className="space-y-10 pb-12">
    <div>
      <h2 className="section-title">Verification Queue</h2>
      <p className="text-slate-500 text-sm mt-1">Review and approve new owner registrations and property listings.</p>
    </div>

    {/* Pending Owners */}
    <section className="space-y-4">
      <h3 className="font-bold text-slate-700 flex items-center gap-2">
        <Users size={16} className="text-blue-500" /> Pending Owner Verifications
        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full border border-blue-100">{pendingOwners.length}</span>
      </h3>
      {pendingOwners.length === 0 ? (
        <div className="glass-card p-8 text-center text-slate-400">
          <CheckCircle size={32} className="mx-auto mb-2 text-emerald-300" />
          <p className="text-sm font-medium">All owner applications reviewed!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingOwners.map(owner => (
            <div key={owner.id} className="glass-card p-5 flex items-center justify-between hover:shadow-sm transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-600">
                  {owner.name[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{owner.name}</p>
                  <p className="text-xs text-slate-500">{owner.phone} • {owner.created}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Listing: {owner.properties}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="tag bg-amber-50 text-amber-700 border-amber-200 text-[10px]">OWNER</span>
                <ActionButtons onApprove={() => onApproveOwner(owner.id)} onReject={() => onRejectOwner(owner.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>

    {/* Pending Properties */}
    <section className="space-y-4">
      <h3 className="font-bold text-slate-700 flex items-center gap-2">
        <Home size={16} className="text-emerald-500" /> Pending Property Approvals
        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-100">{pendingProps.length}</span>
      </h3>
      {pendingProps.length === 0 ? (
        <div className="glass-card p-8 text-center text-slate-400">
          <CheckCircle size={32} className="mx-auto mb-2 text-emerald-300" />
          <p className="text-sm font-medium">All property listings reviewed!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingProps.map(prop => (
            <div key={prop.id} className="glass-card p-5 flex items-center justify-between hover:shadow-sm transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  <img src="/pg-preview.png" className="w-full h-full object-cover" alt={prop.name} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{prop.name}</p>
                  <p className="text-xs text-slate-500">{prop.area} • {prop.type} • ₹{prop.rent.toLocaleString()}/mo</p>
                  <p className="text-xs text-slate-400 mt-0.5">Owner: {prop.owner} • {prop.images} images uploaded</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="tag tag-green text-[10px]">PROPERTY</span>
                <ActionButtons onApprove={() => onApproveProp(prop.id)} onReject={() => onRejectProp(prop.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  </div>
);

const ReviewModerationView = ({ pendingReviews, onApprove, onReject }) => (
  <div className="space-y-8 pb-12">
    <div>
      <h2 className="section-title">Review Moderation</h2>
      <p className="text-slate-500 text-sm mt-1">Moderate anonymous reviews to ensure authenticity.</p>
    </div>
    {pendingReviews.length === 0 ? (
      <div className="glass-card p-12 text-center">
        <MessageSquare size={40} className="text-slate-200 mx-auto mb-3" />
        <p className="font-semibold text-slate-500">All reviews have been moderated.</p>
      </div>
    ) : (
      <div className="space-y-4">
        {pendingReviews.map(r => (
          <div key={r.id} className="glass-card p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-slate-900">{r.property}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-amber-500 text-sm font-bold">{'⭐'.repeat(Math.round(r.rating))} {r.rating}</span>
                  {r.flag && (
                    <span className="tag tag-red text-[10px] flex items-center gap-1">
                      <AlertTriangle size={9} /> {r.flag}
                    </span>
                  )}
                </div>
              </div>
              <span className="tag bg-slate-100 text-slate-600 border-slate-200 text-[10px]">Anonymous</span>
            </div>
            <p className="text-slate-700 text-sm italic bg-slate-50 rounded-xl p-3 border border-slate-100">
              "{r.comment}"
            </p>
            <div className="flex items-center gap-3">
              <ActionButtons onApprove={() => onApprove(r.id)} onReject={() => onReject(r.id)} />
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const AllPropertiesView = () => (
  <div className="space-y-6 pb-12">
    <h2 className="section-title">Global Property Registry</h2>
    <div className="glass-card overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            {['Property', 'Area', 'Owner', 'Rent', 'Status', 'Actions'].map(h => (
              <th key={h} className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {ALL_PROPERTIES.map(p => (
            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-semibold text-slate-900">{p.name}</td>
              <td className="p-4 text-slate-500 text-sm">{p.area}</td>
              <td className="p-4 text-slate-600 text-sm">{p.owner}</td>
              <td className="p-4 font-bold text-amber-600">{p.rent}</td>
              <td className="p-4">
                <span className={`tag border text-[10px] ${p.status === 'APPROVED' ? 'tag-green' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  {p.status}
                </span>
              </td>
              <td className="p-4">
                <button className="text-xs font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors">
                  <Eye size={12} /> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const DisputeView = () => (
  <div className="space-y-8 pb-12">
    <div>
      <h2 className="section-title">Disputes & Safety</h2>
      <p className="text-slate-500 text-sm mt-1">Monitor safety incidents and student disputes.</p>
    </div>
    <div className="glass-card p-12 text-center border-emerald-100 bg-emerald-50/30">
      <ShieldCheck size={48} className="text-emerald-400 mx-auto mb-4" />
      <h3 className="font-bold text-xl text-slate-800 mb-2">No Active Incidents</h3>
      <p className="text-slate-500 text-sm">All reported issues have been resolved. Platform safety score: 4.9/5</p>
    </div>
    <div className="glass-card p-5">
      <h4 className="font-bold text-slate-800 mb-4">Safety Features Active</h4>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {['Anonymous Reviews', 'Face ID Verification', 'Owner Vetting', 'Report System', 'Privacy Protection', 'Verified Badges'].map(f => (
          <div key={f} className="flex items-center gap-2 text-slate-700">
            <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
            {f}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PlatformStats = () => (
  <div className="space-y-8 pb-12">
    <h2 className="section-title">Platform Statistics</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Total Users', value: '542', icon: '👥', color: 'blue' },
        { label: 'Active Properties', value: '15', icon: '🏠', color: 'emerald' },
        { label: 'Reviews Posted', value: '128', icon: '⭐', color: 'amber' },
        { label: 'Services Listed', value: '8', icon: '🛠️', color: 'purple' },
      ].map(s => (
        <div key={s.label} className="glass-card p-5 text-center">
          <div className="text-3xl mb-2">{s.icon}</div>
          <p className="text-3xl font-black text-slate-900">{s.value}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">{s.label}</p>
        </div>
      ))}
    </div>
    <div className="glass-card p-6">
      <h4 className="font-bold text-slate-800 mb-4">Monthly Registrations</h4>
      <div className="space-y-3">
        {[
          { month: 'Jun 2024', students: 42, owners: 3 },
          { month: 'Jul 2024', students: 67, owners: 5 },
          { month: 'Aug 2024', students: 94, owners: 4 },
        ].map(m => (
          <div key={m.month} className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400 w-20 flex-shrink-0">{m.month}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full" style={{ width: `${(m.students / 100) * 100}%` }} />
            </div>
            <span className="text-xs font-bold text-slate-600 w-24 text-right">{m.students} students</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const UserManagement = () => (
  <div className="space-y-8 pb-12">
    <h2 className="section-title">User Management</h2>
    <div className="glass-card overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
              <th key={h} className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {[
            { name: 'Abhishek Kumar', role: 'student', status: 'Active', joined: '2 days ago' },
            { name: 'Ramesh Kumar', role: 'owner', status: 'Verified', joined: '1 week ago' },
            { name: 'Sneha Sharma', role: 'owner', status: 'Pending', joined: '3 hours ago' },
          ].map((u, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-semibold text-slate-900">{u.name}</td>
              <td className="p-4">
                <span className={`tag border text-[10px] capitalize ${u.role === 'student' ? 'tag-blue' : 'tag-green'}`}>{u.role}</span>
              </td>
              <td className="p-4">
                <span className={`tag border text-[10px] ${u.status === 'Active' || u.status === 'Verified' ? 'tag-green' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{u.status}</span>
              </td>
              <td className="p-4 text-slate-400 text-xs">{u.joined}</td>
              <td className="p-4">
                <button className="text-xs font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1">
                  <Eye size={12} /> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default ModeratorDashboard;
