import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// =================================================================================
// IMPORTANT: ACTION REQUIRED
// =================================================================================
// 1. Create a Firebase project at https://console.firebase.google.com/
// 2. In your project, go to Project Settings > General.
// 3. Under "Your apps", click the Web icon (</>) to create a new web app.
// 4. After creating the app, you will see a `firebaseConfig` object.
// 5. Copy the values from your Firebase project and paste them here.
// =================================================================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// =================================================================================
// Firebase Security Rules Setup
// =================================================================================
// For this app to work, you MUST set up security rules.
// 1. Go to your Firebase project console.
// 2. Navigate to "Firestore Database" > "Rules".
// 3. Paste the following and publish:
//
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /posts/{postId} {
//       // Anyone can read posts, but only authenticated users will be able to write.
//       // For now, we'll allow writes for simplicity, but you should lock this down.
//       allow read: if true;
//       allow write: if true; // In production, change to: allow write: if request.auth != null;
//     }
//   }
// }
//
// 4. Navigate to "Storage" > "Rules".
// 5. Paste the following and publish:
//
// rules_version = '2';
// service firebase.storage {
//   match /b/{bucket}/o {
//     // Allow anyone to read. Allow writes for now.
//     match /{allPaths=**} {
//       allow read: if true;
//       allow write: if true; // In production, change to: allow write: if request.auth != null;
//     }
//   }
// }
// =================================================================================


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
