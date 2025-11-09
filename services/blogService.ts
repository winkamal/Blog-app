import { BlogPost } from '../types';

// This implementation uses a free, no-auth key-value store (kvdb.io) for demonstration.
// This makes the blog data persistent and globally accessible.
// A unique bucket and key are used to store the blog's data.
const BUCKET_URL = 'https://kvdb.io/AS4hJg28W2LhY7b8X9cK3d/vt-blog-posts';

export const getPosts = async (): Promise<BlogPost[]> => {
  try {
    const response = await fetch(BUCKET_URL);
    if (response.status === 404) {
      // If the key doesn't exist, it's a new blog. Return an empty array.
      return [];
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching posts:", error);
    // Return an empty array to prevent the app from crashing on network errors.
    return [];
  }
};

export const savePosts = async (posts: BlogPost[]): Promise<void> => {
  try {
    const response = await fetch(BUCKET_URL, {
      method: 'POST', // Using POST to create or update the data blob.
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(posts),
    });

    if (!response.ok) {
      throw new Error(`Failed to save posts: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error saving posts:", error);
    // Re-throw the error to be handled by the caller, e.g., to show a UI notification.
    throw error;
  }
};
