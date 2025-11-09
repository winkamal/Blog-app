import React, { useState } from 'react';
import { Comment } from '../types';
import { TrashIcon } from './Icons';

interface CommentSectionProps {
    comments: Comment[];
    postId: string;
    isAuthenticated: boolean;
    onAddComment: (postId: string, commentData: { author: string, content: string }) => void;
    onDeleteComment: (postId: string, commentId: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, postId, isAuthenticated, onAddComment, onDeleteComment }) => {
    const [author, setAuthor] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!author.trim() || !content.trim()) {
            alert('Please enter your name and a comment.');
            return;
        }
        onAddComment(postId, { author, content });
        setAuthor('');
        setContent('');
    };

    return (
        <div className="mt-12 pt-8 border-t border-black/10 dark:border-white/10">
            <h2 className="text-3xl font-serif font-bold text-gradient mb-6">Comments ({comments.length})</h2>
            
            <div className="space-y-4 mb-8">
                {comments.map(comment => (
                    <div key={comment.id} className="bg-black/5 dark:bg-white/5 p-4 rounded-lg flex justify-between items-start">
                        <div>
                            <p className="font-bold text-gradient">{comment.author}</p>
                            <p className="text-sm text-gradient opacity-70 mb-2">{comment.date}</p>
                            <p className="text-gradient opacity-90">{comment.content}</p>
                        </div>
                        {isAuthenticated && (
                            <button 
                                onClick={() => onDeleteComment(postId, comment.id)} 
                                className="p-2 rounded-full text-rose-500 dark:text-rose-400 hover:bg-gray-200/50 dark:hover:bg-slate-700/50 transition-colors flex-shrink-0 ml-4"
                                aria-label="Delete comment"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
                {comments.length === 0 && <p className="text-gradient opacity-70">Be the first to leave a comment.</p>}
            </div>

            <form onSubmit={handleSubmit} className="flex items-stretch gap-2 mt-8">
                <div className="w-48">
                    <label htmlFor="comment-author" className="sr-only">Name</label>
                    <input
                        id="comment-author"
                        type="text"
                        placeholder="Your Name"
                        value={author}
                        onChange={e => setAuthor(e.target.value)}
                        required
                        className="bg-black/10 dark:bg-white/10 px-4 py-2 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 w-full h-full transition"
                    />
                </div>
                <div className="flex-grow">
                    <label htmlFor="comment-content" className="sr-only">Comment</label>
                    <input
                        id="comment-content"
                        type="text"
                        placeholder="Your Comment..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        required
                        className="bg-black/10 dark:bg-white/10 px-4 py-2 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 w-full h-full transition"
                    />
                </div>
                <button type="submit" className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition">
                    Post
                </button>
            </form>
        </div>
    );
};

export default CommentSection;