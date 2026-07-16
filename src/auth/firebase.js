import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
    apiKey: "AIzaSyCip3vCJpstYatnQF3EB7_tt0-FCrL8PRY",
    authDomain: "jaque-e9d5e.firebaseapp.com",
    projectId: "jaque-e9d5e",
    storageBucket: "jaque-e9d5e.firebasestorage.app",
    messagingSenderId: "403774242732",
    appId: "1:403774242732:web:2acb6265b0d2616de28409",
};

export const isFirebaseConfigured = firebaseConfig.apiKey !== "TU_API_KEY";

let app = null, auth = null, db = null;
if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
}

export { app, auth, db };
