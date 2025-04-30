
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NavBar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-brand-500 text-white p-2 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-xl text-gray-800">Jelajah Mudah</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-600 hover:text-brand-600 font-medium">Beranda</Link>
          <Link to="/schedules" className="text-gray-600 hover:text-brand-600 font-medium">Jadwal</Link>
          {user && (
            <Link to="/bookings" className="text-gray-600 hover:text-brand-600 font-medium">Pemesanan Saya</Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" className="text-gray-600 hover:text-brand-600 font-medium">Dashboard Admin</Link>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="hidden md:inline text-sm text-gray-600">
                Halo, <span className="font-medium">{user.name}</span>
                {user.role === "admin" && (
                  <span className="ml-1 text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-full">
                    Admin
                  </span>
                )}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Masuk
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Daftar</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
