import React, { useState, useEffect } from 'react';
import { BlogPost } from '../types';
import { generateHashtags, checkSpellingAndGrammar } from '../services/geminiService';
import { SparklesIcon, SpellcheckIcon } from './Icons';

interface BlogEditorProps {
    onSave: (postData: { title: string; content: string; hashtags: string[]; imageUrl?: string; audioUrl?: string }, id?: string) => void;
    onCancel: () => void;
    postToEdit?: BlogPost;
}

const SolidInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="mt-1 block w-full px-4 py-3 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition" />
);

const SolidTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} className="mt-1 block w-full px-4 py-3 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition" />
);

const BlogEditor: React.FC<BlogEditorProps> = ({ onSave, onCancel, postToEdit }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [hashtags, setHashtags] = useState('');
    const [imagePreview, setImagePreview] = useState<string | undefined>();
    const [audioPreview, setAudioPreview] = useState<string | undefined>();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCheckingSpelling, setIsCheckingSpelling] = useState(false);

    useEffect(() => {
        if (postToEdit) {
            setTitle(postToEdit.title);
            setContent(postToEdit.content);
            setHashtags(postToEdit.hashtags.join(', '));
            setImagePreview(postToEdit.imageUrl);
            setAudioPreview(postToEdit.audioUrl);
        }
    }, [postToEdit]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setPreview: (url: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateHashtags = async () => {
        if (!content.trim()) {
            alert("Please write some content before generating hashtags.");
            return;
        }
        setIsGenerating(true);
        try {
            const generated = await generateHashtags(content);
            setHashtags(generated.join(', '));
        } catch (error) {
            console.error("Failed to generate hashtags", error);
            alert("Could not generate hashtags at this time.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSpellcheck = async () => {
        if (!content.trim()) {
            alert("Please write some content before checking.");
            return;
        }
        setIsCheckingSpelling(true);
        try {
            const correctedText = await checkSpellingAndGrammar(content);
            setContent(correctedText);
        } catch (error) {
            console.error("Failed to check spelling", error);
            alert("Could not check spelling and grammar at this time.");
        } finally {
            setIsCheckingSpelling(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const postData = {
            title,
            content,
            hashtags: hashtags.split(',').map(tag => tag.trim().replace(/^#/, '')).filter(Boolean).map(tag => `#${tag}`),
            imageUrl: imagePreview,
            audioUrl: audioPreview,
        };
        onSave(postData, postToEdit?.id);
    };

    return (
        <div className="glass-card p-8 animate-fade-in-up w-full">
            <h2 className="text-3xl font-serif font-bold text-gradient mb-8">{postToEdit ? 'Edit Post' : 'Create New Post'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gradient">Title</label>
                    <SolidInput type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gradient">Content</label>
                    <SolidTextarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={10} required />
                    <div className="flex items-center justify-end gap-2 mt-2">
                        <button type="button" onClick={handleSpellcheck} disabled={isCheckingSpelling || !content.trim()} className="flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition">
                            {isCheckingSpelling ? (
                                'Checking...'
                            ) : (
                                <>
                                    <SpellcheckIcon className="w-5 h-5" />
                                    <span>Spell Check</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                         <label htmlFor="image" className="block text-sm font-medium text-gradient">Cover Image</label>
                         <input type="file" id="image" accept="image/*" onChange={(e) => handleFileChange(e, setImagePreview)} className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-200 dark:file:bg-slate-700 file:text-teal-700 dark:file:text-teal-300 hover:file:bg-gray-300 dark:hover:file:bg-slate-600 transition"/>
                         {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 rounded-lg object-cover h-48 w-full"/>}
                    </div>
                    <div>
                         <label htmlFor="audio" className="block text-sm font-medium text-gradient">Background Music</label>
                         <input type="file" id="audio" accept="audio/*" onChange={(e) => handleFileChange(e, setAudioPreview)} className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-200 dark:file:bg-slate-700 file:text-rose-700 dark:file:text-rose-300 hover:file:bg-gray-300 dark:hover:file:bg-slate-600 transition"/>
                         {audioPreview && <audio controls src={audioPreview} className="mt-4 w-full"/>}
                    </div>
                </div>
                <div>
                    <label htmlFor="hashtags" className="block text-sm font-medium text-gradient">Hashtags (comma-separated)</label>
                    <div className="flex items-center space-x-2 mt-1">
                        <SolidInput type="text" id="hashtags" value={hashtags} onChange={(e) => setHashtags(e.target.value)} />
                        <button type="button" onClick={handleGenerateHashtags} disabled={isGenerating} className="flex items-center justify-center p-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition">
                            {isGenerating ? '...' : <SparklesIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                <div className="flex justify-end space-x-4">
                    <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition">Cancel</button>
                    <button type="submit" className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition">Publish</button>
                </div>
            </form>
        </div>
    );
};

export default BlogEditor;