'use server';

import { redirect } from 'next/navigation';
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// IMPORTANT: Do not expose this to the client-side.
// This is a service account and should only be used in server environments.
const serviceAccount = {
  "projectId": "studio-4261181557-cfba9",
  "privateKey": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  "clientEmail": "firebase-adminsdk-yl2in@studio-4261181557-cfba9.iam.gserviceaccount.com"
};

function getAdminApp(): App {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    if (serviceAccount.privateKey) {
        return initializeApp({
            credential: cert(serviceAccount),
        });
    }

    throw new Error("Firebase Admin initialization failed: private_key is not available.");
}


export async function handleLogin(role: string) {
    if (role === 'admin') {
      redirect('/dashboard');
    } else if (role === 'teacher') {
      redirect('/teacher-dashboard');
    } else if (role === 'parent') {
      redirect('/parent-dashboard');
    } else if (role === 'student') {
      redirect('/student-dashboard');
    }
    else {
      // For student and parent, redirect to a generic dashboard for now
      redirect('/dashboard');
    }
}

export async function createUserAction(userData: any) {
    'use server';
    
    let app: App;
    try {
        app = getAdminApp();
    } catch (error: any) {
        const message = 'सर्वर एक्शन कॉन्फ़िगर नहीं है। फायरबेस एडमिन प्रारंभ करने में विफल।';
        console.error(message, error.message);
        return { success: false, message: message };
    }

    const auth = getAuth(app);
    const firestore = getFirestore(app);
    
    const generatePassword = () => Math.random().toString(36).slice(-8);

    try {
        const primaryPassword = generatePassword();
        const primaryUserId = `${userData.role}_${Date.now()}`;
        const primaryEmail = `${primaryUserId}@vidyalaya.com`;

        // Create the primary user (teacher or parent) in Firebase Auth
        const userRecord = await auth.createUser({
            email: primaryEmail,
            password: primaryPassword,
            displayName: userData.username,
        });

        const userDocRef = firestore.collection('users').doc(userRecord.uid);
        let primaryUserData: any = {
            id: userRecord.uid,
            userId: primaryUserId,
            password: primaryPassword,
            username: userData.username,
            role: userData.role,
        };

        if (userData.role === 'teacher') {
            primaryUserData = {
                ...primaryUserData,
                mobile: userData.teacherMobile,
                classSubject: `${userData.teacherClass} - ${userData.teacherSubject}`,
            };
        } else if (userData.role === 'parent') {
             if (!userData.studentName) {
                return { success: false, message: 'अभिभावक बनाते समय कृपया छात्र का नाम भरें।' };
            }
            primaryUserData = {
                ...primaryUserData,
                fatherName: userData.username,
                motherName: userData.motherName,
                address: userData.address,
                mobile: userData.studentMobile,
            };

            // Create associated student
            const studentPassword = generatePassword();
            const studentUserId = `student_${Date.now()}`;
            const studentEmail = `${studentUserId}@vidyalaya.com`;
            const studentUserRecord = await auth.createUser({
                email: studentEmail,
                password: studentPassword,
                displayName: userData.studentName,
            });
            const studentDocRef = firestore.collection('users').doc(studentUserRecord.uid);
            const studentData = {
              id: studentUserRecord.uid,
              userId: studentUserId,
              password: studentPassword,
              username: userData.studentName,
              role: 'student',
              class: userData.studentClass,
              subjects: userData.studentSubjects,
              fatherName: userData.username,
              motherName: userData.motherName,
              address: userData.address,
              dob: userData.dob,
              admissionDate: userData.admissionDate,
              aadhaar: userData.aadhaar,
              pen: userData.pen,
              mobile: userData.studentMobile,
              rollNo: userData.rollNo,
              parentId: userRecord.uid,
            };
            await studentDocRef.set(studentData);

        } else if (userData.role === 'student') {
             primaryUserData = {
                ...primaryUserData,
                class: userData.studentClass,
                subjects: userData.studentSubjects,
                fatherName: userData.parentName,
                motherName: userData.motherName,
                address: userData.address,
                dob: userData.dob,
                admissionDate: userData.admissionDate,
                aadhaar: userData.aadhaar,
                pen: userData.pen,
                mobile: userData.studentMobile,
                rollNo: userData.rollNo,
            };
        }

        // Save primary user data to Firestore
        await userDocRef.set(primaryUserData);

        return { success: true, message: 'नया उपयोगकर्ता सफलतापूर्वक बनाया गया।' };

    } catch (error: any) {
        console.error("Error in createUserAction:", error);
        if (error.code === 'auth/email-already-exists') {
            return { success: false, message: 'यह यूजर आईडी पहले से मौजूद है।' };
        }
        return { success: false, message: `उपयोगकर्ता बनाने में विफल: ${error.message}` };
    }
}
