
export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  imageUrl?: string;
  hashtags: string[];
  comments: Comment[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}