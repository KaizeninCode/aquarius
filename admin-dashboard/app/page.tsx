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
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { db, auth } from "@/firebaseConfig";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [tab, setTab] = useState<Tab>("needs_attention");
  const [selectedDriver, setSelectedDriver] = useState<Record<string, string>>(
    {},
  );
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  // auth check
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => setAuthed(!!user));
  }, []);

  // load all non cancelled orders, live
  useEffect(() => {
    if (!authed) return;
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) =>
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)))
    );
  }, [authed]);
  console.log('Orders: ', orders)

  // load all drivers, live
  useEffect(() => {
    if (!authed) return;
    const q = query(collection(db, "users"), where("role", "==", "driver"));

    return onSnapshot(q, (snap) =>
      setDrivers(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Driver)),
    );
  }, [authed]);

  const handleLogin = async () => {
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.log(error);
      setLoginError("Invalid email or password.");
    }
  };

  const handleConfirm = async (orderId: string) => {
    setUpdating((prev) => ({ ...prev, [orderId]: true }));
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "confirmed",
        updatedAt: serverTimestamp(),
      });
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleAssign = async (order: Order) => {
    const driverId = selectedDriver[order.id];
    if (!driverId) return;
    const driver = drivers.find((d) => d.id == driverId);
    if (!driver) return;

    setUpdating((prev) => ({ ...prev, [order.id]: true }));

    try {
      await updateDoc(doc(db, "orders", order.id), {
        status: "assigned",
        driverId,
        driverName: driver.name,
        updatedAt: serverTimestamp(),
      });
    } finally {
      setUpdating((prev) => ({ ...prev, [order.id]: false }));
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!window.confirm("Cancel this order?")) return;
    setUpdating((prev) => ({ ...prev, [orderId]: true }));
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "cancelled",
        updatedAt: serverTimestamp(),
      });
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Filter orders by tab
  const needsAttention = orders.filter(
    (o) => o.status === "placed" || o.status === "confirmed",
  );
  const active = orders.filter(
    (o) => o.status === "assigned" || o.status === "out_for_delivery",
  );
  const history = orders.filter(
    (o) => o.status === "delivered" || o.status === "cancelled",
  );

  const tabOrders: Record<Tab, Order[]> = {
    needs_attention: needsAttention,
    active,
    history,
  };

  const TAB_LABELS: Record<Tab, string> = {
    needs_attention: `Needs Attention (${needsAttention.length})`,
    active: `Active (${active.length})`,
    history: "History",
  };

  // login
  if (!authed)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
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
    );

  // Main Dashboard
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-950">Aquarius Admin Dashboard</h2>
          <button
            className="text-white hover:bg-red-700 text-sm font-medium transition-colors rounded-xl shadow-sm shadow-slate-300 px-3 py-2 bg-red-500"
            onClick={() => signOut(auth)}
          >
            Log Out
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6">
          {(["needs_attention", "active", "history"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                tab === t
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* ORDER LIST */}
        <div className="flex flex-col gap-4 shadow-slate-300 rounded-xl">
          {tabOrders[tab].length === 0 && (
            <p className="text-slate-400 text-center my-12">No orders here.</p>
          )}

          {tabOrders[tab].map((order) => {
            const itemSummary = order.items
              .map((i) => `${i.name} x ${i.quantity}`)
              .join(", ");

            const date =
              order.createdAt &&
              new Date(order.createdAt.seconds * 1000).toLocaleString("en-KE", {day: 'numeric', month: 'long', year:'numeric'});
            const busy = updating[order.id];

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
              >
                {/* CARD HEADER */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="block font-semibold text-base text-black">
                      {order.customerName}
                    </span>
                    <span className="block text-slate-500 text-sm">
                      {order.customerPhone}
                    </span>
                  </div>
                  {/*  */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-lg ${STATUS_CLASSES[order.status]}`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                    <span className="text-slate-400 text-xs">{date}</span>
                  </div>
                </div>

                {/* ITEMS + TOTAL */}
                <p className="text-slate-500 text-sm mb-1">{itemSummary}</p>
                <p className="font-bold text-sm mb-3 text-black">
                  KES {order.totalAmount}
                </p>

                {/* Address */}
                <div className="bg-slate-50 rounded-xl px-3 py-2 mb-3">
                  <span className="font-medium text-sm text-slate-800">
                    📍 {order.deliveryAddress.label}
                  </span>
                  {order.deliveryAddress.notes && (
                    <span className="text-slate-500 text-sm">
                      {" · "}
                      {order.deliveryAddress.notes}
                    </span>
                  )}

                  {/*  */}
                  <a
                    href={`https://www.google.com/maps?q=${order.deliveryAddress.lat},${order.deliveryAddress.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-blue-500 text-xs mt-1 hover:underline"
                  >
                    View on map ↗
                  </a>
                </div>

                {/* ACTIONS - PLACED */}
                {order.status === "placed" && (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                      onClick={() => handleConfirm(order.id)}
                      disabled={busy}
                    >
                      {busy ? "Confirming..." : "Confirm Order"}
                    </button>
                    <button
                      className="bg-white hover:bg-red-50 disabled:opacity-50 text-red-500 border border-red-400 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                      onClick={() => handleCancel(order.id)}
                      disabled={busy}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* ACTIONS - CONFIRMED, ASSIGN DRIVER */}
                {order.status === "confirmed" && (
                  <div className="flex gap-2 flex-wrap items-center">
                    <select
                      className="border border-slate-700 text-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedDriver[order.id] ?? ""}
                      onChange={(e) =>
                        setSelectedDriver((prev) => ({
                          ...prev,
                          [order.id]: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select a driver...</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <button
                      className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                      onClick={() => handleAssign(order)}
                      disabled={busy || !selectedDriver[order.id]}
                    >
                      {busy ? "Assigning..." : "Assign Driver →"}
                    </button>
                    <button
                      className="bg-white hover:bg-red-50 disabled:opacity-50 text-red-500 border border-red-400 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                      onClick={() => handleCancel(order.id)}
                      disabled={busy}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* DRIVER INFO - ASSIGNED OR IN PROGRESS */}
                {(order.status === "assigned" ||
                  order.status === "out_for_delivery") && (
                  <p className="text-blue-500 text-sm font-medium mt-1">
                    🚚 {order.driverName ?? "Driver assigned"}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminMainPage;
