import { useState, useEffect } from 'react';
import { BlogPost } from '../types';

const STORAGE_KEY = 'vt-blog-posts';

const getInitialPosts = (): BlogPost[] => {
  try {
    const item = window.localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error('Error reading blog posts from localStorage', error);
    return [];
  }
};


export const useMockData = () => {
    const [posts, setPosts] = useState<BlogPost[]>(getInitialPosts);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
        } catch (error) {
            console.error('Error saving blog posts to localStorage', error);
        }
    }, [posts]);

    return { posts, setPosts };
};
