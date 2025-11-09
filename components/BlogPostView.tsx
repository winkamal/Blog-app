import React from 'react';
import { BlogPost } from '../types';
import CommentSection from './CommentSection';
import { EditIcon, TrashIcon } from './Icons';

interface BlogPostViewProps {
    post: BlogPost;
    onSelectTag: (tag: string) => void;
    isAuthenticated: boolean;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onAddComment: (postId: string, commentData: { author: string, content: string }) => void;
    onDeleteComment: (postId: string, commentId: string) => void;
}

const BlogPostView: React.FC<BlogPostViewProps> = ({ post, onSelectTag, isAuthenticated, onEdit, onDelete, onAddComment, onDeleteComment }) => {
    return (
        <article className="glass-card p-6 sm:p-8 w-full animate-fade-in-up relative hover:shadow-2xl">
            {isAuthenticated && (
                <div className="absolute top-4 right-4 flex space-x-2">
                    <button onClick={() => onEdit(post.id)} className="p-2 rounded-full bg-gray-200/50 dark:bg-slate-700/50 text-gray-800 dark:text-gray-200 hover:bg-gray-300/70 dark:hover:bg-slate-600/70 transition-colors">
                        <EditIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(post.id)} className="p-2 rounded-full bg-gray-200/50 dark:bg-slate-700/50 text-rose-500 dark:text-rose-400 hover:bg-gray-300/70 dark:hover:bg-slate-600/70 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
            <header className="mb-4">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient mb-2">{post.title}</h1>
                <p className="text-sm text-gradient opacity-70">By {post.author} on {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </header>

            {post.imageUrl && (
                <div className="my-6 rounded-2xl overflow-hidden shadow-lg">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-auto object-cover" />
                </div>
            )}
            
            <div className="prose prose-lg max-w-none text-gradient leading-relaxed dark:prose-invert" dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />

            {post.hashtags && post.hashtags.length > 0 && (
                <footer className="mt-8 pt-4 border-t border-black/10 dark:border-white/10">
                    <div className="flex flex-wrap gap-2">
                        {post.hashtags.map(tag => (
                            <button key={tag} onClick={() => onSelectTag(tag)} className="px-3 py-1 bg-teal-500/20 text-teal-800 dark:text-teal-200 rounded-full text-sm font-medium hover:bg-teal-500/40 transition-colors">
                                {tag}
                            </button>
                        ))}
                    </div>
                </footer>
            )}

            <CommentSection 
                comments={post.comments}
                postId={post.id}
                isAuthenticated={isAuthenticated}
                onAddComment={onAddComment}
                onDeleteComment={onDeleteComment}
            />
        </article>
    );
};

export default BlogPostView;