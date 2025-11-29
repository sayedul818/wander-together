import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TravelPlansProvider } from "@/contexts/TravelPlansContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import TravelPlans from "./pages/TravelPlans";
import AddTravelPlan from "./pages/AddTravelPlan";
import TravelPlanDetails from "./pages/TravelPlanDetails";
import Profile from "./pages/Profile";
import Pricing from "./pages/Pricing";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPlans from "./pages/admin/AdminPlans";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TravelPlansProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/travel-plans" element={<TravelPlans />} />
              <Route path="/travel-plans/add" element={<AddTravelPlan />} />
              <Route path="/travel-plans/:id" element={<TravelPlanDetails />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/plans" element={<AdminPlans />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TravelPlansProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
