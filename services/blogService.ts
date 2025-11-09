import { BlogPost, Comment } from '../types';

// IMPORTANT: Replace this with the URL of your deployed Render Web Service.
// For example: 'https://your-blog-backend.onrender.com'
const API_BASE_URL = 'https://your-blog-backend.onrender.com';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`API Error: ${error.message || response.statusText}`);
    }
    if (response.status === 204) { // No Content
        return null;
    }
    return response.json();
}

export const getPosts = async (): Promise<BlogPost[]> => {
    const response = await fetch(`${API_BASE_URL}/api/posts`);
    return handleResponse(response);
};

export const createPost = async (post: BlogPost): Promise<BlogPost> => {
    const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
    });
    return handleResponse(response);
};

export const updatePost = async (id: string, postData: Partial<BlogPost>): Promise<BlogPost> => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
    });
    return handleResponse(response);
};

export const deletePost = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
        method: 'DELETE',
    });
    await handleResponse(response);
};

export const addComment = async (postId: string, newComment: Comment): Promise<BlogPost> => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newComment }),
    });
    return handleResponse(response);
};

export const deleteComment = async (postId: string, commentId: string): Promise<BlogPost> => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
    });
    return handleResponse(response);
};
