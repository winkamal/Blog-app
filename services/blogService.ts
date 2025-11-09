import { db, storage } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { BlogPost } from '../types';

const postsCollectionRef = collection(db, 'posts');

// Convert Firestore timestamp to a readable date string
const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const formatCommentDate = (timestamp: any) => {
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    // Fallback for potentially non-timestamp dates in old data
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};


// FETCH all posts from Firestore
export const getPosts = async (): Promise<BlogPost[]> => {
  try {
    const q = query(postsCollectionRef, orderBy('createdAt', 'desc'));
    const data = await getDocs(q);
    const posts = data.docs.map((doc) => {
        const docData = doc.data();
        return {
            ...docData,
            id: doc.id,
            date: formatDate(docData.createdAt),
            comments: docData.comments?.map((c: any) => ({
                ...c,
                date: formatCommentDate(c.createdAt),
            })) || [],
        } as BlogPost;
    });
    return posts;
  } catch (error) {
    console.error("Error fetching posts from Firestore:", error);
    alert("Could not fetch blog posts. Please check your Firebase setup and security rules. Reads for the 'posts' collection should be public.");
    return [];
  }
};

// UPLOAD a file to Firebase Storage
export const uploadFile = async (file: File): Promise<string> => {
    if (!file) throw new Error("No file provided for upload.");
    const fileRef = ref(storage, `media/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
};

// DELETE a file from Firebase Storage from its URL
const deleteFileByUrl = async (url: string) => {
    if (!url || !url.startsWith('https')) return;
    try {
        const fileRef = ref(storage, url);
        await deleteObject(fileRef);
    } catch (error: any) {
        if (error.code !== 'storage/object-not-found') {
            console.error("Error deleting file from storage:", error);
        }
    }
}

// ADD a new post to Firestore
export const addPost = async (postData: Partial<Omit<BlogPost, 'id' | 'date' | 'comments'>>): Promise<string> => {
    const newPost = {
        ...postData,
        createdAt: Timestamp.now(),
        comments: [],
    };
    const docRef = await addDoc(postsCollectionRef, newPost);
    return docRef.id;
};

// UPDATE an existing post in Firestore
export const updatePost = async (id: string, postData: Partial<BlogPost>): Promise<void> => {
    const postDoc = doc(db, 'posts', id);
    const updateData = { ...postData };
    delete updateData.id; 
    await updateDoc(postDoc, updateData);
};

// DELETE a post from Firestore and its associated media from Storage
export const deletePost = async (post: BlogPost): Promise<void> => {
    if (post.imageUrl) {
        await deleteFileByUrl(post.imageUrl);
    }
    if (post.audioUrl) {
        await deleteFileByUrl(post.audioUrl);
    }
    const postDoc = doc(db, 'posts', post.id);
    await deleteDoc(postDoc);
};
