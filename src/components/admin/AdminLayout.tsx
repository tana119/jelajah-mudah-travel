
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect non-admin users
  React.useEffect(() => {
    if (user && user.role !== "admin") {
      toast({
        title: "Akses Ditolak",
        description: "Anda tidak memiliki akses ke halaman admin",
        variant: "destructive",
      });
      navigate("/");
    } else if (!user) {
      toast({
        title: "Login Diperlukan",
        description: "Silahkan login terlebih dahulu",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [user, navigate, toast]);

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-brand-500 text-white p-2 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-xl text-gray-800">Admin Panel</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 mr-2">
              Halo, <span className="font-medium">{user.name}</span>
            </span>
            <Link to="/">
              <Button variant="outline" size="sm">
                Website Utama
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="bg-white w-64 shadow-md hidden md:block">
          <div className="p-4 space-y-2">
            <Link to="/admin" className="block py-2 px-4 rounded-md hover:bg-brand-50 hover:text-brand-600">
              Dashboard
            </Link>
            <Link to="/admin/schedules" className="block py-2 px-4 rounded-md hover:bg-brand-50 hover:text-brand-600">
              Kelola Jadwal
            </Link>
            <Link to="/admin/bookings" className="block py-2 px-4 rounded-md hover:bg-brand-50 hover:text-brand-600">
              Daftar Pemesanan
            </Link>
            <Link to="/admin/reports" className="block py-2 px-4 rounded-md hover:bg-brand-50 hover:text-brand-600">
              Laporan
            </Link>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} Jelajah Mudah Travel - Admin Panel
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;
