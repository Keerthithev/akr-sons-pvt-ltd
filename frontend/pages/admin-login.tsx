import React, { useState } from "react";
import { DialogContent, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Button } from "../components/ui/button";

export default function AdminLogin() {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    if (!adminEmail || !adminPassword) {
      setAdminError("Please enter both email and password.");
      return;
    }
    setAdminLoading(true);
    try {
      const res = await fetch("http://localhost:5050/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        setAdminError(data.message || "Login failed");
        setAdminLoading(false);
        return;
      }
      const data = await res.json();
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminName", data.name);
      localStorage.setItem("adminEmail", data.email);
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setAdminError("Unable to connect to server. Please try again later.");
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-4">
      <div className="glass-card max-w-xs w-full p-6 rounded-xl shadow-lg">
        <h2 className="text-center text-2xl font-bold gradient-text mb-2">Admin Login</h2>
        <p className="text-center mb-6 text-gray-700 text-base">Enter your admin credentials to access the dashboard.</p>
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Email or Username"
            className="w-full border rounded px-3 py-2 text-sm"
            value={adminEmail}
            onChange={e => setAdminEmail(e.target.value)}
            autoFocus
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded px-3 py-2 text-sm"
            value={adminPassword}
            onChange={e => setAdminPassword(e.target.value)}
            required
          />
          {adminError && <div className="text-xs text-red-500 text-center">{adminError}</div>}
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded py-2 text-base font-medium disabled:opacity-60" disabled={adminLoading}>
            {adminLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
} 