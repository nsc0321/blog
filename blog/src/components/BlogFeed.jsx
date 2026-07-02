import React, { useState } from 'react';
import { Search, Tag, Eye, Heart, MessageSquare, Trash2 } from 'lucide-react';

export default function BlogFeed({ posts, categories, onSelectPost, onDeletePost }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const allCategories = ['All', ...categories];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = posts[0];

  return (
    <div>
      {/* Featured Header Panel (Gorgeous Gradient Glassmorphism) */}
      {activeCategory === 'All' && !searchTerm && featuredPost && (
        <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px', display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'center', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%), var(--bg-glass)' }}>
          <div style={{ flex: '1 1 500px' }}>
            <span style={{ background: 'var(--accent-gradient)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Featured Post
            </span>
            <h2 className="glow-text" style={{ fontSize: '36px', marginTop: '16px', marginBottom: '16px', lineHeight: '1.2' }}>
              {featuredPost.title}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '24px' }}>
              {featuredPost.excerpt}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                  {featuredPost.author[0]}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{featuredPost.author}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{featuredPost.date} · {featuredPost.readTime}</div>
                </div>
              </div>
              <button className="btn-primary" onClick={() => onSelectPost(featuredPost.id)}>
                Read Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="glass-panel"
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                background: activeCategory === cat ? 'var(--accent-gradient)' : 'var(--bg-glass)',
                color: activeCategory === cat ? '#fff' : 'var(--text-primary)',
                borderColor: activeCategory === cat ? 'transparent' : 'var(--border-color)',
                transition: 'var(--transition-smooth)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search articles, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '38px', borderRadius: '24px' }}
          />
        </div>
      </div>

      {/* Grid Feed Layout */}
      {filteredPosts.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {filteredPosts.map(post => (
            <article 
              key={post.id} 
              className="glass-panel glass-panel-hover" 
              style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              {/* Clickable area for selecting post */}
              <div onClick={() => onSelectPost(post.id)} style={{ cursor: 'pointer', flexGrow: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', color: 'var(--accent-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {post.category}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {post.readTime}
                </span>
              </div>

              <h3 style={{ fontSize: '20px', marginBottom: '10px', lineHeight: '1.3' }}>
                {post.title}
              </h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', flexGrow: 1 }}>
                {post.excerpt}
              </p>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {post.tags.map(tag => (
                  <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                    <Tag size={10} /> {tag}
                  </span>
                ))}
              </div>
              </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                    {post.author}
                  </span>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Heart size={12} fill={post.likes > 0 ? "rgba(139, 92, 246, 0.4)" : "none"} /> {post.likes}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MessageSquare size={12} /> {post.comments.length}
                      </span>
                    </div>
                    {onDeletePost && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete post "${post.title}"?`)) {
                            onDeletePost(post.id);
                          }
                        }}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        title="Delete Post"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '18px' }}>No articles matched your search.</p>
        </div>
      )}
    </div>
  );
}
