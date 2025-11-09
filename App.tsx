import React, { useState, useMemo, useEffect } from 'react';
import { BlogPost, Comment } from './types';
import Sidebar from './components/Sidebar';
import BlogPostView from './components/BlogPostView';
import BlogEditor from './components/BlogEditor';
import Login, { Credentials } from './components/Login';
import AdminPanel from './components/AdminPanel';
import { useMockData } from './hooks/useMockData';
import Chatbot from './components/Chatbot';
import AboutMeView from './components/AboutMeView';

type View = 'list' | 'post' | 'create' | 'edit' | 'about';
type Theme = 'light' | 'dark';

interface ThemeColors {
  light: { start: string; end: string };
  dark: { start: string; end: string };
}

const App: React.FC = () => {
    const { posts, setPosts } = useMockData();
    const [view, setView] = useState<View>('list');
    const [previousView, setPreviousView] = useState<View>('list');
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!sessionStorage.getItem('isAuthenticated'));
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
    
    const [blogTitle, setBlogTitle] = useState<string>(localStorage.getItem('blogTitle') || 'Vignettes');
    const [authorName, setAuthorName] = useState<string>(localStorage.getItem('authorName') || 'Author');
    const [aboutMeContent, setAboutMeContent] = useState<string>(
        localStorage.getItem('aboutMeContent') || 'This is a blog about everyday life moments. Welcome! Tell your readers more about yourself here.'
    );
    const [credentials, setCredentials] = useState<Credentials>({
        username: localStorage.getItem('blogUsername') || 'admin',
        password: localStorage.getItem('blogPassword') || 'testaccount',
    });
    const [theme, setTheme] = useState<Theme>(
        (localStorage.getItem('theme') as Theme) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    );
     const [themeColors, setThemeColors] = useState<ThemeColors>(() => {
        const savedColors = localStorage.getItem('themeColors');
        return savedColors ? JSON.parse(savedColors) : {
            light: { start: '#4338ca', end: '#d946ef' },
            dark: { start: '#a5b4fc', end: '#f9a8d4' }
        };
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    useEffect(() => {
        document.title = blogTitle;
        localStorage.setItem('blogTitle', blogTitle);
    }, [blogTitle]);

    useEffect(() => {
        localStorage.setItem('authorName', authorName);
    }, [authorName]);

    useEffect(() => {
        localStorage.setItem('aboutMeContent', aboutMeContent);
    }, [aboutMeContent]);

    useEffect(() => {
        localStorage.setItem('blogUsername', credentials.username);
        localStorage.setItem('blogPassword', credentials.password);
    }, [credentials]);

    useEffect(() => {
        localStorage.setItem('themeColors', JSON.stringify(themeColors));
        const root = document.documentElement;
        root.style.setProperty('--gradient-start-light', themeColors.light.start);
        root.style.setProperty('--gradient-end-light', themeColors.light.end);
        root.style.setProperty('--gradient-start-dark', themeColors.dark.start);
        root.style.setProperty('--gradient-end-dark', themeColors.dark.end);
    }, [themeColors]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const handleLogin = () => {
        sessionStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
        setIsLoginModalOpen(false);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
    };

    const handleSelectPost = (id: string) => {
        setSelectedPostId(id);
        setPreviousView(view);
        setView('post');
    };
    
    const handleEditPost = (id: string) => {
        setSelectedPostId(id);
        setPreviousView('post');
        setView('edit');
    };

    const handleDeletePost = (id: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            setPosts(posts.filter(p => p.id !== id));
            setView('list');
            setSelectedPostId(null);
        }
    };

    const handleSelectTag = (tag: string | null) => {
        setSelectedTag(tag);
        setSelectedPostId(null);
        setView('list');
    };

    const handleCreateNew = () => {
        setView('create');
        setSelectedPostId(null);
    };

    const handleShowAbout = () => {
        setPreviousView(view === 'about' ? 'list' : view);
        setView('about');
    };

    const handleBack = () => {
        setView(previousView);
    };

    const handleCancelCreate = () => {
        setView('list');
    };

    const handleSavePost = (postData: { title: string; content: string; hashtags: string[]; imageUrl?: string; audioUrl?: string }, id?: string) => {
        if (id) { // Editing existing post
            const updatedPosts = posts.map(p => p.id === id ? { ...p, ...postData } : p);
            setPosts(updatedPosts);
            setView('post');
            setSelectedPostId(id);
        } else { // Creating new post
            const newPost: BlogPost = {
                id: new Date().toISOString(),
                author: authorName,
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                ...postData,
                comments: [],
            };
            const updatedPosts = [newPost, ...posts];
            setPosts(updatedPosts);
            setView('post');
            setSelectedPostId(newPost.id);
        }
    };
    
    const handleAddComment = (postId: string, commentData: { author: string; content: string }) => {
        const newComment: Comment = {
            id: new Date().toISOString(),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            ...commentData,
        };
        const updatedPosts = posts.map(post => {
            if (post.id === postId) {
                const existingComments = post.comments || [];
                return { ...post, comments: [...existingComments, newComment] };
            }
            return post;
        });
        setPosts(updatedPosts);
    };

    const handleDeleteComment = (postId: string, commentId: string) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        const updatedPosts = posts.map(post => {
            if (post.id === postId) {
                return { ...post, comments: post.comments.filter(c => c.id !== commentId) };
            }
            return post;
        });
        setPosts(updatedPosts);
    };
    
    const displayedPosts = useMemo(() => {
        let filteredPosts = posts;

        if (selectedTag) {
            filteredPosts = filteredPosts.filter(post => post.hashtags.includes(selectedTag));
        }

        if (searchQuery.trim() !== '') {
            const lowercasedQuery = searchQuery.toLowerCase();
            filteredPosts = filteredPosts.filter(post => 
                post.title.toLowerCase().includes(lowercasedQuery) || 
                post.content.toLowerCase().includes(lowercasedQuery)
            );
        }

        return filteredPosts;
    }, [posts, selectedTag, searchQuery]);

    const currentPost = posts.find(p => p.id === selectedPostId);

    const renderMainContent = () => {
        switch (view) {
            case 'create':
                return <BlogEditor onSave={handleSavePost} onCancel={handleCancelCreate} />;
            case 'edit':
                 return <BlogEditor onSave={handleSavePost} onCancel={() => handleSelectPost(selectedPostId!)} postToEdit={currentPost} />;
            case 'post':
                if (currentPost) {
                    return <BlogPostView post={currentPost} onSelectTag={handleSelectTag} isAuthenticated={isAuthenticated} onEdit={handleEditPost} onDelete={handleDeletePost} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} />;
                }
                return <p>Post not found.</p>;
            case 'about':
                return <AboutMeView content={aboutMeContent} onBack={handleBack} />;
            case 'list':
            default:
                return (
                    <div className="space-y-8">
                        {displayedPosts.length > 0 ? (
                            displayedPosts.map(post => (
                                <BlogPostView key={post.id} post={post} onSelectTag={handleSelectTag} isAuthenticated={isAuthenticated} onEdit={handleEditPost} onDelete={handleDeletePost} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} />
                            ))
                        ) : (
                             <div className="text-center py-16 glass-card">
                                 <h2 className="text-2xl font-serif text-gradient">
                                    {searchQuery ? `No posts found for "${searchQuery}"` : selectedTag ? `No posts found for "${selectedTag}"` : "No posts yet. Time to write!"}
                                 </h2>
                                 <p className="text-gradient opacity-70 mt-2">
                                     {selectedTag || searchQuery ? "Try a different search or select another hashtag." : "Click 'New Post' to get started."}
                                 </p>
                             </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            <style>{`
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
            `}</style>
             {isLoginModalOpen && (
                <Login
                    onLoginSuccess={handleLogin}
                    onClose={() => setIsLoginModalOpen(false)}
                    credentials={credentials}
                    blogTitle={blogTitle}
                />
             )}
             {isSettingsPanelOpen && (
                <AdminPanel
                    onClose={() => setIsSettingsPanelOpen(false)}
                    blogTitle={blogTitle}
                    setBlogTitle={setBlogTitle}
                    authorName={authorName}
                    setAuthorName={setAuthorName}
                    aboutMeContent={aboutMeContent}
                    setAboutMeContent={setAboutMeContent}
                    credentials={credentials}
                    setCredentials={setCredentials}
                    themeColors={themeColors}
                    setThemeColors={setThemeColors}
                />
            )}
            <Sidebar 
                indexPosts={displayedPosts}
                allPosts={posts}
                blogTitle={blogTitle}
                onSelectPost={handleSelectPost}
                onSelectTag={handleSelectTag}
                onCreateNew={handleCreateNew}
                onOpenSettings={() => setIsSettingsPanelOpen(true)}
                onShowAbout={handleShowAbout}
                onLoginClick={() => setIsLoginModalOpen(true)}
                selectedTag={selectedTag}
                isAuthenticated={isAuthenticated}
                onLogout={handleLogout}
                theme={theme}
                toggleTheme={toggleTheme}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />
            <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto">
                {renderMainContent()}
            </main>
            <Chatbot posts={posts} blogTitle={blogTitle} />
        </div>
    );
};

export default App;