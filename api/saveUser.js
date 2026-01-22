import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import fetch from 'node-fetch';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function saveUser({ telegramId, firstName, lastName, username, photo }) {
  // Save to Firebase
  await setDoc(doc(db, 'users', telegramId.toString()), {
    telegramId,
    firstName,
    lastName,
    username,
    photo,
    lastLogin: serverTimestamp()
  }, { merge: true });

  // Save user pic + info in GitHub as txt
  const content = Buffer.from(JSON.stringify({ telegramId, firstName, lastName, username, photo }, null, 2)).toString('base64');

  const path = `users/${telegramId}.txt`;

  await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `Add/Update user ${telegramId}`,
      content,
      branch: process.env.GITHUB_BRANCH
    })
  });

  return true;
   }
