// src/lib/user/getUserInfo.ts
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

type UserData ={
    uid: string,
    displayName: string;
    email: string;
    photoURL: string;
}

export const getUserInfo = async (userUID: string): Promise<UserData | null> => {
    if (userUID) {
        const docRef = doc(collection(db, "USER"), userUID);
        const docSnap = await getDoc(docRef);
        const data = docSnap.data() as UserData;
        return data ? data as UserData : null;
    }
    return null;
}