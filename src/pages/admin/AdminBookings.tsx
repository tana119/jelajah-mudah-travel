
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import { mockBookings, mockSchedules, mockUsers } from "@/data/mockData";
import { Booking, TravelSchedule } from "@/types";

const AdminBookings = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [schedules, setSchedules] = useState<TravelSchedule[]>(mockSchedules);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    // Load schedules and bookings
    const storedSchedules = localStorage.getItem("jm_schedules");
    if (storedSchedules) {
      setSchedules(JSON.parse(storedSchedules));
    }
    
    // Combine localStorage bookings with mock data
    const localBookings = JSON.parse(localStorage.getItem("jm_bookings") || "[]");
    const allBookings = [...localBookings, ...mockBookings];
    
    // Enhance bookings with schedule data
    const enhancedBookings = allBookings.map((booking: Booking) => {
      const schedule = mockSchedules.find(s => s.id === booking.scheduleId);
      return {
        ...booking,
        schedule,
      };
    });
    
    setBookings(enhancedBookings);
    setFilteredBookings(enhancedBookings);
  }, []);
  
  // Apply filters
  useEffect(() => {
    let filtered = [...bookings];
    
    if (selectedStatus) {
      filtered = filtered.filter(b => b.paymentStatus === selectedStatus);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.userName.toLowerCase().includes(term) ||
        b.userEmail.toLowerCase().includes(term) ||
        b.schedule?.destination.toLowerCase().includes(term)
      );
    }
    
    setFilteredBookings(filtered);
  }, [selectedStatus, searchTerm, bookings]);

  const handleStatusChange = (booking: Booking, newStatus: "pending" | "confirmed" | "cancelled") => {
    // Update booking status
    const updatedBookings = bookings.map(b => {
      if (b.id === booking.id) {
        return {
          ...b,
          paymentStatus: newStatus,
        };
      }
      return b;
    });
    
    // Update in localStorage
    const localBookings = JSON.parse(localStorage.getItem("jm_bookings") || "[]");
    const updatedLocalBookings = localBookings.map((b: Booking) => {
      if (b.id === booking.id) {
        return {
          ...b,
          paymentStatus: newStatus,
        };
      }
      return b;
    });
    localStorage.setItem("jm_bookings", JSON.stringify(updatedLocalBookings));
    
    setBookings(updatedBookings);
    toast({
      title: "Status berhasil diperbarui",
      description: `Status pemesanan ${booking.id} diubah menjadi ${newStatus}`,
    });
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Daftar Pemesanan</h1>
        </div>
        
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Cari</label>
                <Input
                  placeholder="Cari nama, email, atau tujuan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Status</SelectItem>
                    <SelectItem value="pending">Menunggu Pembayaran</SelectItem>
                    <SelectItem value="confirmed">Terkonfirmasi</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedStatus("");
                  }}
                >
                  Reset Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pemesanan</CardTitle>
            <CardDescription>
              Total {filteredBookings.length} pemesanan ditemukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tujuan</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Penumpang</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Tindakan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">#{booking.id}</TableCell>
                        <TableCell>{booking.userName}</TableCell>
                        <TableCell>{booking.userEmail}</TableCell>
                        <TableCell>{booking.schedule?.destination || "N/A"}</TableCell>
                        <TableCell>
                          {booking.schedule?.departureDate ? 
                            new Date(booking.schedule.departureDate).toLocaleDateString('id-ID') : 
                            "N/A"
                          }
                        </TableCell>
                        <TableCell>{booking.passengerCount}</TableCell>
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
                              : "Pending"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetails(booking)}
                            >
                              Detail
                            </Button>
                            
                            {booking.paymentStatus !== "confirmed" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-green-500 hover:text-green-700"
                                onClick={() => handleStatusChange(booking, "confirmed")}
                              >
                                Konfirmasi
                              </Button>
                            )}
                            
                            {booking.paymentStatus !== "cancelled" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleStatusChange(booking, "cancelled")}
                              >
                                Batalkan
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Tidak ada pemesanan yang ditemukan.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Booking Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detail Pemesanan #{selectedBooking?.id}</DialogTitle>
              <DialogDescription>
                Informasi lengkap tentang pemesanan ini
              </DialogDescription>
            </DialogHeader>
            
            {selectedBooking && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-500">Nama Pemesan</h3>
                    <p>{selectedBooking.userName}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Email</h3>
                    <p>{selectedBooking.userEmail}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Tujuan</h3>
                    <p>{selectedBooking.schedule?.destination || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Tanggal & Waktu</h3>
                    <p>
                      {selectedBooking.schedule?.departureDate ? 
                        `${new Date(selectedBooking.schedule.departureDate).toLocaleDateString('id-ID')} - ${selectedBooking.schedule.departureTime}` : 
                        "N/A"
                      }
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Jumlah Penumpang</h3>
                    <p>{selectedBooking.passengerCount} orang</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Total Pembayaran</h3>
                    <p className="font-bold text-brand-600">
                      Rp {selectedBooking.totalPrice.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Tanggal Pemesanan</h3>
                    <p>
                      {new Date(selectedBooking.bookingDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Status</h3>
                    <p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedBooking.paymentStatus === "confirmed" 
                          ? "bg-green-100 text-green-800" 
                          : selectedBooking.paymentStatus === "cancelled" 
                          ? "bg-red-100 text-red-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {selectedBooking.paymentStatus === "confirmed" 
                          ? "Terkonfirmasi" 
                          : selectedBooking.paymentStatus === "cancelled" 
                          ? "Dibatalkan" 
                          : "Pending"}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4 flex justify-end space-x-2">
                  {selectedBooking.paymentStatus !== "confirmed" && (
                    <Button
                      variant="outline"
                      className="text-green-500 hover:text-green-700"
                      onClick={() => {
                        handleStatusChange(selectedBooking, "confirmed");
                        setIsDialogOpen(false);
                      }}
                    >
                      Konfirmasi
                    </Button>
                  )}
                  
                  {selectedBooking.paymentStatus !== "cancelled" && (
                    <Button 
                      variant="outline"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => {
                        handleStatusChange(selectedBooking, "cancelled");
                        setIsDialogOpen(false);
                      }}
                    >
                      Batalkan
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminBookings;
