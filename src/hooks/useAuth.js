// useAuth manages Google authentication state.
// Returns the current user (or null), a loading flag, and sign-in / sign-out handlers.
import { useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase.js'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Listen for auth state changes (login, logout, page reload)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  // Opens Google sign-in popup
  const signInWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error('Google sign-in failed:', err)
    }
  }, [])

  // Signs the user out
  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error('Sign-out failed:', err)
    }
  }, [])

  return { user, loading, signInWithGoogle, signOut: handleSignOut }
}
