import React, { useMemo } from 'react';
import { BlogPost } from '../types';
import { PlusIcon, SunIcon, MoonIcon, LogoutIcon, SettingsIcon, LoginIcon, SearchIcon } from './Icons';

interface SidebarProps {
    indexPosts: BlogPost[];
    allPosts: BlogPost[];
    blogTitle: string;
    onSelectPost: (id: string) => void;
    onSelectTag: (tag: string | null) => void;
    onCreateNew: () => void;
    onOpenSettings: () => void;
    onLoginClick: () => void;
    onShowAbout: () => void;
    selectedTag: string | null;
    isAuthenticated: boolean;
    onLogout: () => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const ThemeToggle: React.FC<{ theme: 'light' | 'dark', toggleTheme: () => void, onOpenSettings: () => void, isAuthenticated: boolean }> = ({ theme, toggleTheme, onOpenSettings, isAuthenticated }) => (
    <div className="flex items-center gap-2 p-1 rounded-full bg-white/20 dark:bg-black/20">
         {isAuthenticated && (
             <button
                onClick={onOpenSettings}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-black/40 transition-colors"
                aria-label="Open Settings"
             >
                <SettingsIcon className="w-5 h-5" />
             </button>
         )}
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-black/40 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>
    </div>
);


const Sidebar: React.FC<SidebarProps> = ({ indexPosts, allPosts, blogTitle, onSelectPost, onSelectTag, onCreateNew, onOpenSettings, onLoginClick, onShowAbout, selectedTag, isAuthenticated, onLogout, theme, toggleTheme, searchQuery, onSearchChange }) => {
    const allTags = [...new Set(allPosts.flatMap(p => p.hashtags))].sort();

    return (
        <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 p-4 md:h-screen md:sticky md:top-0">
            <div className="glass-card w-full h-full p-6 flex flex-col">
                <header className="text-center mb-8">
                    <div className="flex justify-end items-center mb-1">
                       <ThemeToggle theme={theme} toggleTheme={toggleTheme} onOpenSettings={onOpenSettings} isAuthenticated={isAuthenticated} />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-gradient cursor-pointer text-center" onClick={() => onSelectTag(null)}>{blogTitle}</h1>
                    <p className="text-sm text-gradient opacity-70 mt-1">Everyday Life Moments</p>
                    <button onClick={onShowAbout} className="text-sm text-gradient opacity-80 hover:opacity-100 underline transition-opacity duration-200 mt-2">
                        About Me
                    </button>
                </header>

                {isAuthenticated && (
                     <button onClick={onCreateNew} className="w-full flex items-center justify-center bg-rose-500/80 text-white font-bold py-3 px-4 rounded-lg hover:bg-rose-600/80 transition-all duration-300 shadow-lg hover:shadow-rose-500/40 mb-8">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        New Post
                    </button>
                )}

                <div className="mb-6">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="block w-full pl-10 pr-4 py-2 bg-black/10 dark:bg-white/10 border border-transparent rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
                            aria-label="Search posts"
                        />
                    </div>
                </div>

                <nav className="flex-grow overflow-y-auto">
                    <section className="mb-8">
                        <h2 className="text-xl font-serif font-bold text-gradient mb-3 border-b border-white/20 dark:border-white/10 pb-2">Index</h2>
                        {indexPosts.length > 0 ? (
                            <ul className="space-y-2">
                                {indexPosts.map(post => (
                                    <li key={post.id}>
                                        <a href="#" onClick={(e) => { e.preventDefault(); onSelectPost(post.id); }} className="text-gradient opacity-80 hover:opacity-100 transition-opacity duration-200 block text-ellipsis overflow-hidden whitespace-nowrap">
                                            {post.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gradient opacity-70">{searchQuery ? 'No matching posts found.' : 'No posts yet.'}</p>
                        )}
                    </section>

                    <section>
                        <h2 className="text-xl font-serif font-bold text-gradient mb-3 border-b border-white/20 dark:border-white/10 pb-2">Hashtags</h2>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => onSelectTag(null)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${!selectedTag ? 'bg-teal-500 text-white shadow-lg' : 'bg-black/10 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-black/20 dark:hover:bg-white/20'}`}>
                                All
                            </button>
                            {allTags.map(tag => (
                                <button key={tag} onClick={() => onSelectTag(tag)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedTag === tag ? 'bg-teal-500 text-white shadow-lg' : 'bg-black/10 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-black/20 dark:hover:bg-white/20'}`}>
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </section>
                </nav>
                <div className="mt-8 pt-4 border-t border-white/20 dark:border-white/10">
                    {isAuthenticated ? (
                        <button onClick={onLogout} className="w-full flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 font-semibold py-2 px-4 rounded-lg transition-colors duration-300">
                            <LogoutIcon className="w-5 h-5 mr-2" />
                            Logout
                        </button>
                    ) : (
                        <button onClick={onLoginClick} className="w-full flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 font-semibold py-2 px-4 rounded-lg transition-colors duration-300">
                            <LoginIcon className="w-5 h-5 mr-2" />
                            Author Login
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;