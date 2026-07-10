
import { db } from "@/firebaseConfig";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoIosLogOut } from "react-icons/io";

export function Header() {
  // const { theme, setTheme } = useTheme();
  const [username, setUsername] = useState<string | null>(null)
  // fetch user's name from Firestore
  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
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
  

  const handleLogout = async () => await getAuth().signOut() 

  // const getInitials = (name: string) =>
  // name!
  //   .split(" ")
  //   .map((n) => n[0])
  //   .join("")
  //   .toUpperCase()
  //   .slice(0, 2);
  return (
    <header className="max-w-4xl mx-auto flex shrink-0 items-center gap-2 border-b border-slate-300 h-12 ease-linear">
      <div className="flex w-full items-center text-slate-500">
        {/* <SidebarTrigger /> */}
        <h1 className=" font-bold text-2xl text-blue-600 max-md:hidden">
          Admin Dashboard
        </h1>
        <div className="ml-auto space-x-5 flex items-center justify-between max-md:w-full max-md:px-4">
        <p className="text-lg text-slate-900">{username}</p>
        {/* <div className="rounded-full size-10 bg-slate-900 flex items-center justify-center">
          {getInitials(username!)}
        </div> */}
        <button
          className="max-md:ml-auto w-fit bg-red-500 hover:bg-red-700 rounded-lg transition-colors text-white px-4 py-2"
          onClick={handleLogout}
        >
          <div className="flex items-center justify-center gap-3">
            Sign Out <IoIosLogOut />
          </div>
        </button>
      </div>
      </div>
    </header>
  );
}