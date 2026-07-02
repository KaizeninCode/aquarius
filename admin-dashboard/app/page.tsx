"use client";
import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
  getDoc,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { db, auth } from "@/firebaseConfig";
import Aside from "./components/Aside";
import Header from "./components/Header";
import Orders from "./components/Orders";
import { redirect } from "next/navigation";

type OrderStatus =
  | "placed"
  | "confirmed"
  | "assigned"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

type Order = {
  id: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: number;
  totalAmount: number;
  items: { name: string; quantity: number; price: number }[];
  deliveryAddress: { label: string; notes: string; lat: number; lng: number };
  driverId: string | null;
  driverName: string | null;
  createdAt: { seconds: number } | null;
};

type Driver = {
  id: string;
  name: string;
  isAvailable: boolean;
};

type Tab = "needs_attention" | "active" | "history";

const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  assigned: "Assigned",
  out_for_delivery: "In Progress",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_CLASSES: Record<OrderStatus, string> = {
  placed: "bg-slate-100 text-slate-600",
  confirmed: "bg-blue-100 text-blue-600",
  assigned: "bg-blue-100 text-blue-600",
  out_for_delivery: "bg-amber-100 text-amber-600",
  delivered: "bg-green-100 text-green-600",
  cancelled: "bg-red-100 text-red-600",
};

const AdminMainPage = () => {
  const [authed, setAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [tab, setTab] = useState<Tab>("needs_attention");
  const [selectedDriver, setSelectedDriver] = useState<Record<string, string>>(
    {},
  );
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  // fetch user's name from Firestore
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    (async () => {
      try {
        const userSnap = await getDoc(doc(db, "users", userId));
        if (userSnap.exists()) setUsername(userSnap.data()?.name ?? null);
      } catch (error) {
        console.log("Failed to fetch user: ", error);
      }
    })();
  }, []);

  // auth check
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setAuthed(!!user)
      setAuthLoading(false)
    });
  }, []);

  // load all non cancelled orders, live
  useEffect(() => {
    if (!authed) return;
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) =>
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order)),
    );
  }, [authed]);

  // load all drivers, live
  useEffect(() => {
    if (!authed) return;
    const q = query(collection(db, "users"), where("role", "==", "driver"));

    return onSnapshot(q, (snap) =>
      setDrivers(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Driver)),
    );
  }, [authed]);

  // row 1  - order counts
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === "delivered").length;
  const pendingOrders = orders.filter(
    (o) => o.status === "placed" || o.status === "confirmed",
  ).length;

  // row 2 - revenue (money that has already been paid and received)
  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const averageRevenue =
    completedOrders > 0 ? Math.round(totalRevenue / completedOrders) : 0;

  const todaysRevenue = orders
    .filter((o) => {
      if (o.status !== "delivered" || !o.createdAt) return false;
      const orderDate = new Date(o.createdAt.seconds * 1000);
      const today = new Date();

      return (
        orderDate.getDate() === today.getDate() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const summaryCards = [
    { label: "Total Orders", value: totalOrders },
    { label: "Completed", value: completedOrders },
    { label: "Pending", value: pendingOrders },
    { label: "Total Revenue", value: `KES ${totalRevenue.toLocaleString()}` },
    { label: "Avg. Revenue", value: `KES ${averageRevenue.toLocaleString()}` },
    {
      label: "Today's Revenue",
      value: `KES ${todaysRevenue.toLocaleString()}`,
    },
  ];

  // login
  if (authLoading) return null
  if (!authed) {
    window.location.href="/auth/login"
    return null
  };

  // Main Dashboard
  return (
    <main className="min-h-screen bg-slate-50">
      {/* <Aside/> */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* MAIN DASHBOARD LAYOUT */}
        <div className="w-full rounded-lg bg-blue-500 h-1/5 p-4 mb-5">
          <p className="text-2xl text-white">Business Name</p>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-5">Summary</h2>

        {/* FIRST ROW */}
        <div className="grid grid-cols-3 gap-5 mb-5">
          {summaryCards.map((card, i) => (
            <div
              key={i}
              className="w-full rounded-lg bg-white shadow-sm shadow-slate-500 flex items-center justify-center p-4 size-40"
            >
              <div className="space-y-3 text-center">
                <p className="text-4xl font-bold text-blue-500">{card.value}</p>
                <p className="text-sm text-slate-500">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
        <hr className="text-slate-500 w-full mt-10" />
        {/* ORDERS COMPONENT */}
        <Orders />
      </div>
    </main>
  );
};

export default AdminMainPage;
