'use client'
import { auth } from "@/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useState } from "react";



const Login = () => {
  const router = useRouter()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = async () => {
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/') 
    } catch (error) {
      console.log(error);
      setLoginError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gap-10 bg-slate-50">
      
      <div className="w-2/5 h-full flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 w-full max-w-sm shadow-sm">
          <h2 className="text-xl text-center font-bold mb-6 text-slate-950">
            Aquarius Admin
          </h2>
          <input
            type="text"
            className="placeholder:text-slate-500 text-slate-700 block w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm mb-3 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="placeholder:text-slate-500 text-slate-700 block w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm mb-3 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          {loginError && (
            <p className="text-red-500 text-sm mb-3">{loginError}</p>
          )}
          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            onClick={handleLogin}
          >
            Log In
          </button>
        </div>
      </div>
      <div className='bg-blue-600 h-screen w-3/5 flex flex-col items-center justify-center text-center'>
        <h1 className='font-bold mb-5 text-6xl'>Aquarius Admin Dashboard</h1>
        <h5 className="text-2xl">Manage your clients, orders, and business finances.</h5>
      </div>
    </div>
  );
};

export default Login;
