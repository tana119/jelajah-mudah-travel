
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import Layout from "@/components/layout/Layout";
import { mockBookings, mockSchedules } from "@/data/mockData";
import { Booking, TravelSchedule } from "@/types";

const BookingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [schedule, setSchedule] = useState<TravelSchedule | null>(null);
  
  useEffect(() => {
    if (id) {
      // First check localStorage for custom bookings
      const localBookings = JSON.parse(localStorage.getItem("jm_bookings") || "[]");
      let foundBooking = localBookings.find((b: Booking) => b.id === id);
      
      // If not found in localStorage, check mock data
      if (!foundBooking) {
        foundBooking = mockBookings.find((b) => b.id === id);
      }

      if (foundBooking) {
        setBooking(foundBooking);

        // Find associated schedule
        const foundSchedule = mockSchedules.find((s) => s.id === foundBooking.scheduleId);
        if (foundSchedule) {
          setSchedule(foundSchedule);
        }
      } else {
        toast({
          title: "Pemesanan tidak ditemukan",
          description: "Detail pemesanan yang Anda cari tidak tersedia",
          variant: "destructive",
        });
        navigate("/bookings");
      }
    }
  }, [id, navigate, toast]);

  const handlePrintTicket = () => {
    window.print();
  };

  if (!booking || !schedule) {
    return (
      <Layout>
        <div className="container mx-auto py-12 text-center">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Detail Tiket</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket Details */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader className="border-b pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>E-Tiket Travel</CardTitle>
                    <CardDescription>
                      Nomor Pemesanan: #{booking.id}
                    </CardDescription>
                  </div>
                  <div className="print:hidden">
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
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-2xl font-bold text-brand-600">{schedule.destination}</h3>
                    <p className="text-gray-500">
                      {new Date(schedule.departureDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })} - {schedule.departureTime} WIB
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Total Pembayaran</p>
                    <p className="text-2xl font-bold text-brand-600">
                      Rp {booking.totalPrice.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="border-t border-b border-gray-200 py-4">
                  <h4 className="font-medium mb-4">Informasi Penumpang</h4>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium pl-0">Nama Pemesan</TableCell>
                        <TableCell>{booking.userName}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium pl-0">Email</TableCell>
                        <TableCell>{booking.userEmail}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium pl-0">Jumlah Penumpang</TableCell>
                        <TableCell>{booking.passengerCount} orang</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h4 className="font-medium mb-2">Catatan Penting:</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Harap tiba di lokasi keberangkatan 30 menit sebelum jadwal.</li>
                    <li>• Penumpang harus membawa kartu identitas yang valid.</li>
                    <li>• Bagasi maksimal 10kg per orang.</li>
                    <li>• E-tiket ini harus ditunjukkan saat check-in.</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex-col items-start">
                <div className="text-center w-full text-gray-500 text-sm">
                  <p>PT Jelajah Mudah Travel &copy; 2025</p>
                  <p>Jl. Pahlawan No. 123, Jakarta Pusat, Indonesia</p>
                  <p>Customer Service: 021-1234-5678</p>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          {/* Actions */}
          <div className="print:hidden">
            <Card>
              <CardHeader>
                <CardTitle>Tindakan</CardTitle>
                <CardDescription>
                  Cetak tiket atau kembali ke daftar pemesanan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full"
                  onClick={handlePrintTicket}
                >
                  Cetak Tiket
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/bookings")}
                >
                  Kembali ke Pemesanan
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingDetail;
