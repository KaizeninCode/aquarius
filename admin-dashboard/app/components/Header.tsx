'use client'
import { auth, db } from "@/firebaseConfig";
import { signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { MdDashboard } from "react-icons/md";
import { CiViewList } from "react-icons/ci";
import { IoIosLogOut } from "react-icons/io";
import { doc, getDoc } from "firebase/firestore";


const Header = () => {
  // const isLoginRoute = useSegments[0]()
  const [username, setUsername] = useState<string | null>(null)
  // fetch user's name from Firestore
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    (async () => {
      try {
        const userSnap = await getDoc(doc(db, "users", userId));
        if (userSnap.exists()) setUsername(userSnap.data()?.name ?? null);
        console.log(userSnap)
      } catch (error) {
        console.log("Failed to fetch user: ", error);
      }
    })();
  }, []);
  console.log(username)
  

  const handleLogout = async () => await signOut(auth) 

  // const getInitials = (name: string) =>
  // name
  //   .split(" ")
  //   .map((n) => n[0])
  //   .join("")
  //   .toUpperCase()
  //   .slice(0, 2);
  
  return (
    <header className="bg-slate-50 border-b border-slate-300 px-68 py-2 w-full flex justify-start items-center">
      <h2 className="text-xl font-bold text-slate-950 ml-1/5">
        Aquarius Admin Dashboard
      </h2>
      <div className="ml-auto space-x-5 flex items-center justify-between">
        <p className="text-lg text-slate-900">{username}</p>
        {/* <div className="rounded-full size-10 bg-slate-900 flex items-center justify-center">
          {getInitials(username!)}
        </div> */}
        <button
          className="w-fit bg-red-500 hover:bg-red-700 rounded-lg transition-colors text-white px-4 py-2"
          onClick={handleLogout}
        >
          <div className="flex items-center justify-center gap-3">
            Sign Out <IoIosLogOut />
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
