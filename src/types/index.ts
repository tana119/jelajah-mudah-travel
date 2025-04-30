
export type UserRole = "admin" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface TravelSchedule {
  id: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  capacity: number;
  remainingSeats: number;
  price: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  scheduleId: string;
  userId: string;
  userName: string;
  userEmail: string;
  bookingDate: string;
  passengerCount: number;
  totalPrice: number;
  paymentStatus: "pending" | "confirmed" | "cancelled";
  schedule?: TravelSchedule;
}

export interface BookingFormData {
  scheduleId: string;
  passengerCount: number;
  passengerDetails: {
    name: string;
    idNumber: string;
    phone: string;
  };
}
