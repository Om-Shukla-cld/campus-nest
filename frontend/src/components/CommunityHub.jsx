import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Heart, Send, Hash, Plus, Ghost, ShoppingBag, Users, ChevronRight } from 'lucide-react';

const GROUPS = [
  { id: 1, name: 'General Campus', type: 'General', icon: '🏫', description: 'All campus discussions', color: 'blue' },
  { id: 2, name: 'Buy & Sell', type: 'BuySell', icon: '🛍️', description: 'Student marketplace', color: 'amber' },
  { id: 3, name: 'Girls Only', type: 'GenderBased', icon: '💜', description: 'Safe space for girls', color: 'pink' },
];

const DEMO_POSTS = {
  1: [
    { id: 1, content: "Anyone have extra notes for Physics 101? Desperately need them before exams!", likes: 12, comments: [{ id: 1, author: 'Anon', text: 'DM me, I have last year paper!' }], time: '2h ago', author: 'Senior_Avi', anonymous: false },
    { id: 2, content: "Pro tip: Sunshine PG has the best WiFi speed in the area — clocked 150 Mbps! Way better than my current place.", likes: 8, comments: [], time: '5h ago', author: 'TechStudent', anonymous: false },
    { id: 3, content: "Library closes at 10pm again. Anyone know other late-night study spots near campus?", likes: 22, comments: [{ id: 2, author: 'Anon', text: 'Floor 3 of Block B is open till 11!' }], time: '1d ago', author: 'NightOwl_23', anonymous: false },
  ],
  2: [
    { id: 4, content: "Selling my electric kettle for ₹500. Barely used, 6 months old. Works perfectly. Pickup from Kothri.", likes: 2, comments: [], time: '1h ago', author: 'MarketMaster', anonymous: false },
    { id: 5, content: "WTB: Study table and chair for my PG room. Budget: ₹1500. Any leads?", likes: 5, comments: [{ id: 3, author: 'RoomSeller', text: 'I have one! Check your DMs.' }], time: '3h ago', author: 'NewStudent_22', anonymous: false },
    { id: 6, content: "Samsung laptop (8GB/256GB SSD) selling for ₹28,000. Negotiable. Minor keyboard wear, works perfectly.", likes: 3, comments: [], time: '8h ago', author: 'GadgetGuru', anonymous: false },
  ],
  3: [
    { id: 7, content: "Looking for a female roommate for Luxury Haven PG. Non-smoker, clean habits preferred. Message me!", likes: 7, comments: [], time: '4h ago', author: 'Anonymous', anonymous: true },
    { id: 8, content: "Any girls interested in sharing a flat in Ashta? Split rent would be ₹8,000 each. Very safe locality.", likes: 15, comments: [{ id: 4, author: 'Anon', text: 'Interested! How do I reach you?' }], time: '1d ago', author: 'Anonymous', anonymous: true },
  ],
};

const GROUP_COLORS = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  pink: 'bg-pink-50 text-pink-700 border-pink-200',
};

