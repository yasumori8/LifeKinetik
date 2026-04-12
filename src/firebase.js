// Firebase initialisation — used for Google Auth.
// The config values are from the Firebase web app registered for this project.
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyD0g4XraQR2rBYiyoAjmEdux8WpiosgNjk',
  authDomain: 'vision-training-app.firebaseapp.com',
  projectId: 'vision-training-app',
  storageBucket: 'vision-training-app.firebasestorage.app',
  messagingSenderId: '1094844845747',
  appId: '1:1094844845747:web:7e00a8dec0b83c8a2f2ac6',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
