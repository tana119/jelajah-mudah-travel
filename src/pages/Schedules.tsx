
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { mockSchedules } from "@/data/mockData";
import { TravelSchedule } from "@/types";

const Schedules = () => {
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [filteredSchedules, setFilteredSchedules] = useState<TravelSchedule[]>(mockSchedules);

  // Get unique destinations for select filter
  const destinations = Array.from(new Set(mockSchedules.map(s => s.destination.split(" - ")[1])));

  // Filter schedules based on input
  const handleFilter = () => {
    const filtered = mockSchedules.filter((schedule) => {
      const matchesDestination = destination 
        ? schedule.destination.includes(destination) 
        : true;
      
      const matchesDate = date 
        ? schedule.departureDate === date 
        : true;
      
      return matchesDestination && matchesDate;
    });
    
    setFilteredSchedules(filtered);
  };

  // Reset filters
  const handleReset = () => {
    setDestination("");
    setDate("");
    setFilteredSchedules(mockSchedules);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Jadwal Keberangkatan</h1>
        
        {/* Filter Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Cari Jadwal Travel</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Tujuan</label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tujuan" />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((dest) => (
                    <SelectItem key={dest} value={dest}>
                      {dest}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium">Tanggal</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex items-end gap-2">
              <Button className="flex-1" onClick={handleFilter}>Cari</Button>
              <Button variant="outline" onClick={handleReset}>Reset</Button>
            </div>
          </div>
        </div>
        
        {/* Schedules List */}
        <div className="space-y-4">
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((schedule) => (
              <Card key={schedule.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
                    <div>
                      <h3 className="font-bold text-lg">{schedule.destination}</h3>
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
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Kapasitas</p>
                      <p className="font-semibold">
                        {schedule.capacity} kursi
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Kursi Tersedia</p>
                      <p className={`font-semibold ${schedule.remainingSeats === 0 ? 'text-red-500' : ''}`}>
                        {schedule.remainingSeats} kursi
                      </p>
                    </div>
                    
                    <div className="flex flex-col justify-between">
                      <p className="text-2xl font-bold text-brand-600 mb-4">
                        Rp {schedule.price.toLocaleString('id-ID')}
                      </p>
                      <div className="flex justify-end">
                        {schedule.remainingSeats > 0 ? (
                          <Link to={`/booking/${schedule.id}`}>
                            <Button>Pesan Sekarang</Button>
                          </Link>
                        ) : (
                          <Button variant="outline" disabled>Tiket Habis</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium mb-2">Tidak Ada Jadwal Ditemukan</h3>
              <p className="text-gray-500 mb-4">
                Maaf, tidak ada jadwal yang sesuai dengan kriteria pencarian Anda. Silakan coba kriteria lain.
              </p>
              <Button variant="outline" onClick={handleReset}>
                Reset Pencarian
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Schedules;
