import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import Index from "./pages/Index";
import AkrSonsBikeStore from "./pages/AkrSonsBikeStore";
import NotFound from "./pages/NotFound";

import AdminDashboard from "./pages/AdminDashboard";
import VehicleDetails from "./pages/akr-sons-bike-store/VehicleDetails";
import PreBook from "./pages/PreBook";
import Terms from "./pages/terms";

import AdminLogin from "./pages/admin-login";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AkrSonsBikeStore />} />
          <Route path="/akr-sons-bike-store" element={<AkrSonsBikeStore />} />
          <Route path="/akr-sons-bike-store/:id" element={<VehicleDetails />} />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/prebook" element={<PreBook />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
