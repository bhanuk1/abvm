'use client';

import React, { useMemo, type ReactNode, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getFirestore, getDoc } from 'firebase/firestore';

// Function to create a default admin user if one doesn't exist.
// This is a one-time setup for the application.
const createDefaultAdmin = async () => {
  const { auth, firestore } = initializeFirebase();
  const adminEmail = 'admin@vidyalaya.com';
  const adminPassword = 'admin123';
  
  try {
    // Attempt to sign in to check if the user exists.
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    // Check if the user document exists in Firestore.
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // If auth user exists but doc doesn't, create the doc.
      console.log('Admin auth user exists, but Firestore document is missing. Creating document...');
      await setDoc(userDocRef, {
        id: user.uid,
        username: 'भानु प्रताप कुशवाहा',
        role: 'admin',
        mobile: '9140624586'
      });
      console.log('Default admin Firestore document created successfully.');
    } else {
      console.log('Default admin user and document already exist.');
    }
  } catch (error: any) {
    // Check for specific auth errors that indicate the user does not exist.
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      console.log('Default admin user not found, creating one...');
      try {
        // Create the user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        const user = userCredential.user;

        // Create the user profile document in Firestore
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, {
          id: user.uid,
          username: 'भानु प्रताप कुशवाहा',
          role: 'admin',
          mobile: '9140624586'
        });
        console.log('Default admin user and document created successfully.');
      } catch (creationError: any) {
        // Handle cases where creation might fail (e.g., race condition)
        if (creationError.code === 'auth/email-already-in-use') {
            console.log('Default admin was created by another process just now.');
        } else {
            console.error('Error creating default admin user:', creationError);
        }
      }
    } else {
        // Another unexpected error occurred during the sign-in check
        console.error("An unexpected error occurred while checking for admin user:", error);
    }
  }
};


interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    // Run the one-time setup for the default admin.
    createDefaultAdmin();
  }, []);


  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
