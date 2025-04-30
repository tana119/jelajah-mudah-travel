
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { mockBookings, mockSchedules } from "@/data/mockData";
import { Booking, TravelSchedule } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ScheduleReportData {
  id: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  capacity: number;
  passengerCount: number;
  occupancyRate: number;
}

interface PassengerDetail {
  id: string;
  name: string;
  email: string;
  bookingId: string;
  bookingDate: string;
  paymentStatus: "pending" | "confirmed" | "cancelled";
}

const AdminReports = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [schedules, setSchedules] = useState<TravelSchedule[]>([]);
  const [reportData, setReportData] = useState<ScheduleReportData[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [passengerDetails, setPassengerDetails] = useState<PassengerDetail[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pieChartData, setPieChartData] = useState<any[]>([]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  useEffect(() => {
    // Load data from localStorage if exists, otherwise use mock data
    const storedSchedules = localStorage.getItem("jm_schedules");
    if (storedSchedules) {
      setSchedules(JSON.parse(storedSchedules));
    } else {
      setSchedules(mockSchedules);
    }
    
    // Combine localStorage bookings with mock data
    const localBookings = JSON.parse(localStorage.getItem("jm_bookings") || "[]");
    const allBookings = [...localBookings, ...mockBookings];
    setBookings(allBookings);

    // Generate report data based on schedules and bookings
    const report = generateReportData(storedSchedules ? JSON.parse(storedSchedules) : mockSchedules, allBookings);
    setReportData(report);
    
    // Prepare chart data
    const chartData = report
      .filter(item => item.passengerCount > 0)
      .map(item => ({
        name: item.destination,
        value: item.passengerCount
      }));
      
    setPieChartData(chartData);
  }, []);

  const generateReportData = (schedules: TravelSchedule[], bookings: Booking[]): ScheduleReportData[] => {
    return schedules.map(schedule => {
      // Find all confirmed bookings for this schedule
      const scheduleBookings = bookings.filter(
        b => b.scheduleId === schedule.id && b.paymentStatus === "confirmed"
      );
      
      // Calculate total passenger count
      const passengerCount = scheduleBookings.reduce(
        (sum, booking) => sum + booking.passengerCount, 0
      );
      
      // Calculate occupancy rate
      const occupancyRate = schedule.capacity > 0 
        ? (passengerCount / schedule.capacity) * 100 
        : 0;
        
      return {
        id: schedule.id,
        destination: schedule.destination,
        departureDate: schedule.departureDate,
        departureTime: schedule.departureTime,
        capacity: schedule.capacity,
        passengerCount,
        occupancyRate,
      };
    });
  };

  const handleViewPassengers = (scheduleId: string) => {
    // Find all bookings for this schedule
    const scheduleBookings = bookings.filter(b => b.scheduleId === scheduleId);
    
    // Transform to passenger details
    const passengers: PassengerDetail[] = [];
    scheduleBookings.forEach(booking => {
      // In a real app, we would have actual passenger details
      // Here we just use the booking details
      passengers.push({
        id: booking.id,
        name: booking.userName,
        email: booking.userEmail,
        bookingId: booking.id,
        bookingDate: booking.bookingDate,
        paymentStatus: booking.paymentStatus,
      });
    });
    
    setSelectedSchedule(scheduleId);
    setPassengerDetails(passengers);
    setIsDialogOpen(true);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Laporan Penumpang</h1>
          <div className="print:hidden">
            <Button onClick={handlePrintReport}>Cetak Laporan</Button>
          </div>
        </div>
        
        {/* Passenger Distribution Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle>Distribusi Penumpang</CardTitle>
              <CardDescription>
                Persentase penumpang berdasarkan tujuan travel
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} penumpang`, 'Jumlah']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle>Tingkat Kapasitas Terisi</CardTitle>
              <CardDescription>
                Perbandingan kapasitas dan jumlah penumpang untuk setiap jadwal
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reportData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 50,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="destination" 
                    angle={-45} 
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="passengerCount" name="Penumpang" fill="#3285ff" />
                  <Bar dataKey="capacity" name="Kapasitas" fill="#fc6c1c" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        {/* Report Table */}
        <Card>
          <CardHeader>
            <CardTitle>Laporan Jumlah Penumpang Per Travel</CardTitle>
            <CardDescription>
              Daftar jadwal travel dengan informasi jumlah penumpang
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tujuan</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Kapasitas</TableHead>
                    <TableHead>Jumlah Penumpang</TableHead>
                    <TableHead>Tingkat Isi</TableHead>
                    <TableHead className="text-right print:hidden">Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.destination}</TableCell>
                      <TableCell>
                        {new Date(item.departureDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>{item.departureTime}</TableCell>
                      <TableCell>{item.capacity}</TableCell>
                      <TableCell>{item.passengerCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className={`h-2.5 rounded-full ${
                                item.occupancyRate >= 80 
                                  ? 'bg-green-500' 
                                  : item.occupancyRate >= 50 
                                  ? 'bg-yellow-500' 
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${item.occupancyRate}%` }}
                            ></div>
                          </div>
                          <span>{Math.round(item.occupancyRate)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right print:hidden">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewPassengers(item.id)}
                        >
                          Lihat Penumpang
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        {/* Passenger Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Daftar Penumpang</DialogTitle>
              <DialogDescription>
                {selectedSchedule && reportData.find(r => r.id === selectedSchedule)?.destination}
              </DialogDescription>
            </DialogHeader>
            
            <div className="overflow-y-auto max-h-[400px]">
              {passengerDetails.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>ID Pemesanan</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {passengerDetails.map((passenger) => (
                      <TableRow key={passenger.id}>
                        <TableCell className="font-medium">{passenger.name}</TableCell>
                        <TableCell>{passenger.email}</TableCell>
                        <TableCell>#{passenger.bookingId}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            passenger.paymentStatus === "confirmed" 
                              ? "bg-green-100 text-green-800" 
                              : passenger.paymentStatus === "cancelled" 
                              ? "bg-red-100 text-red-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {passenger.paymentStatus === "confirmed" 
                              ? "Terkonfirmasi" 
                              : passenger.paymentStatus === "cancelled" 
                              ? "Dibatalkan" 
                              : "Pending"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Belum ada penumpang untuk jadwal ini.</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Tutup
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
