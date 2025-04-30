
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AdminLayout from "@/components/admin/AdminLayout";
import { mockSchedules } from "@/data/mockData";
import { TravelSchedule } from "@/types";

const scheduleSchema = z.object({
  destination: z.string().min(5, "Tujuan minimal 5 karakter"),
  departureDate: z.string().min(1, "Tanggal keberangkatan harus diisi"),
  departureTime: z.string().min(1, "Waktu keberangkatan harus diisi"),
  capacity: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num > 0;
  }, {
    message: "Kapasitas harus angka positif",
  }),
  price: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num > 0;
  }, {
    message: "Harga harus angka positif",
  }),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

const AdminSchedules = () => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<TravelSchedule[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentScheduleId, setCurrentScheduleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      destination: "",
      departureDate: "",
      departureTime: "",
      capacity: "",
      price: "",
    },
  });

  useEffect(() => {
    // Load schedules from localStorage if exists, otherwise use mock data
    const storedSchedules = localStorage.getItem("jm_schedules");
    if (storedSchedules) {
      setSchedules(JSON.parse(storedSchedules));
    } else {
      setSchedules(mockSchedules);
    }
  }, []);

  const handleSaveSchedule = async (data: ScheduleFormData) => {
    setIsLoading(true);
    
    try {
      // Convert form data to schedule object
      const scheduleData: TravelSchedule = {
        id: isEditing && currentScheduleId ? currentScheduleId : Date.now().toString(),
        destination: data.destination,
        departureDate: data.departureDate,
        departureTime: data.departureTime,
        capacity: parseInt(data.capacity),
        remainingSeats: isEditing && currentScheduleId 
          ? schedules.find(s => s.id === currentScheduleId)?.remainingSeats || parseInt(data.capacity)
          : parseInt(data.capacity),
        price: parseInt(data.price),
        createdAt: isEditing && currentScheduleId 
          ? schedules.find(s => s.id === currentScheduleId)?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
      };
      
      // Update or add the schedule
      let updatedSchedules: TravelSchedule[];
      if (isEditing && currentScheduleId) {
        updatedSchedules = schedules.map(s => 
          s.id === currentScheduleId ? scheduleData : s
        );
        toast({
          title: "Jadwal berhasil diperbarui",
          description: `Jadwal ${scheduleData.destination} telah diperbarui`,
        });
      } else {
        updatedSchedules = [...schedules, scheduleData];
        toast({
          title: "Jadwal berhasil ditambahkan",
          description: `Jadwal ${scheduleData.destination} telah ditambahkan`,
        });
      }
      
      // Save to state and localStorage
      setSchedules(updatedSchedules);
      localStorage.setItem("jm_schedules", JSON.stringify(updatedSchedules));
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      resetForm();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSchedule = (schedule: TravelSchedule) => {
    setIsEditing(true);
    setCurrentScheduleId(schedule.id);
    
    form.reset({
      destination: schedule.destination,
      departureDate: schedule.departureDate,
      departureTime: schedule.departureTime,
      capacity: schedule.capacity.toString(),
      price: schedule.price.toString(),
    });
    
    setIsDialogOpen(true);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
      const updatedSchedules = schedules.filter(s => s.id !== scheduleId);
      setSchedules(updatedSchedules);
      localStorage.setItem("jm_schedules", JSON.stringify(updatedSchedules));
      
      toast({
        title: "Jadwal berhasil dihapus",
        description: "Jadwal travel telah dihapus dari sistem",
      });
    }
  };

  const resetForm = () => {
    form.reset({
      destination: "",
      departureDate: "",
      departureTime: "",
      capacity: "",
      price: "",
    });
    setIsEditing(false);
    setCurrentScheduleId(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Kelola Jadwal Travel</h1>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>Tambah Jadwal Baru</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit Jadwal Travel" : "Tambah Jadwal Travel"}
                </DialogTitle>
                <DialogDescription>
                  {isEditing 
                    ? "Perbarui detail jadwal travel di bawah ini."
                    : "Tambahkan jadwal travel baru dengan mengisi form berikut."
                  }
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSaveSchedule)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tujuan</FormLabel>
                        <FormControl>
                          <Input placeholder="Jakarta - Bandung" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="departureDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="departureTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Waktu</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kapasitas</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              placeholder="10" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Harga (Rp)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1000" 
                              step="1000" 
                              placeholder="120000" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <DialogFooter className="pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading 
                        ? "Menyimpan..." 
                        : isEditing 
                          ? "Perbarui Jadwal" 
                          : "Simpan Jadwal"
                      }
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Daftar Jadwal Travel</CardTitle>
            <CardDescription>
              Kelola semua jadwal keberangkatan travel yang tersedia
            </CardDescription>
          </CardHeader>
          <CardContent>
            {schedules.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tujuan</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Kapasitas</TableHead>
                      <TableHead>Tersedia</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead className="text-right">Tindakan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">{schedule.destination}</TableCell>
                        <TableCell>
                          {new Date(schedule.departureDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>{schedule.departureTime}</TableCell>
                        <TableCell>{schedule.capacity}</TableCell>
                        <TableCell>{schedule.remainingSeats}</TableCell>
                        <TableCell>Rp {schedule.price.toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditSchedule(schedule)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteSchedule(schedule.id)}
                            >
                              Hapus
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada jadwal travel tersedia.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Tambahkan Jadwal Pertama
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSchedules;
