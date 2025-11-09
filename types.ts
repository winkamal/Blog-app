export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string; // The formatted string for display
  createdAt?: any; // For Firestore Timestamp
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string; // The formatted string for display
  createdAt?: any; // For Firestore Timestamp
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  hashtags: string[];
  comments: Comment[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
