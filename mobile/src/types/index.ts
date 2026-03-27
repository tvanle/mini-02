export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface Movie {
  id: number;
  title: string;
  description: string | null;
  genre: string;
  duration: number; // phút
  poster: string | null;
  rating: number; // 0-10
  releaseDate: string;
}

export interface Theater {
  id: number;
  name: string;
  address: string;
  totalSeats: number;
}

export interface Showtime {
  id: number;
  movieId: number;
  theaterId: number;
  showDate: string; // YYYY-MM-DD
  showTime: string; // HH:mm
  price: number;
  // joined fields
  movieTitle?: string;
  moviePoster?: string;
  movieDuration?: number;
  movieGenre?: string;
  theaterName?: string;
  theaterAddress?: string;
}

export interface Ticket {
  id: number;
  userId: number;
  showtimeId: number;
  seatNumber: string;
  bookingTime: string;
  // joined fields
  movieTitle?: string;
  moviePoster?: string;
  theaterName?: string;
  showDate?: string;
  showTime?: string;
  price?: number;
}

export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  Register: undefined;
  MovieDetail: { movieId: number };
  TheaterDetail: { theaterId: number };
  ShowtimeList: { movieId?: number; theaterId?: number } | undefined;
  SeatSelection: { showtimeId: number };
  Payment: { showtimeId: number; seats: string[] };
  TicketDetail: { ticketId: number };
  MyTickets: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Movies: undefined;
  Showtimes: undefined;
  Profile: undefined;
};
