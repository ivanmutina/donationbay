import { initializeApp } from 'firebase/app';
import { collection, getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCO3QWLiPMJyrZqZLi66vsRsvVVgcGvyQg",
    authDomain: "donationbay-e73e3.firebaseapp.com",
    projectId: "donationbay-e73e3",
    storageBucket: "donationbay-e73e3.appspot.com",
    messagingSenderId: "782503376003",
    appId: "1:782503376003:web:f7466ee2269ae9864997b6"
};

// init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { initializeApp, db, getAuth, getStorage, ref, uploadBytes, getDownloadURL, storage };