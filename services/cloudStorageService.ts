import { BlogPost } from '../types';

// A simple cloud JSON store endpoint.
const STORAGE_URL = 'https://api.npoint.io/4f7283e33f52a7873832';

/**
 * Fetches the array of blog posts from the cloud storage.
 * @returns A promise that resolves to an array of BlogPost objects.
 */
export const getPosts = async (): Promise<BlogPost[]> => {
    try {
        const response = await fetch(STORAGE_URL);
        if (!response.ok) {
            throw new Error(`Network response was not ok (status: ${response.status})`);
        }
        const data = await response.json();
        // npoint may return null or an empty object for a newly created or empty bin.
        // We ensure it's always an array to prevent runtime errors.
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error fetching posts from cloud storage:", error);
        // Re-throw the error to be handled by the calling function
        throw new Error('Failed to fetch posts from the cloud.');
    }
};

/**
 * Saves the entire array of blog posts to the cloud storage, overwriting existing data.
 * @param posts The array of BlogPost objects to save.
 * @returns A promise that resolves when the save operation is complete.
 */
export const savePosts = async (posts: BlogPost[]): Promise<void> => {
    try {
        const response = await fetch(STORAGE_URL, {
            method: 'POST', // npoint.io uses POST to update the bin contents
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(posts),
        });
        if (!response.ok) {
            throw new Error(`Network response was not ok (status: ${response.status})`);
        }
    } catch (error) {
        console.error("Error saving posts to cloud storage:", error);
        // Re-throw the error to be handled by the calling function
        throw new Error('Failed to save posts to the cloud.');
    }
};
