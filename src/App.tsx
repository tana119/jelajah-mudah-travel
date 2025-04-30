
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Schedules from "./pages/Schedules";
import BookingForm from "./pages/BookingForm";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import UserBookings from "./pages/UserBookings";
import BookingDetail from "./pages/BookingDetail";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSchedules from "./pages/admin/AdminSchedules";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminReports from "./pages/admin/AdminReports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/schedules" element={<Schedules />} />
            
            {/* User Routes */}
            <Route path="/booking/:id" element={<BookingForm />} />
            <Route path="/payment/:id" element={<PaymentConfirmation />} />
            <Route path="/bookings" element={<UserBookings />} />
            <Route path="/booking-detail/:id" element={<BookingDetail />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/schedules" element={<AdminSchedules />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            
            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
