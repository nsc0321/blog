import React, { useState } from 'react';
import { Plus, X, Heart, MessageSquare, BookOpen, BarChart3, TrendingUp, Sparkles, Trash2, Folder, List } from 'lucide-react';

export default function AdminDashboard({ 
  posts, 
  categories = [], 
  onAddPost, 
  onDeletePost, 
  onAddCategory, 
  onDeleteCategory, 
  onCancel, 
  onlyWrite = false 
}) {
  const [activeTab, setActiveTab] = useState(onlyWrite ? 'create' : 'overview');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Technology');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(['WebDev', 'Design']);
  const [author, setAuthor] = useState('Admin Author');
  const [readTime, setReadTime] = useState('4 min');

  // Category management local state
  const [newCategory, setNewCategory] = useState('');

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/,/g, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setTags(tags.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onAddPost({
      title,
      excerpt: excerpt || content.substring(0, 120) + '...',
      content,
      category,
      tags,
      author: author || 'Guest Contributor',
      readTime: readTime || '3 min'
    });

    // Reset form
    setTitle('');
    setExcerpt('');
    setContent('');
    setTags(['WebDev', 'Design']);
    if (!onlyWrite) {
      setActiveTab('posts');
    }
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    const trimmed = newCategory.trim();
    if (trimmed) {
      onAddCategory(trimmed);
      setNewCategory('');
    }
  };

  // Calculations for stats
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = posts.reduce((sum, p) => sum + p.comments.length, 0);

  const getPostCountForCategory = (cat) => {
    return posts.filter(p => p.category === cat).length;
  };

  return (
    <div>
      {/* Tab Navigation (Only visible on full dashboard) */}
      {!onlyWrite && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', overflowX: 'auto' }}>
          <button 
            onClick={() => setActiveTab('overview')}
            className="glass-panel"
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: activeTab === 'overview' ? 'var(--accent-gradient)' : 'var(--bg-glass)',
              color: activeTab === 'overview' ? '#fff' : 'var(--text-primary)',
              borderColor: activeTab === 'overview' ? 'transparent' : 'var(--border-color)',
              transition: 'var(--transition-smooth)'
            }}
          >
            <BarChart3 size={16} /> Overview
          </button>
          
          <button 
            onClick={() => setActiveTab('posts')}
            className="glass-panel"
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: activeTab === 'posts' ? 'var(--accent-gradient)' : 'var(--bg-glass)',
              color: activeTab === 'posts' ? '#fff' : 'var(--text-primary)',
              borderColor: activeTab === 'posts' ? 'transparent' : 'var(--border-color)',
              transition: 'var(--transition-smooth)'
            }}
          >
            <List size={16} /> Manage Posts
          </button>

          <button 
            onClick={() => setActiveTab('categories')}
            className="glass-panel"
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: activeTab === 'categories' ? 'var(--accent-gradient)' : 'var(--bg-glass)',
              color: activeTab === 'categories' ? '#fff' : 'var(--text-primary)',
              borderColor: activeTab === 'categories' ? 'transparent' : 'var(--border-color)',
              transition: 'var(--transition-smooth)'
            }}
          >
            <Folder size={16} /> Manage Categories
          </button>

          <button 
            onClick={() => setActiveTab('create')}
            className="glass-panel"
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: activeTab === 'create' ? 'var(--accent-gradient)' : 'var(--bg-glass)',
              color: activeTab === 'create' ? '#fff' : 'var(--text-primary)',
              borderColor: activeTab === 'create' ? 'transparent' : 'var(--border-color)',
              transition: 'var(--transition-smooth)'
            }}
          >
            <Plus size={16} /> Write Post
          </button>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && !onlyWrite && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>Dashboard Overview</h2>
          
          {/* Stats Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--accent-primary)' }}>
                <BookOpen size={24} />
              </div>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Posts</div>
                <div style={{ fontSize: '24px', fontWeight: '800' }}>{posts.length}</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--accent-secondary)' }}>
                <Heart size={24} />
              </div>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Likes</div>
                <div style={{ fontSize: '24px', fontWeight: '800' }}>{totalLikes}</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--accent-primary)' }}>
                <MessageSquare size={24} />
              </div>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Comments</div>
                <div style={{ fontSize: '24px', fontWeight: '800' }}>{totalComments}</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--accent-secondary)' }}>
                <BarChart3 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Engagement Rate</div>
                <div style={{ fontSize: '24px', fontWeight: '800' }}>
                  {posts.length > 0 ? ((totalLikes + totalComments) / posts.length).toFixed(1) : 0}
                </div>
              </div>
            </div>
          </div>

          {/* Graphical Analytics Panel (SVG Chart) */}
          <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '20px' }}>Weekly Engagement Trends</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Views and reads over the past 7 days</p>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--accent-secondary)', background: 'rgba(6,182,212,0.1)', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={12} /> +12.4% vs last week
              </span>
            </div>

            <div style={{ width: '100%', overflowX: 'auto' }}>
              <svg viewBox="0 0 800 200" style={{ width: '100%', height: 'auto', minWidth: '600px' }}>
                {/* Grid Lines */}
                <line x1="50" y1="20" x2="750" y2="20" stroke="var(--border-color)" strokeDasharray="4 4" />
                <line x1="50" y1="70" x2="750" y2="70" stroke="var(--border-color)" strokeDasharray="4 4" />
                <line x1="50" y1="120" x2="750" y2="120" stroke="var(--border-color)" strokeDasharray="4 4" />
                <line x1="50" y1="170" x2="750" y2="170" stroke="var(--border-color)" />

                {/* Trend Lines (Views and Likes) */}
                <path
                  d="M 50 160 Q 150 110, 250 130 T 450 70 T 650 40 T 750 30"
                  fill="none"
                  stroke="url(#chartGradient1)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M 50 170 Q 150 140, 250 150 T 450 110 T 650 80 T 750 70"
                  fill="none"
                  stroke="url(#chartGradient2)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="2 2"
                />

                {/* Gradients definitions */}
                <defs>
                  <linearGradient id="chartGradient1" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                  <linearGradient id="chartGradient2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
                  </linearGradient>
                </defs>

                {/* Data Points */}
                <circle cx="250" cy="130" r="5" fill="#8b5cf6" />
                <circle cx="450" cy="70" r="5" fill="#06b6d4" />
                <circle cx="650" cy="40" r="5" fill="#06b6d4" />

                {/* Labels */}
                <text x="50" y="190" fill="var(--text-muted)" fontSize="12" textAnchor="middle">Mon</text>
                <text x="166" y="190" fill="var(--text-muted)" fontSize="12" textAnchor="middle">Tue</text>
                <text x="282" y="190" fill="var(--text-muted)" fontSize="12" textAnchor="middle">Wed</text>
                <text x="398" y="190" fill="var(--text-muted)" fontSize="12" textAnchor="middle">Thu</text>
                <text x="514" y="190" fill="var(--text-muted)" fontSize="12" textAnchor="middle">Fri</text>
                <text x="630" y="190" fill="var(--text-muted)" fontSize="12" textAnchor="middle">Sat</text>
                <text x="746" y="190" fill="var(--text-muted)" fontSize="12" textAnchor="middle">Sun</text>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE POSTS TAB */}
      {activeTab === 'posts' && !onlyWrite && (
        <div style={{ animation: 'fadeIn 0.3s ease' }} className="glass-panel" style={{ padding: '30px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <List size={20} className="text-gradient" /> Manage Published Articles
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  <th style={{ padding: '12px 16px' }}>Title</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Author</th>
                  <th style={{ padding: '12px 16px' }}>Stats</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
                    <td style={{ padding: '16px', fontWeight: '600' }}>{post.title}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ background: 'rgba(6,182,212,0.1)', color: 'var(--accent-secondary)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                        {post.category}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{post.date}</td>
                    <td style={{ padding: '16px' }}>{post.author}</td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: '12px' }}>
                        <Heart size={12} fill="var(--accent-primary)" stroke="none" /> {post.likes}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <MessageSquare size={12} /> {post.comments.length}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button 
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
                            onDeletePost(post.id);
                          }
                        }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '8px',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.2s'
                        }}
                        title="Delete Post"
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No articles published yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MANAGE CATEGORIES TAB */}
      {activeTab === 'categories' && !onlyWrite && (
        <div style={{ animation: 'fadeIn 0.3s ease', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* List of categories */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Folder size={20} className="text-gradient" /> Current Categories
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categories.map(cat => {
                const count = getPostCountForCategory(cat);
                return (
                  <div 
                    key={cat} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '12px 16px', 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '12px' 
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: '600' }}>{cat}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '12px' }}>
                        {count} {count === 1 ? 'post' : 'posts'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (count > 0) {
                          alert(`Cannot delete category "${cat}" because it has ${count} articles. Move or delete them first.`);
                          return;
                        }
                        if (confirm(`Are you sure you want to delete category "${cat}"?`)) {
                          onDeleteCategory(cat);
                          if (category === cat) {
                            setCategory(categories.find(c => c !== cat) || '');
                          }
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '6px',
                        transition: 'color 0.2s'
                      }}
                      title="Delete Category"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
              {categories.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No categories defined.
                </div>
              )}
            </div>
          </div>

          {/* Add Category Form */}
          <div className="glass-panel" style={{ padding: '30px', height: 'fit-content' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={20} className="text-gradient" /> Add New Category
            </h2>
            <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Life, Marketing, Careers"
                  className="input-field"
                  required
                />
              </div>
              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE POST TAB */}
      {activeTab === 'create' && (
        <div className="glass-panel" style={{ padding: '40px', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Sparkles size={20} className="text-gradient" />
            <h2 style={{ fontSize: '24px' }}>Create New Blog Article</h2>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Article Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The Future of Autonomous Engineering"
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field"
                  style={{ appearance: 'none', background: 'var(--bg-primary)' }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Author Name
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Estimated Read Time
                </label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Short Excerpt
              </label>
              <input
                type="text"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A brief summary of your article to tease readers in the feed."
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article markdown or plain text here..."
                className="input-field"
                style={{ minHeight: '260px', resize: 'vertical' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Tags (Press Enter to add)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '6px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(0,0,0,0.1)' }}>
                {tags.map((tag, index) => (
                  <span key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', background: 'var(--accent-gradient)', color: '#fff', padding: '4px 10px', borderRadius: '20px' }}>
                    {tag}
                    <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveTag(index)} />
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={tags.length === 0 ? "e.g. Future, WebDev" : ""}
                  style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)', fontSize: '13px', padding: '4px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="button" className="btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <Plus size={16} /> Publish Post
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
