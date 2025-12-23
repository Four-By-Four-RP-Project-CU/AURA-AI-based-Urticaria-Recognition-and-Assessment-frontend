import React from "react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { Button } from "flowbite-react";

export default function OAuth() {
  const navigate = useNavigate();
  async function onGoogleClick() {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // check for the user in the database
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // if user doesn't exist in the database, create a new one
        await setDoc(docRef, {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp(),
        });
      }
      navigate("/");
      toast.success("Successfully logged in");
    } catch (error) {
      toast.error("Couldn't Authorized with Google");
    }
  }
  return (
    <Button
      type="button"
      gradientDuoTone="pinkToOrange"
      onClick={onGoogleClick}
      className="uppercase w-full"
    >
      <FcGoogle className="text-2xl bg-white rounded-full mr-2" /> Continue With
      Google
    </Button>
  );
}
