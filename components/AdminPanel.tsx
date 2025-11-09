import React, { useState } from 'react';
import { Credentials } from './Login';

interface ThemeColors {
  light: { start: string; end: string };
  dark: { start: string; end: string };
}

interface AdminPanelProps {
    onClose: () => void;
    blogTitle: string;
    setBlogTitle: (title: string) => void;
    authorName: string;
    setAuthorName: (name: string) => void;
    aboutMeContent: string;
    setAboutMeContent: (content: string) => void;
    credentials: Credentials;
    setCredentials: (creds: Credentials) => void;
    themeColors: ThemeColors;
    setThemeColors: (colors: ThemeColors | ((prev: ThemeColors) => ThemeColors)) => void;
    isAuthenticated: boolean;
    isAutoplayEnabled: boolean;
    toggleAutoplay: () => void;
}

const SolidInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="mt-1 block w-full px-4 py-3 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition" />
);

const SolidTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} className="mt-1 block w-full px-4 py-3 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition" />
);

const ToggleSwitch: React.FC<{ checked: boolean, onChange: () => void }> = ({ checked, onChange }) => (
    <label htmlFor="autoplay-toggle" className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} id="autoplay-toggle" className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
    </label>
);


const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, blogTitle, setBlogTitle, authorName, setAuthorName, aboutMeContent, setAboutMeContent, credentials, setCredentials, themeColors, setThemeColors, isAuthenticated, isAutoplayEnabled, toggleAutoplay }) => {
    const [activeTab, setActiveTab] = useState('user');
    const [newTitle, setNewTitle] = useState(blogTitle);
    const [newAuthorName, setNewAuthorName] = useState(authorName);
    const [newAboutMe, setNewAboutMe] = useState(aboutMeContent);
    const [newUsername, setNewUsername] = useState(credentials.username);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleTitleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setBlogTitle(newTitle);
        setSuccess('Blog title updated!');
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleAuthorNameSave = (e: React.FormEvent) => {
        e.preventDefault();
        setAuthorName(newAuthorName);
        setSuccess('Author name updated!');
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleAboutMeSave = (e: React.FormEvent) => {
        e.preventDefault();
        setAboutMeContent(newAboutMe);
        setSuccess('About Me section updated!');
        setTimeout(() => setSuccess(''), 3000);
    };
    
    const handleUsernameSave = (e: React.FormEvent) => {
        e.preventDefault();
        setCredentials({ ...credentials, username: newUsername });
        setSuccess('Username updated!');
        setTimeout(() => setSuccess(''), 3000);
    };

    const handlePasswordSave = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (currentPassword !== credentials.password) {
            setError('Current password does not match.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        setCredentials({ ...credentials, password: newPassword });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccess('Password updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleColorChange = (mode: 'light' | 'dark', position: 'start' | 'end', value: string) => {
        setThemeColors(prev => ({
            ...prev,
            [mode]: {
                ...prev[mode],
                [position]: value
            }
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="glass-card w-full max-w-lg p-8 space-y-4 animate-fade-in-up overflow-y-auto max-h-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                     <h2 className="text-3xl font-serif font-bold text-gradient">Settings</h2>
                     <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors">&times;</button>
                </div>
                
                {isAuthenticated && (
                     <div className="border-b border-white/20 dark:border-white/10">
                         <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                             <button onClick={() => setActiveTab('user')} className={`${activeTab === 'user' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}>
                                 User
                             </button>
                             <button onClick={() => setActiveTab('admin')} className={`${activeTab === 'admin' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}>
                                 Admin
                             </button>
                         </nav>
                     </div>
                )}
                
                {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                {success && <p className="text-sm text-green-400 text-center">{success}</p>}

                {activeTab === 'user' && (
                    <div className="space-y-3 pt-4">
                        <h3 className="text-lg font-serif font-bold text-gradient">Preferences</h3>
                        <div className="flex items-center justify-between mt-4 bg-black/5 dark:bg-white/5 p-4 rounded-lg">
                            <label htmlFor="autoplay-toggle" className="text-gradient font-medium">Enable Music Autoplay</label>
                            <ToggleSwitch checked={isAutoplayEnabled} onChange={toggleAutoplay} />
                        </div>
                    </div>
                )}
                
                {isAuthenticated && activeTab === 'admin' && (
                    <div className="space-y-6 pt-4">
                        <form onSubmit={handleTitleSave} className="space-y-3">
                            <label htmlFor="blogTitle" className="block text-sm font-medium text-gradient">Blog Title</label>
                            <div className="flex gap-2">
                                <SolidInput id="blogTitle" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                                <button type="submit" className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700">Save</button>
                            </div>
                        </form>

                         <form onSubmit={handleAuthorNameSave} className="space-y-3">
                            <label htmlFor="authorName" className="block text-sm font-medium text-gradient">Author Name</label>
                            <div className="flex gap-2">
                                <SolidInput id="authorName" value={newAuthorName} onChange={(e) => setNewAuthorName(e.target.value)} />
                                <button type="submit" className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700">Save</button>
                            </div>
                        </form>

                        <form onSubmit={handleAboutMeSave} className="space-y-3 pt-4 border-t border-white/20 dark:border-white/10">
                            <label htmlFor="aboutMeContent" className="block text-sm font-medium text-gradient">About Me Section</label>
                            <SolidTextarea id="aboutMeContent" value={newAboutMe} onChange={(e) => setNewAboutMe(e.target.value)} rows={6} />
                            <div className="text-right">
                                <button type="submit" className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700">Save About Me</button>
                            </div>
                        </form>

                        <form onSubmit={handleUsernameSave} className="space-y-3 pt-4 border-t border-white/20 dark:border-white/10">
                            <label htmlFor="username" className="block text-sm font-medium text-gradient">Username</label>
                            <div className="flex gap-2">
                                <SolidInput id="username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                                <button type="submit" className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700">Save</button>
                            </div>
                        </form>

                        <form onSubmit={handlePasswordSave} className="space-y-3 pt-4 border-t border-white/20 dark:border-white/10">
                            <h3 className="text-lg font-serif font-bold text-gradient">Change Password</h3>
                             <div>
                                <label htmlFor="currentPassword"  className="block text-sm font-medium text-gradient">Current Password</label>
                                <SolidInput id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                             </div>
                             <div>
                                <label htmlFor="newPassword"  className="block text-sm font-medium text-gradient">New Password</label>
                                <SolidInput id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                             </div>
                             <div>
                                <label htmlFor="confirmPassword"  className="block text-sm font-medium text-gradient">Confirm New Password</label>
                                <SolidInput id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                             </div>
                             <div className="text-right">
                                <button type="submit" className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-rose-500 hover:bg-rose-600">Update Password</button>
                             </div>
                        </form>

                        <div className="space-y-3 pt-4 border-t border-white/20 dark:border-white/10">
                            <h3 className="text-lg font-serif font-bold text-gradient">Theme Colors</h3>
                             <div>
                                <p className="block text-sm font-medium text-gradient mb-1">Light Mode Gradient</p>
                                <div className="flex gap-4">
                                    <div className="w-1/2">
                                        <label className="text-xs text-gradient opacity-80" htmlFor="light-start">Start</label>
                                        <input id="light-start" type="color" value={themeColors.light.start} onChange={(e) => handleColorChange('light', 'start', e.target.value)} className="mt-1 block w-full h-10 p-1 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm" />
                                    </div>
                                    <div className="w-1/2">
                                        <label className="text-xs text-gradient opacity-80" htmlFor="light-end">End</label>
                                        <input id="light-end" type="color" value={themeColors.light.end} onChange={(e) => handleColorChange('light', 'end', e.target.value)} className="mt-1 block w-full h-10 p-1 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm" />
                                    </div>
                                </div>
                            </div>
                             <div>
                                <p className="block text-sm font-medium text-gradient mb-1">Dark Mode Gradient</p>
                                <div className="flex gap-4">
                                    <div className="w-1/2">
                                        <label className="text-xs text-gradient opacity-80" htmlFor="dark-start">Start</label>
                                        <input id="dark-start" type="color" value={themeColors.dark.start} onChange={(e) => handleColorChange('dark', 'start', e.target.value)} className="mt-1 block w-full h-10 p-1 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm" />
                                    </div>
                                     <div className="w-1/2">
                                        <label className="text-xs text-gradient opacity-80" htmlFor="dark-end">End</label>
                                        <input id="dark-end" type="color" value={themeColors.dark.end} onChange={(e) => handleColorChange('dark', 'end', e.target.value)} className="mt-1 block w-full h-10 p-1 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
