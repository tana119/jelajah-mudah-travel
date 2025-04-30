import React, { createContext, useState, useContext, useEffect } from "react";
import { User, UserRole } from "@/types";
import { mockUsers } from "@/data/mockData";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  isLoading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("jm_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Load registered users from localStorage
    const storedRegisteredUsers = localStorage.getItem("jm_registered_users");
    if (storedRegisteredUsers) {
      setRegisteredUsers(JSON.parse(storedRegisteredUsers));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Check in mock users first
      const foundMockUser = mockUsers.find((u) => u.email === email);
      
      // Then check in registered users
      const foundRegisteredUser = registeredUsers.find((u) => u.email === email);
      
      if (foundMockUser && password === "password") {
        setUser(foundMockUser);
        localStorage.setItem("jm_user", JSON.stringify(foundMockUser));
        toast({
          title: "Login berhasil!",
          description: `Selamat datang kembali, ${foundMockUser.name}!`,
        });
        return true;
      } else if (foundRegisteredUser && password === foundRegisteredUser.password) {
        // For registered users, we check actual password
        setUser(foundRegisteredUser);
        localStorage.setItem("jm_user", JSON.stringify(foundRegisteredUser));
        toast({
          title: "Login berhasil!",
          description: `Selamat datang kembali, ${foundRegisteredUser.name}!`,
        });
        return true;
      } else {
        toast({
          title: "Login gagal!",
          description: "Email atau password salah.",
          variant: "destructive",
        });
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string, 
    email: string, 
    password: string, 
    role: UserRole = "customer"
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Check if user with this email already exists in mock data
      const existsInMockData = mockUsers.some((u) => u.email === email);
      
      // Check if user with this email already exists in registered users
      const existsInRegisteredUsers = registeredUsers.some((u) => u.email === email);
      
      if (existsInMockData || existsInRegisteredUsers) {
        toast({
          title: "Pendaftaran gagal!",
          description: "Email sudah terdaftar.",
          variant: "destructive",
        });
        return false;
      }
      
      // Validate admin registration
      if (role === "admin" && 
          !email.endsWith("@jelajahmudah.com") && 
          !email.endsWith("@gmail.com")) {
        toast({
          title: "Pendaftaran Admin gagal!",
          description: "Pendaftaran admin hanya bisa menggunakan email @jelajahmudah.com atau @gmail.com",
          variant: "destructive",
        });
        return false;
      }
      
      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role,
        password,
        registrationType: role === "admin" ? "admin" : "regular",
      };
      
      // Add to registered users
      const updatedUsers = [...registeredUsers, newUser];
      setRegisteredUsers(updatedUsers);
      
      // Store in localStorage
      localStorage.setItem("jm_registered_users", JSON.stringify(updatedUsers));
      
      toast({
        title: "Pendaftaran berhasil!",
        description: "Silakan masuk dengan akun baru Anda.",
      });
      
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("jm_user");
    toast({
      title: "Logout berhasil!",
      description: "Sampai jumpa kembali!",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
