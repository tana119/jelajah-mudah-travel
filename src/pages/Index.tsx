
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { mockSchedules } from "@/data/mockData";

const Index = () => {
  // Get 3 featured schedules
  const featuredSchedules = mockSchedules.slice(0, 3);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-brand-600 text-white overflow-hidden hero-pattern">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Perjalanan Nyaman dan Terpercaya
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Bepergian menjadi lebih mudah dengan layanan travel kami. Nikmati
              pengalaman perjalanan yang aman, nyaman, dan terjangkau.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/schedules">
                <Button className="bg-white text-brand-600 hover:bg-gray-100 hover:text-brand-700">
                  Lihat Jadwal
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  Daftar Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Mengapa Memilih Kami?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Keamanan Terjamin</h3>
              <p className="text-gray-600">
                Keselamatan penumpang adalah prioritas utama kami. Semua armada dan pengemudi kami telah melalui pemeriksaan ketat.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Tepat Waktu</h3>
              <p className="text-gray-600">
                Jadwal keberangkatan yang selalu tepat waktu. Kami menghargai waktu Anda dan berkomitmen untuk menjaga ketepatan jadwal.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Harga Terjangkau</h3>
              <p className="text-gray-600">
                Nikmati perjalanan nyaman dengan harga yang ramah di kantong. Berbagai pilihan paket sesuai dengan kebutuhan Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Schedules */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Jadwal Populer</h2>
            <Link to="/schedules" className="text-brand-600 hover:text-brand-700">
              Lihat Semua &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredSchedules.map((schedule) => (
              <Card key={schedule.id} className="overflow-hidden">
                <div className="h-40 bg-gray-200 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-4">
                    <div>
                      <h3 className="text-white font-bold text-xl">{schedule.destination}</h3>
                      <p className="text-white/80">
                        {new Date(schedule.departureDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })} - {schedule.departureTime}
                      </p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-bold text-brand-600">
                      Rp {schedule.price.toLocaleString('id-ID')}
                    </div>
                    <div className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {schedule.remainingSeats} kursi tersisa
                    </div>
                  </div>
                  <Link to={`/booking/${schedule.id}`}>
                    <Button className="w-full">Pesan Sekarang</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-accent-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Siap untuk Memulai Perjalanan?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-600">
            Jangan tunggu lagi. Dapatkan pengalaman perjalanan terbaik dengan 
            Jelajah Mudah Travel. Pesan tiket Anda sekarang!
          </p>
          <Link to="/schedules">
            <Button size="lg" className="px-8">
              Lihat Jadwal Travel
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
