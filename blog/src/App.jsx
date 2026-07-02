import React, { useState, useEffect } from 'react';
import { Sun, Moon, BookOpen, PenTool, LayoutDashboard, Search, Home } from 'lucide-react';
import BlogFeed from './components/BlogFeed';
import BlogPost from './components/BlogPost';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('lumina_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [currentView, setCurrentView] = useState('feed'); // 'feed' | 'post' | 'write' | 'dashboard' | 'login'
  const [selectedPostId, setSelectedPostId] = useState(null);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/posts`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('lumina_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lumina_user');
    }
  }, [user]);

  const handleDeletePost = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const handleAddCategory = async (cat) => {
    const trimmed = cat.trim();
    if (trimmed && !categories.includes(trimmed)) {
      try {
        const res = await fetch(`${API_BASE}/api/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmed })
        });
        if (res.ok) {
          fetchCategories();
        }
      } catch (err) {
        console.error("Failed to add category:", err);
      }
    }
  };

  const handleDeleteCategory = async (cat) => {
    try {
      const res = await fetch(`${API_BASE}/api/categories/${encodeURIComponent(cat)}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCategories();
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleSelectPost = (id) => {
    setSelectedPostId(id);
    setCurrentView('post');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddPost = async (newPost) => {
    try {
      const res = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPost.title,
          excerpt: newPost.excerpt,
          content: newPost.content,
          category: newPost.category,
          tags: newPost.tags || [],
          author: newPost.author,
          read_time: newPost.readTime || "5 min"
        })
      });
      if (res.ok) {
        await fetchPosts();
        setCurrentView('feed');
      }
    } catch (err) {
      console.error("Failed to add post:", err);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, { method: 'POST' });
      if (res.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleAddComment = async (postId, commentText, authorName) => {
    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: authorName,
          text: commentText
        })
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const selectedPost = posts.find(p => p.id === selectedPostId);

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Dynamic Background Glow Elements */}
      <div className="bg-glow-container">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>

      {/* Navigation Header */}
      <header className="glass-header">
        <div className="nav-wrapper" style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div onClick={() => setCurrentView('feed')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div className="logo-box" style={{ background: 'var(--accent-gradient)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={20} color="#fff" />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '800' }}>
              Lumina<span className="text-gradient">Blog</span>
            </h1>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn-secondary" onClick={() => setCurrentView('feed')} style={{ padding: '8px 14px', fontSize: '14px' }}>
              <Home size={16} /> Home
            </button>
            <button className="btn-secondary" onClick={() => setCurrentView('dashboard')} style={{ padding: '8px 14px', fontSize: '14px' }}>
              <LayoutDashboard size={16} /> Dashboard
            </button>
            <button className="btn-primary" onClick={() => setCurrentView('write')} style={{ padding: '8px 16px', fontSize: '14px' }}>
              <PenTool size={16} /> Write
            </button>


            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Welcome, <strong>{user}</strong></span>
                <button className="btn-secondary" onClick={() => setUser(null)} style={{ padding: '8px 12px', fontSize: '13px' }}>
                  Logout
                </button>
              </div>
            ) : (
              <button className="btn-primary" onClick={() => setCurrentView('login')} style={{ padding: '8px 16px', fontSize: '14px', background: 'var(--accent-gradient)' }}>
                Login
              </button>
            )}
            
            <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s', border: '1px solid var(--border-color)' }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Application Area */}
      <main className="main-content" style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '40px 24px' }}>
        {(() => {
          if (currentView === 'login') {
            return <Login onLoginSuccess={(username) => { setUser(username); setCurrentView('dashboard'); }} onCancel={() => setCurrentView('feed')} />;
          }
          if (currentView === 'feed') {
            return <BlogFeed posts={posts} categories={categories} onSelectPost={handleSelectPost} onDeletePost={handleDeletePost} />;
          }
          if (currentView === 'post' && selectedPost) {
            return (
            <BlogPost 
              post={selectedPost} 
              onBack={() => setCurrentView('feed')} 
              onLike={handleLikePost}
              onAddComment={handleAddComment}
              onDeletePost={handleDeletePost}
            />
            );
          }


          // Protected views
          if (!user) {
            return <Login onLoginSuccess={(username) => { setUser(username); setCurrentView(currentView); }} onCancel={() => setCurrentView('feed')} />;
          }

          if (currentView === 'write') {
            return (
              <AdminDashboard 
                posts={posts} 
                categories={categories}
                onAddPost={handleAddPost} 
                onCancel={() => setCurrentView('feed')}
                onlyWrite={true}
              />
            );
          }
          if (currentView === 'dashboard') {
            return (
              <AdminDashboard 
                posts={posts} 
                categories={categories}
                onAddPost={handleAddPost} 
                onDeletePost={handleDeletePost}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                onCancel={() => setCurrentView('feed')}
                onlyWrite={false}
              />
            );
          }
          return null;
        })()}
      </main>

      {/* Aesthetic Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', marginTop: '60px' }}>
        <p>© 2026 LuminaBlog. Crafted with premium web aesthetics.</p>
      </footer>
    </div>
  );
}
