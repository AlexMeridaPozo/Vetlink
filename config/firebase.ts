import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiqLibp6p-BMAe9rOc46VMv6PKWQEtPOU",
  authDomain: "vetlink-bc8e2.firebaseapp.com",
  projectId: "vetlink-bc8e2",
  storageBucket: "vetlink-bc8e2.firebasestorage.app",
  messagingSenderId: "811948016554",
  appId: "1:811948016554:web:e4447edc179e04d8b221d3",
  measurementId: "G-18F2V51VBK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication (npx expo start --web)
const auth = getAuth(app);

export { auth };
