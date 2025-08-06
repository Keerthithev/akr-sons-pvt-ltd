import React, { useState } from "react";
import { DialogContent, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminLogin() {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is already logged in
  React.useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    const token = localStorage.getItem('adminToken');
    
    if (isAdmin && token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    if (!adminEmail || !adminPassword) {
      setAdminError("Please enter both email and password.");
      return;
    }
    setAdminLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
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
      
      // Navigate to dashboard or the intended destination
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setAdminError("Unable to connect to server. Please try again later.");
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-2 sm:px-4">
      <div className="glass-card max-w-xs w-full p-4 sm:p-6 rounded-xl shadow-lg">
        <h2 className="text-center text-2xl sm:text-3xl font-bold gradient-text mb-2">Admin Login</h2>
        <p className="text-center mb-6 text-gray-700 text-base sm:text-lg">Enter your admin credentials to access the dashboard.</p>
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Email or Username"
            className="w-full border rounded px-3 py-2 text-sm sm:text-base"
            value={adminEmail}
            onChange={e => setAdminEmail(e.target.value)}
            autoFocus
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded px-3 py-2 text-sm sm:text-base"
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