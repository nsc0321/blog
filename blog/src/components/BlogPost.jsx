import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MessageSquare, Send, Share2, Tag, Calendar, User, Trash2 } from 'lucide-react';

export default function BlogPost({ post, onBack, onLike, onAddComment, onDeletePost }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLikeClick = () => {
    if (!hasLiked) {
      onLike(post.id);
      setHasLiked(true);
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText, authorName);
    setCommentText('');
    setAuthorName('');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
      {/* Scroll Progress Bar */}
      <div 
        style={{ 
          position: 'fixed', 
          top: 72, 
          left: 0, 
          height: '4px', 
          background: 'var(--accent-gradient)', 
          width: `${scrollProgress}%`, 
          zIndex: 101, 
          transition: 'width 0.1s ease-out' 
        }} 
      />

      {/* Back Button */}
      <button 
        className="btn-secondary" 
        onClick={onBack} 
        style={{ marginBottom: '24px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <ArrowLeft size={16} /> Back to feed
      </button>

      {/* Main Post Card */}
      <article className="glass-panel" style={{ padding: '40px', marginBottom: '32px' }}>
        {/* Post Metadata Header */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
            {post.category}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <Calendar size={14} /> {post.date}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <User size={14} /> By {post.author}
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '42px', lineHeight: '1.2', marginBottom: '24px', fontWeight: '800' }}>
          {post.title}
        </h1>

        {/* Content Body */}
        <div 
          style={{ 
            fontSize: '17px', 
            lineHeight: '1.8', 
            color: 'var(--text-primary)', 
            marginBottom: '32px',
            whiteSpace: 'pre-line' 
          }}
        >
          {post.content}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
          {post.tags.map(tag => (
            <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', background: 'var(--border-color)', padding: '4px 10px', borderRadius: '14px', color: 'var(--text-secondary)' }}>
              <Tag size={12} /> {tag}
            </span>
          ))}
        </div>

        {/* Interactions Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={handleLikeClick}
              disabled={hasLiked}
              className="btn-secondary"
              style={{ 
                padding: '8px 16px', 
                gap: '6px', 
                borderColor: hasLiked ? 'rgba(139, 92, 246, 0.4)' : 'var(--border-color)',
                color: hasLiked ? 'var(--accent-primary)' : 'var(--text-primary)',
                background: hasLiked ? 'rgba(139, 92, 246, 0.05)' : 'transparent'
              }}
            >
              <Heart size={16} fill={hasLiked ? 'var(--accent-primary)' : 'none'} style={{ transition: 'transform 0.2s' }} /> 
              {hasLiked ? 'Liked!' : 'Like'} ({post.likes})
            </button>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <MessageSquare size={16} /> {post.comments.length} Comments
            </span>
          </div>

          <button 
            className="btn-secondary" 
            style={{ padding: '8px 14px' }} 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard!");
            }}
          >
            <Share2 size={16} /> Share
          </button>
          {onDeletePost && (
            <button
              className="btn-secondary"
              style={{ padding: '8px 14px', color: '#ef4444', borderColor: '#ef4444' }}
              onClick={() => {
                if (confirm(`Delete post "${post.title}"?`)) {
                  onDeletePost(post.id);
                  onBack();
                }
              }}
            >
              <Trash2 size={16} /> Delete
            </button>
          )}
        </div>
      </article>

      {/* Comments Panel */}
      <section className="glass-panel" style={{ padding: '40px' }}>
        <h3 style={{ fontSize: '22px', marginBottom: '24px' }}>Comments</h3>

        {/* Add Comment Form */}
        <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Your Name" 
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="input-field"
              style={{ flex: '1 1 200px' }}
              required
            />
          </div>
          <div style={{ position: 'relative' }}>
            <textarea 
              placeholder="Add your review or thought..." 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="input-field"
              style={{ minHeight: '100px', resize: 'vertical', paddingRight: '48px' }}
              required
            />
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ position: 'absolute', right: '12px', bottom: '12px', padding: '8px', borderRadius: '50%' }}
            >
              <Send size={16} />
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {post.comments.length > 0 ? (
            post.comments.map(c => (
              <div key={c.id} style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600', fontSize: '15px' }}>{c.author}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.date}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px' }}>{c.text}</p>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic', textAlign: 'center', padding: '16px' }}>
              No comments yet. Be the first to write!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
