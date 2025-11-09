import React, { useState, useEffect, useRef } from 'react';
import { BlogPost } from '../types';
import { generateHashtags, checkSpellingAndGrammar } from '../services/geminiService';
import { uploadImage } from '../services/vercelService';
import { SparklesIcon, SpellcheckIcon, ImageIcon } from './Icons';

interface BlogEditorProps {
    onSave: (postData: Omit<BlogPost, 'id'|'author'|'date'|'comments'>, id?: string) => Promise<void>;
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
    
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | undefined>();
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCheckingSpelling, setIsCheckingSpelling] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // To prevent memory leaks from URL.createObjectURL
    const imagePreviewUrlRef = useRef<string | null>(null);

    useEffect(() => {
        if (postToEdit) {
            setTitle(postToEdit.title);
            setContent(postToEdit.content);
            setHashtags(postToEdit.hashtags.join(', '));
            setImagePreview(postToEdit.imageUrl);
        }
        
        return () => {
             if (imagePreviewUrlRef.current) URL.revokeObjectURL(imagePreviewUrlRef.current);
        }
    }, [postToEdit]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            if (imagePreviewUrlRef.current) {
                URL.revokeObjectURL(imagePreviewUrlRef.current);
            }
            const newPreviewUrl = URL.createObjectURL(file);
            setImagePreview(newPreviewUrl);
            imagePreviewUrlRef.current = newPreviewUrl;
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let imageUrl = postToEdit?.imageUrl;
            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }

            const postData = {
                title,
                content,
                hashtags: hashtags.split(',').map(tag => tag.trim().replace(/^#/, '')).filter(Boolean).map(tag => `#${tag}`),
                imageUrl,
            };
            await onSave(postData, postToEdit?.id);
        } catch (error) {
            console.error("Failed to save post:", error);
            alert("An error occurred while saving the post. Please check the console and try again.");
            setIsSaving(false);
        } 
        // Do not set isSaving to false here, as the parent component will navigate away on success.
    };

    return (
        <div className="glass-card p-8 animate-fade-in-up w-full">
            <h2 className="text-3xl font-serif font-bold text-gradient mb-8">{postToEdit ? 'Edit Post' : 'Create New Post'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset disabled={isSaving}>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gradient">Title</label>
                        <SolidInput type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gradient">Content</label>
                        <SolidTextarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={12} required />
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

                    <div>
                         <label htmlFor="image" className="block text-sm font-medium text-gradient mb-1">Cover Image</label>
                         <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {imagePreview ? (
                                     <img src={imagePreview} alt="Preview" className="mx-auto rounded-lg object-cover h-48 max-w-full"/>
                                ) : (
                                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                )}
                                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                    <label htmlFor="image-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500">
                                        <span>{imageFile ? 'Change image' : 'Upload an image'}</span>
                                        <input id="image-upload" name="image" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </div>
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
                </fieldset>
                <div className="flex justify-end space-x-4">
                    <button type="button" onClick={onCancel} disabled={isSaving} className="px-6 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 transition">Cancel</button>
                    <button type="submit" disabled={isSaving} className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition">
                        {isSaving ? 'Saving...' : postToEdit ? 'Save Changes' : 'Publish Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BlogEditor;
