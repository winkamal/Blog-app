import React, { useState, useMemo, useEffect } from 'react';
import { BlogPost, Comment } from './types';
import Sidebar from './components/Sidebar';
import BlogPostView from './components/BlogPostView';
import BlogEditor from './components/BlogEditor';
import Login, { Credentials } from './components/Login';
import AdminPanel from './components/AdminPanel';
import { getPosts, addPost, updatePost, deletePost } from './services/blogService';
import Chatbot from './components/Chatbot';
import AboutMeView from './components/AboutMeView';
import { Timestamp } from 'firebase/firestore';

type View = 'list' | 'post' | 'create' | 'edit' | 'about';
type Theme = 'light' | 'dark';

interface ThemeColors {
  light: { start: string; end: string };
  dark: { start: string; end: string };
}

const App: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
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
    
    const refreshPosts = async () => {
        setIsLoadingData(true);
        try {
            const fetchedPosts = await getPosts();
            setPosts(fetchedPosts);
        } catch(e) {
            console.error("Failed to refresh posts", e);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        refreshPosts();
    }, []);

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

    const handleDeletePost = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            const postToDelete = posts.find(p => p.id === id);
            if (postToDelete) {
                try {
                    await deletePost(postToDelete);
                    await refreshPosts();
                    setView('list');
                    setSelectedPostId(null);
                } catch (error) {
                    console.error("Failed to delete post:", error);
                    alert("Could not delete post. Check console and Firebase rules.");
                }
            }
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

    const handleSavePost = async (postData: { title: string; content: string; hashtags: string[]; imageUrl?: string; audioUrl?: string }, id?: string) => {
        try {
            if (id) { // Editing existing post
                const originalPost = posts.find(p => p.id === id);
                if (!originalPost) throw new Error("Post not found for editing");
                
                const updatedPostData = { ...originalPost, ...postData };
                await updatePost(id, updatedPostData);
                setSelectedPostId(id);
            } else { // Creating new post
                const newPostData = {
                    ...postData,
                    author: authorName,
                };
                const newId = await addPost(newPostData);
                setSelectedPostId(newId);
            }
            await refreshPosts();
            setView('post');
        } catch (error) {
            console.error("Error saving post:", error);
            alert("Could not save post. Check your console and Firebase security rules.");
        }
    };
    
    const handleAddComment = async (postId: string, commentData: { author: string; content: string }) => {
        const postToUpdate = posts.find(post => post.id === postId);
        if (!postToUpdate) return;
    
        // FIX: The new comment object must match the `Comment` type, including the `date` property.
        const now = Timestamp.now();
        const newComment: Comment = {
            id: new Date().toISOString(),
            createdAt: now,
            ...commentData,
            date: now.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        };
    
        const updatedComments = [...(postToUpdate.comments || []), newComment];
        try {
            await updatePost(postId, { comments: updatedComments });
            await refreshPosts();
        } catch(e) {
            console.error("Failed to add comment", e);
            alert("Could not add comment. Please try again.");
        }
    };

    const handleDeleteComment = async (postId: string, commentId: string) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        const postToUpdate = posts.find(post => post.id === postId);
        if (!postToUpdate) return;
        
        const updatedComments = postToUpdate.comments.filter(c => c.id !== commentId);
        try {
            await updatePost(postId, { comments: updatedComments });
            await refreshPosts();
        } catch(e) {
            console.error("Failed to delete comment", e);
            alert("Could not delete comment. Please try again.");
        }
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
        if (isLoadingData) {
            return (
                <div className="flex justify-center items-center h-full glass-card p-8">
                     <h2 className="text-2xl font-serif text-gradient animate-pulse">Loading posts from the cloud...</h2>
                </div>
            )
        }
        switch (view) {
            case 'create':
                return <BlogEditor onSave={handleSavePost} onCancel={handleCancelCreate} />;
            case 'edit':
                 return <BlogEditor onSave={handleSavePost} onCancel={() => handleSelectPost(selectedPostId!)} postToEdit={currentPost} />;
            case 'post':
                if (currentPost) {
                    return <BlogPostView post={currentPost} onSelectTag={handleSelectTag} isAuthenticated={isAuthenticated} onEdit={handleEditPost} onDelete={handleDeletePost} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} />;
                }
                // If post is not found after loading, it might have been deleted.
                return <div className="text-center py-16 glass-card">
                          <h2 className="text-2xl font-serif text-gradient">Post not found.</h2>
                          <p className="text-gradient opacity-70 mt-2">It may have been deleted. Please select another post.</p>
                       </div>;
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