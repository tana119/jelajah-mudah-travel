
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Layout from "@/components/layout/Layout";
import { mockBookings, mockSchedules } from "@/data/mockData";
import { Booking, TravelSchedule } from "@/types";

const PaymentConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [schedule, setSchedule] = useState<TravelSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // In a real application, we would fetch this data from an API
    // For now, we'll use the mock data
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

  const handleConfirmPayment = async () => {
    if (!booking || !schedule) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update booking status in localStorage
      const bookings = JSON.parse(localStorage.getItem("jm_bookings") || "[]");
      const updatedBookings = bookings.map((b: Booking) => {
        if (b.id === booking.id) {
          return {
            ...b,
            paymentStatus: "confirmed",
          };
        }
        return b;
      });
      localStorage.setItem("jm_bookings", JSON.stringify(updatedBookings));
      
      toast({
        title: "Pembayaran berhasil!",
        description: "Tiket Anda telah dikonfirmasi",
      });
      
      // Navigate to booking detail page
      navigate(`/booking-detail/${booking.id}`);
    } catch (error) {
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal mengonfirmasi pembayaran",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintInvoice = () => {
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
        <h1 className="text-3xl font-bold mb-8">Konfirmasi Pembayaran</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Details */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Detail Pemesanan</CardTitle>
                <CardDescription>
                  Nomor Pemesanan: #{booking.id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Tujuan</TableCell>
                      <TableCell>{schedule.destination}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Tanggal Keberangkatan</TableCell>
                      <TableCell>
                        {new Date(schedule.departureDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Waktu Keberangkatan</TableCell>
                      <TableCell>{schedule.departureTime} WIB</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Nama Pemesan</TableCell>
                      <TableCell>{booking.userName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Email</TableCell>
                      <TableCell>{booking.userEmail}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Jumlah Penumpang</TableCell>
                      <TableCell>{booking.passengerCount} orang</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Status Pembayaran</TableCell>
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
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {booking.paymentStatus === "pending" && (
              <Card>
                <CardHeader>
                  <CardTitle>Instruksi Pembayaran</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Transfer Bank:</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="font-medium">Bank BCA:</span> 1234567890 a/n PT Jelajah Mudah Travel
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="font-medium">Bank Mandiri:</span> 0987654321 a/n PT Jelajah Mudah Travel
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="font-medium">Bank BNI:</span> 1122334455 a/n PT Jelajah Mudah Travel
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Setelah melakukan pembayaran, mohon klik tombol "Konfirmasi Pembayaran" untuk memproses tiket Anda.
                      Pembayaran akan otomatis diverifikasi dalam waktu 1x24 jam.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Payment Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between mb-2">
                    <span>Harga Tiket</span>
                    <span>Rp {(booking.totalPrice / booking.passengerCount).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Jumlah Penumpang</span>
                    <span>{booking.passengerCount}</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total Pembayaran</span>
                    <span className="text-brand-600">
                      Rp {booking.totalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                {booking.paymentStatus === "pending" ? (
                  <Button
                    className="w-full"
                    onClick={handleConfirmPayment}
                    disabled={isLoading}
                  >
                    {isLoading ? "Memproses..." : "Konfirmasi Pembayaran"}
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={handlePrintInvoice}
                  >
                    Cetak Invoice
                  </Button>
                )}

                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate("/bookings")}
                >
                  Kembali ke Pemesanan
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentConfirmation;
