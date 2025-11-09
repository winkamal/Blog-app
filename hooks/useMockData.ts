import { useState } from 'react';
import { BlogPost } from '../types';

const initialPosts: BlogPost[] = [];

export const useMockData = () => {
    const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
    return { posts, setPosts };
};