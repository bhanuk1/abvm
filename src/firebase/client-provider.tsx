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
  const adminUid = 'default-admin-uid'; // A predictable UID

  try {
    // Check if user already exists by trying to sign in.
    // This is a workaround as listing users is an admin SDK feature.
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log('Default admin user already exists.');
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      console.log('Default admin user not found, creating one...');
      try {
        // Create the user
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
        console.log('Default admin user created successfully.');
      } catch (creationError) {
        console.error('Error creating default admin user:', creationError);
      }
    } else {
        // Another error occurred during sign-in check
        console.error("Error checking for admin user:", error);
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
