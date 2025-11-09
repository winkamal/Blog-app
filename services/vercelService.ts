// --- SIMPLIFIED SETUP INSTRUCTIONS ---
//
// You only need to set up two things: one for storing text and one for storing images.
//
// PART 1: VERCEL KV (for Text Storage)
// 1. Go to your Vercel Project Dashboard.
// 2. Click the "Storage" tab and create a "KV (Redis)" store.
// 3. Connect it to your project.
// 4. Go to the store's page, click ".env.local", and copy the variables.
// 5. In your project's "Settings" -> "Environment Variables", add:
//    - KV_REST_API_URL
//    - KV_REST_API_TOKEN
//
// PART 2: IMGBB (for Image Storage)
// 1. Go to https://api.imgbb.com/ and click "Get API Key".
// 2. Sign up for a free account.
// 3. Copy your API key.
// 4. Go back to your Vercel "Environment Variables" and add a new variable:
//    - Name: IMGBB_API_KEY
//    - Value: Paste the key you just copied.
//
// That's it! Your blog is now connected to a simple and robust backend.

import { BlogPost } from '../types';

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

const POSTS_KEY = 'blog-posts';

const checkEnvVars = () => {
    if (!KV_URL || !KV_TOKEN) {
        console.error("Vercel KV environment variables are not configured.");
        return false;
    }
    if (!IMGBB_API_KEY) {
        console.error("ImgBB API key is not configured.");
        return false;
    }
    return true;
};

// Vercel KV (Redis) Functions for text data
const kv = {
    async get<T>(key: string): Promise<T | null> {
        if (!KV_URL || !KV_TOKEN) return null;
        const res = await fetch(`${KV_URL}/get/${key}`, {
            headers: { Authorization: `Bearer ${KV_TOKEN}` },
            cache: 'no-store' // No caching for dynamic data
        });
        if (!res.ok) {
            console.error(`Failed to fetch from KV: ${res.statusText}`);
            return null;
        }
        const { result } = await res.json();
        return result ? JSON.parse(result) : null;
    },
    async set(key: string, value: any): Promise<void> {
        if (!KV_URL || !KV_TOKEN) {
            throw new Error("Vercel KV environment variables are not configured.");
        }
        const response = await fetch(`${KV_URL}/set/${key}`, {
            headers: { Authorization: `Bearer ${KV_TOKEN}` },
            method: 'POST',
            body: JSON.stringify(value),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Failed to save to Vercel KV:", errorBody);
            throw new Error(`Failed to save data to KV store. Status: ${response.status}. Details: ${errorBody}`);
        }
    }
};

// Main Data Service Functions

export const getPosts = async (cursor: number = 0, count: number = 5): Promise<{ posts: BlogPost[], nextCursor: number | null }> => {
    if (!checkEnvVars()) return { posts: [], nextCursor: null };
    const allPosts: BlogPost[] | null = await kv.get(POSTS_KEY);
    if (!allPosts) {
        return { posts: [], nextCursor: null };
    }
    // Ensure posts are sorted newest first
    const sortedPosts = allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const paginatedPosts = sortedPosts.slice(cursor, cursor + count);
    const nextCursor = (cursor + count < sortedPosts.length) ? cursor + count : null;
    
    return { posts: paginatedPosts, nextCursor };
};


export const getAllPosts = async (): Promise<BlogPost[]> => {
    if (!checkEnvVars()) return [];
    const allPosts: BlogPost[] | null = await kv.get(POSTS_KEY);
    return allPosts || [];
};

export const savePost = async (postData: Omit<BlogPost, 'id' | 'author' | 'date' | 'comments'>, id?: string): Promise<BlogPost> => {
    if (!checkEnvVars()) throw new Error("Environment variables not set.");
    const allPosts = await getAllPosts();
    let updatedPost: BlogPost;

    if (id) { // Editing
        let postExists = false;
        const updatedPosts = allPosts.map(p => {
            if (p.id === id) {
                postExists = true;
                updatedPost = { ...p, ...postData };
                return updatedPost;
            }
            return p;
        });
        if (!postExists) throw new Error("Post to edit not found");
        await kv.set(POSTS_KEY, updatedPosts);
    } else { // Creating
        updatedPost = {
            ...postData,
            id: new Date().toISOString(),
            author: localStorage.getItem('authorName') || 'Author',
            date: new Date().toISOString(),
            comments: [],
        };
        const updatedPosts = [updatedPost, ...allPosts];
        await kv.set(POSTS_KEY, updatedPosts);
    }
    return updatedPost!;
};


export const deletePost = async (id: string): Promise<void> => {
    if (!checkEnvVars()) throw new Error("Environment variables not set.");
    const allPosts = await getAllPosts();
    const updatedPosts = allPosts.filter(p => p.id !== id);
    await kv.set(POSTS_KEY, updatedPosts);
};

export const updateComments = async (postId: string, comments: BlogPost['comments']): Promise<void> => {
    if (!checkEnvVars()) throw new Error("Environment variables not set.");
    const allPosts = await getAllPosts();
    const updatedPosts = allPosts.map(p => {
        if (p.id === postId) {
            return { ...p, comments };
        }
        return p;
    });
    await kv.set(POSTS_KEY, updatedPosts);
};


// ImgBB Image Upload Function

export const uploadImage = async (file: File): Promise<string> => {
    if (!IMGBB_API_KEY) throw new Error("ImgBB API key is not configured.");
    
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Image upload failed: ${errorText}`);
    }

    const result = await response.json();
    if (result.data && result.data.url) {
        return result.data.url;
    } else {
        throw new Error('Image upload failed: Invalid response from ImgBB.');
    }
};
