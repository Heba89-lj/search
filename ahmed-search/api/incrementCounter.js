import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, increment, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  try {
    const counterRef = doc(db, "COUNTER", "VISITS");

   const snap = await getDoc(counterRef);

if (!snap.exists()) {
  await setDoc(counterRef, { COUNT: 1 });
} else {
  await setDoc(counterRef, { COUNT: increment(1) }, { merge: true });
}

const updatedSnap = await getDoc(counterRef);
res.status(200).json({ count: updatedSnap.data().COUNT});
    const snap = await getDoc(counterRef);
    res.status(200).json({ count: snap.data().COUNT });
  } catch (err) {
    console.error("Firebase Error:", err);
    res.status(500).json({ error: err.message });
  }
}
