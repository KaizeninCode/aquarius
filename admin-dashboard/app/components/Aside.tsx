import { auth } from "@/firebaseConfig";
import { signOut } from "firebase/auth";
import React from "react";
import { MdDashboard } from "react-icons/md";
import { CiViewList } from "react-icons/ci";
import { IoIosLogOut } from "react-icons/io";

const Aside = () => {
  const links = [
    {
      name: 'Home',
      link: '/',
      icon: <MdDashboard />
    },
    {
      name: 'Orders',
      link: '/orders',
      icon: <CiViewList />
    },
  ]
  return (
    <aside className="fixed top-0 left-0 z-40 py-10 w-1/5 bg-slate-50 border border-slate-300 min-h-full space-x-5 flex flex-col justify-between">
      <div className="">
      <h1 className="text-3xl ml-5 text-slate-950 mb-auto">Aquarius</h1>
      <hr className="my-5 text-slate-300"/>
        {links.map((link, i) => (
          <a href={link.link} key={i} className="px-4 py-2 w-full flex items-center justify-start text-slate-950 text-xl gap-3">
            {link.icon}
            <p>{link.name}</p>
          </a>
        ))}
      </div>
      <button className="mt-auto rounded-lg w-2/5 mx-auto text-center gap-5 bg-red-100">
        <div className="flex items-center justify-center gap-5 text-red-500">
          Log Out
          <IoIosLogOut/>
        </div>
      </button>
    </aside>
  );
};

export default Aside;
