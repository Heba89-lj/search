import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, increment, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBELA_k2RX9erkknYH0TGK1qpwKr7TqGiU",
  authDomain:"ppo-alex.firebaseapp.com",
  projectId: "ppo-alex",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  try {
    const counterRef = doc(db, "counter", "visits");
    await updateDoc(counterRef, { count: increment(1) });

    const snap = await getDoc(counterRef);
    res.status(200).json({ count: snap.data().count });
  } catch (err) {
    res.status(500).json({ error: "حدث خطأ" });
  }
}
