import React from 'react';
import { BlogPost } from '../types';

interface BlogPostCardProps {
    post: BlogPost;
    onSelectPost: (id: string) => void;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, onSelectPost }) => {
    const contentPreview = post.content.split('\n')[0];
    const snippet = contentPreview.length > 150 ? contentPreview.substring(0, 150) + '...' : contentPreview;

    return (
        <article 
            className="glass-card p-6 sm:p-8 w-full animate-fade-in-up relative hover:shadow-2xl cursor-pointer transition-shadow"
            onClick={() => onSelectPost(post.id)}
            onKeyPress={(e) => { if (e.key === 'Enter') onSelectPost(post.id); }}
            role="link"
            tabIndex={0}
            aria-label={`Read more about ${post.title}`}
        >
            <header className="mb-4">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-gradient mb-2 group-hover:underline">{post.title}</h2>
                <p className="text-sm text-gradient opacity-70">By {post.author} on {post.date}</p>
            </header>
            
            {post.imageUrl && (
                <div className="my-6 rounded-lg overflow-hidden max-h-64">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                </div>
            )}

            <div className="prose max-w-none text-gradient leading-relaxed dark:prose-invert">
                <p>{snippet}</p>
            </div>

            <div className="mt-6 flex justify-between items-center">
                {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {post.hashtags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-teal-500/10 text-teal-800 dark:text-teal-200 rounded-full text-xs font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
                <span className="text-teal-500 dark:text-teal-400 font-semibold hover:underline ml-auto flex-shrink-0">
                    Read more &rarr;
                </span>
            </div>
        </article>
    );
};

export default BlogPostCard;
