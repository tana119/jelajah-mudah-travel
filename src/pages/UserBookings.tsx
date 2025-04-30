
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Layout from "@/components/layout/Layout";
import { mockBookings, mockSchedules } from "@/data/mockData";
import { Booking, TravelSchedule } from "@/types";

const UserBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  useEffect(() => {
    if (user) {
      // In a real application, we would fetch this data from an API
      // For now, we'll combine localStorage bookings with mock data
      
      // Get bookings from localStorage
      const localBookings = JSON.parse(localStorage.getItem("jm_bookings") || "[]");
      
      // Combine with mock bookings
      const allBookings = [...localBookings, ...mockBookings];
      
      // Filter bookings for current user
      const userBookings = allBookings.filter((b: Booking) => b.userId === user.id);
      
      // Add schedule data to each booking
      const enhancedBookings = userBookings.map((booking: Booking) => {
        const schedule = mockSchedules.find(s => s.id === booking.scheduleId);
        return {
          ...booking,
          schedule,
        };
      });
      
      setBookings(enhancedBookings);
    }
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Akses Ditolak</h2>
          <p className="mb-6">Silahkan login terlebih dahulu untuk melihat riwayat pemesanan Anda.</p>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Riwayat Pemesanan</h1>
        
        {bookings.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Daftar Pemesanan</CardTitle>
              <CardDescription>
                Berikut adalah daftar pemesanan tiket travel yang pernah Anda lakukan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Pemesanan</TableHead>
                      <TableHead>Tujuan</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Jumlah Penumpang</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">#{booking.id}</TableCell>
                        <TableCell>{booking.schedule?.destination || "N/A"}</TableCell>
                        <TableCell>
                          {booking.schedule?.departureDate ? new Date(booking.schedule.departureDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          }) : "N/A"}
                        </TableCell>
                        <TableCell>{booking.passengerCount} orang</TableCell>
                        <TableCell>Rp {booking.totalPrice.toLocaleString('id-ID')}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                              : "Menunggu Pembayaran"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {booking.paymentStatus === "pending" ? (
                            <Link to={`/payment/${booking.id}`}>
                              <Button variant="outline" size="sm">
                                Bayar
                              </Button>
                            </Link>
                          ) : (
                            <Link to={`/booking-detail/${booking.id}`}>
                              <Button variant="outline" size="sm">
                                Detail
                              </Button>
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-medium mb-2">Belum Ada Pemesanan</h2>
            <p className="text-gray-500 mb-6">
              Anda belum pernah melakukan pemesanan tiket travel.
            </p>
            <Link to="/schedules">
              <Button>Lihat Jadwal Travel</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserBookings;
