import React, { useState } from 'react';
import { CloseIcon } from './Icons';

export interface Credentials {
    username: string;
    password?: string;
}

interface LoginProps {
    onLoginSuccess: () => void;
    onClose: () => void;
    credentials: Credentials;
    blogTitle: string;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onClose, credentials, blogTitle }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === credentials.username && password === credentials.password) {
            onLoginSuccess();
        } else {
            setError('Invalid username or password.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up" onClick={onClose}>
            <div className="w-full max-w-md p-8 space-y-8 glass-card relative" onClick={(e) => e.stopPropagation()}>
                 <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-black/20 transition-colors" aria-label="Close login">
                    <CloseIcon className="w-5 h-5" />
                </button>
                <div className="text-center">
                    <h1 className="text-4xl font-serif font-bold text-gradient">{blogTitle}</h1>
                    <p className="text-sm text-gradient opacity-70 mt-1">Author Login</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-slate-700 rounded-t-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                                placeholder="Username"
                            />
                        </div>
                        <div>
                            <label htmlFor="password-input" className="sr-only">Password</label>
                            <input
                                id="password-input"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-slate-700 rounded-b-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-center text-sm text-red-400">{error}</p>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-rose-500/80 hover:bg-rose-600/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all duration-300 shadow-lg hover:shadow-rose-500/40"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;