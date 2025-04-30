
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AdminLayout from "@/components/admin/AdminLayout";
import { mockBookings, mockSchedules } from "@/data/mockData";
import { Booking } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    totalPassengers: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    // In a real application, we would fetch this data from an API
    // For now, we'll combine localStorage bookings with mock data
    
    // Get bookings from localStorage
    const localBookings = JSON.parse(localStorage.getItem("jm_bookings") || "[]");
    
    // Combine with mock bookings
    const allBookings = [...localBookings, ...mockBookings];
    
    setBookings(allBookings);
    
    // Calculate stats
    const confirmed = allBookings.filter(b => b.paymentStatus === "confirmed").length;
    const pending = allBookings.filter(b => b.paymentStatus === "pending").length;
    const revenue = allBookings
      .filter(b => b.paymentStatus === "confirmed")
      .reduce((sum, booking) => sum + booking.totalPrice, 0);
    const passengers = allBookings
      .filter(b => b.paymentStatus === "confirmed")
      .reduce((sum, booking) => sum + booking.passengerCount, 0);
    
    setStats({
      totalBookings: allBookings.length,
      confirmedBookings: confirmed,
      pendingBookings: pending,
      totalRevenue: revenue,
      totalPassengers: passengers,
    });
    
    // Prepare chart data - passenger count by destination
    const destinationMap = new Map();
    allBookings.forEach(booking => {
      const schedule = mockSchedules.find(s => s.id === booking.scheduleId);
      if (schedule) {
        const destination = schedule.destination;
        if (destinationMap.has(destination)) {
          destinationMap.set(
            destination, 
            destinationMap.get(destination) + booking.passengerCount
          );
        } else {
          destinationMap.set(destination, booking.passengerCount);
        }
      }
    });
    
    const chartDataArray = Array.from(destinationMap).map(([name, value]) => ({
      name,
      passengers: value,
    }));
    
    setChartData(chartDataArray);
    
  }, []);
  
  // Get recent bookings - latest 5
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
    .slice(0, 5);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Pemesanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalBookings}</div>
              <p className="text-sm text-gray-500 mt-1">
                Terkonfirmasi: {stats.confirmedBookings}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Pemesanan Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingBookings}</div>
              <p className="text-sm text-gray-500 mt-1">
                Menunggu pembayaran
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Pendapatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                Rp {stats.totalRevenue.toLocaleString('id-ID')}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Dari pemesanan terkonfirmasi
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Penumpang
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalPassengers}</div>
              <p className="text-sm text-gray-500 mt-1">
                Dari pemesanan terkonfirmasi
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts and Recent Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Passenger Chart */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Jumlah Penumpang per Destinasi</CardTitle>
              <CardDescription>
                Distribusi penumpang berdasarkan tujuan perjalanan
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 50,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="passengers" fill="#3285ff" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Recent Bookings */}
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pemesanan Terbaru</CardTitle>
                <CardDescription>
                  Daftar 5 pemesanan terbaru
                </CardDescription>
              </div>
              <Link to="/admin/bookings">
                <Button variant="outline" size="sm">
                  Lihat Semua
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking) => {
                    const schedule = mockSchedules.find(s => s.id === booking.scheduleId);
                    return (
                      <div key={booking.id} className="border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between">
                          <p className="font-medium">{booking.userName}</p>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            booking.paymentStatus === "confirmed" 
                              ? "bg-green-100 text-green-800" 
                              : booking.paymentStatus === "cancelled" 
                              ? "bg-red-100 text-red-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {booking.paymentStatus === "confirmed" 
                              ? "Terkonfirmasi" 
                              : booking.paymentStatus === "cancelled" 
                              ? "Dibatalkan" 
                              : "Pending"}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">
                          {schedule?.destination || "Tujuan tidak tersedia"}
                        </p>
                        <div className="flex justify-between mt-1 text-sm">
                          <span className="text-gray-500">
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </span>
                          <span className="font-medium">
                            Rp {booking.totalPrice.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Belum ada pemesanan
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/admin/schedules">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>Kelola Jadwal</CardTitle>
                <CardDescription>
                  Tambah, edit, atau hapus jadwal travel
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full">Kelola Jadwal</Button>
              </CardFooter>
            </Card>
          </Link>
          
          <Link to="/admin/bookings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>Daftar Pemesanan</CardTitle>
                <CardDescription>
                  Lihat semua pemesanan dari pelanggan
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full" variant="outline">Lihat Pemesanan</Button>
              </CardFooter>
            </Card>
          </Link>
          
          <Link to="/admin/reports">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>Laporan</CardTitle>
                <CardDescription>
                  Lihat laporan penumpang per jadwal travel
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full" variant="outline">Akses Laporan</Button>
              </CardFooter>
            </Card>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