const CommunityHub = () => {
  const [activeGroup, setActiveGroup] = useState(GROUPS[0]);
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [newPost, setNewPost] = useState('');
  const [isAnon, setIsAnon] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [expandedPost, setExpandedPost] = useState(null);
  const [commentText, setCommentText] = useState('');

  const currentPosts = posts[activeGroup.id] || [];

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post = {
      id: Date.now(),
      content: newPost,
      likes: 0,
      comments: [],
      time: 'just now',
      author: isAnon ? 'Anonymous' : 'You',
      anonymous: isAnon,
    };
    setPosts(prev => ({ ...prev, [activeGroup.id]: [post, ...(prev[activeGroup.id] || [])] }));
    setNewPost('');
  };

  const handleLike = (postId) => {
    setLikedPosts(prev => new Set([...prev, postId]));
    setPosts(prev => ({
      ...prev,
      [activeGroup.id]: (prev[activeGroup.id] || []).map(p =>
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      ),
    }));
  };

  const handleComment = (postId) => {
    if (!commentText.trim()) return;
    const comment = { id: Date.now(), author: 'You', text: commentText };
    setPosts(prev => ({
      ...prev,
      [activeGroup.id]: (prev[activeGroup.id] || []).map(p =>
        p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
      ),
    }));
    setCommentText('');
  };

  return (
    <div className="flex gap-6 pb-12 h-full">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 mb-4">Channels</h3>
        {GROUPS.map(g => (
          <motion.button
            key={g.id}
            whileHover={{ x: 3 }}
            onClick={() => setActiveGroup(g)}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all ${
              activeGroup.id === g.id
                ? 'bg-amber-50 border border-amber-200 shadow-sm'
                : 'bg-white border border-slate-100 hover:border-slate-200'
            }`}
          >
            <span className="text-xl">{g.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold truncate ${activeGroup.id === g.id ? 'text-amber-700' : 'text-slate-800'}`}>
                #{g.name}
              </p>
              <p className="text-xs text-slate-400 truncate">{g.description}</p>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${GROUP_COLORS[g.color]}`}>
              {(posts[g.id] || []).length}
            </span>
          </motion.button>
        ))}

        {/* Safety notice */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-xs text-blue-700 font-semibold leading-relaxed">
            🔒 All posts are moderated. Personal info is never shared without consent.
          </p>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 space-y-5">
        {/* Group Header */}
        <div className="glass-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{activeGroup.icon}</span>
            <div>
              <h2 className="font-black text-slate-900 text-lg">#{activeGroup.name}</h2>
              <p className="text-slate-500 text-xs">{activeGroup.description}</p>
            </div>
          </div>
          <span className={`tag border ${GROUP_COLORS[activeGroup.color]}`}>{currentPosts.length} posts</span>
        </div>

        {/* New Post */}
        <div className="glass-card p-5">
          <textarea
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            placeholder={`Share something with #${activeGroup.name}...`}
            className="w-full input-field resize-none h-24 mb-3"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setIsAnon(!isAnon)}
                className={`w-9 h-5 rounded-full transition-colors ${isAnon ? 'bg-amber-500' : 'bg-slate-200'} relative`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow ${isAnon ? 'left-4' : 'left-0.5'}`} />
              </div>
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Ghost size={12} /> Post anonymously
              </span>
            </label>
            <button
              onClick={handlePost}
              disabled={!newPost.trim()}
              className="btn-primary text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={12} /> Post
            </button>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {currentPosts.map(post => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-5 space-y-4"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-sm font-black text-amber-700">
                    {post.anonymous ? '?' : post.author[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{post.author}</p>
                    {post.anonymous && (
                      <p className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <Ghost size={9} /> Anonymous post
                      </p>
                    )}
                  </div>
                  <span className={`tag border ${GROUP_COLORS[activeGroup.color]} ml-1 text-[10px]`}>
                    #{activeGroup.name}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{post.time}</span>
              </div>

              {/* Content */}
              <p className="text-slate-700 text-sm leading-relaxed">{post.content}</p>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-2 border-t border-slate-50">
                <button
                  onClick={() => handleLike(post.id)}
                  disabled={likedPosts.has(post.id)}
                  className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                    likedPosts.has(post.id) ? 'text-red-400' : 'text-slate-400 hover:text-red-400'
                  }`}
                >
                  <Heart size={14} fill={likedPosts.has(post.id) ? 'currentColor' : 'none'} />
                  {post.likes}
                </button>
                <button
                  onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <MessageSquare size={14} />
                  {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
                </button>
              </div>

              {/* Comments */}
              <AnimatePresence>
                {expandedPost === post.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3 pt-3 border-t border-slate-50"
                  >
                    {post.comments.map(c => (
                      <div key={c.id} className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600 flex-shrink-0">
                          {c.author[0]}
                        </div>
                        <div className="bg-slate-50 rounded-xl px-3 py-2 text-xs text-slate-700 flex-1">
                          <span className="font-bold text-slate-800 mr-1">{c.author}</span>
                          {c.text}
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <input
                        className="input-field text-xs py-2 flex-1"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        className="btn-primary px-3 py-2 text-xs"
                      >
                        <Send size={12} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;
