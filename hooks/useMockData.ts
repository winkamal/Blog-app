import { useState, useEffect, useRef } from 'react';
import { BlogPost } from '../types';
import { getPosts, savePosts } from '../services/cloudStorageService';

export const useMockData = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Ref to prevent the initial empty state from overwriting cloud data on first render
    const isInitialMount = useRef(true);

    // Effect to fetch initial posts from the cloud on component mount
    useEffect(() => {
        const fetchInitialPosts = async () => {
            try {
                setIsLoading(true);
                const cloudPosts = await getPosts();
                setPosts(cloudPosts);
                setError(null);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred while loading posts.");
                }
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialPosts();
    }, []);

    // Effect to save posts to the cloud whenever the local 'posts' state changes
    useEffect(() => {
        // Prevent saving on the very first render cycle before data has been fetched
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Only attempt to save if we are not in an initial loading or error state
        if (!isLoading && !error) {
            savePosts(posts).catch(err => {
                console.error("Failed to sync posts with cloud storage:", err);
                // Optionally, you could set an error state here to inform the user about the save failure
            });
        }
    }, [posts, isLoading, error]);

    return { posts, setPosts, isLoading, error };
};
