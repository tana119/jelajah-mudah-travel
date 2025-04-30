
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Layout from "@/components/layout/Layout";
import { mockSchedules } from "@/data/mockData";
import { TravelSchedule } from "@/types";

const bookingSchema = z.object({
  passengerCount: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num > 0;
  }, {
    message: "Jumlah penumpang harus minimal 1",
  }),
  name: z.string().min(3, "Nama minimal 3 karakter"),
  idNumber: z.string().min(5, "Nomor identitas minimal 5 karakter"),
  phone: z.string().min(10, "Nomor telepon minimal 10 karakter"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const BookingForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<TravelSchedule | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      passengerCount: "1",
      name: user?.name || "",
      idNumber: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (id) {
      const foundSchedule = mockSchedules.find(s => s.id === id);
      if (foundSchedule) {
        setSchedule(foundSchedule);
        const initialPrice = foundSchedule.price;
        setTotalPrice(initialPrice);
      } else {
        // Schedule not found, redirect to schedules page
        toast({
          title: "Jadwal tidak ditemukan",
          description: "Jadwal yang Anda cari tidak tersedia",
          variant: "destructive",
        });
        navigate("/schedules");
      }
    }
  }, [id, navigate, toast]);

  // Update price when passenger count changes
  const updatePrice = (count: string) => {
    if (schedule) {
      const numPassengers = parseInt(count) || 1;
      setTotalPrice(schedule.price * numPassengers);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!user) {
      toast({
        title: "Login diperlukan",
        description: "Silahkan login terlebih dahulu untuk melakukan pemesanan",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!schedule) {
      toast({
        title: "Jadwal tidak ditemukan",
        description: "Terjadi kesalahan dalam pemrosesan jadwal",
        variant: "destructive",
      });
      return;
    }

    const passengerCount = parseInt(data.passengerCount);
    if (passengerCount > schedule.remainingSeats) {
      toast({
        title: "Kursi tidak cukup",
        description: `Hanya tersedia ${schedule.remainingSeats} kursi`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create booking data
      const bookingData = {
        scheduleId: schedule.id,
        userId: user.id,
        userName: data.name,
        userEmail: user.email,
        passengerCount,
        totalPrice,
        paymentStatus: "pending",
        bookingDate: new Date().toISOString(),
      };
      
      // Store in localStorage to simulate database
      const bookings = JSON.parse(localStorage.getItem("jm_bookings") || "[]");
      const newBooking = {
        id: Date.now().toString(),
        ...bookingData,
      };
      bookings.push(newBooking);
      localStorage.setItem("jm_bookings", JSON.stringify(bookings));
      
      // Update remaining seats
      const updatedSchedules = mockSchedules.map(s => {
        if (s.id === schedule.id) {
          return {
            ...s,
            remainingSeats: s.remainingSeats - passengerCount,
          };
        }
        return s;
      });
      localStorage.setItem("jm_schedules", JSON.stringify(updatedSchedules));
      
      toast({
        title: "Pemesanan berhasil!",
        description: "Silahkan lanjutkan ke pembayaran",
      });
      
      // Navigate to payment confirmation page
      navigate(`/payment/${newBooking.id}`);
    } catch (error) {
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal melakukan pemesanan tiket",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!schedule) {
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
        <h1 className="text-3xl font-bold mb-8">Form Pemesanan Tiket</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Detail Pemesanan</CardTitle>
                <CardDescription>
                  Silakan isi form pemesanan tiket travel dengan lengkap
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="passengerCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jumlah Penumpang</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              updatePrice(value);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih jumlah penumpang" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({
                                length: Math.min(schedule.remainingSeats, 10),
                              }).map((_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                  {i + 1} Penumpang
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="border-t border-gray-200 pt-6 mt-6">
                      <h3 className="font-medium text-lg mb-4">Data Pemesan</h3>
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Lengkap</FormLabel>
                            <FormControl>
                              <Input placeholder="Nama lengkap" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <FormField
                          control={form.control}
                          name="idNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nomor Identitas (KTP/SIM)</FormLabel>
                              <FormControl>
                                <Input placeholder="Nomor identitas" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nomor Telepon</FormLabel>
                              <FormControl>
                                <Input placeholder="Nomor telepon" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Memproses..." : "Lanjutkan ke Pembayaran"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pemesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{schedule.destination}</h3>
                  <p className="text-gray-500">
                    {new Date(schedule.departureDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-gray-500">
                    Berangkat: {schedule.departureTime} WIB
                  </p>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Harga Tiket</span>
                    <span>Rp {schedule.price.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Jumlah Penumpang</span>
                    <span>{form.watch("passengerCount") || 1}</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between font-bold">
                    <span>Total Pembayaran</span>
                    <span className="text-brand-600">
                      Rp {totalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 text-xs text-gray-500 px-6 py-4 rounded-b-lg">
                <p>
                  Dengan melanjutkan pemesanan, Anda setuju dengan syarat dan ketentuan 
                  serta kebijakan privasi Jelajah Mudah Travel.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingForm;
