import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let ready = false;

/* ───────── Seed data types ───────── */

type SeedUser = { username: string; password: string; fullName: string; email: string };

type SeedMovie = {
  title: string;
  description: string | null;
  genre: string;
  duration: number;
  poster: string | null;
  rating: number;
  releaseDate: string;
};

type SeedTheater = { name: string; address: string; totalSeats: number };

type SeedShowtime = {
  movieTitle: string;
  theaterName: string;
  showDate: string;
  showTime: string;
  price: number;
};

/* ───────── Seed data ───────── */

const usersSeed: SeedUser[] = [
  { username: 'admin', password: '123456', fullName: 'Admin', email: 'admin@movie.local' },
  { username: 'user1', password: '123456', fullName: 'Nguyen Van A', email: 'vana@movie.local' },
];

const moviesSeed: SeedMovie[] = [
  {
    title: 'Avengers: Endgame',
    description: 'Các siêu anh hùng tập hợp lần cuối để đảo ngược hành động của Thanos và khôi phục vũ trụ.',
    genre: 'Action',
    duration: 181,
    poster: 'https://picsum.photos/seed/avengers/400/600',
    rating: 8.4,
    releaseDate: '2019-04-26',
  },
  {
    title: 'Spirited Away',
    description: 'Cô bé Chihiro lạc vào thế giới linh hồn và phải tìm cách giải cứu bố mẹ.',
    genre: 'Animation',
    duration: 125,
    poster: 'https://picsum.photos/seed/spirited/400/600',
    rating: 8.6,
    releaseDate: '2001-07-20',
  },
  {
    title: 'Parasite',
    description: 'Gia đình nghèo Kim dần thâm nhập vào gia đình giàu Park, dẫn đến kết cục bất ngờ.',
    genre: 'Thriller',
    duration: 132,
    poster: 'https://picsum.photos/seed/parasite/400/600',
    rating: 8.5,
    releaseDate: '2019-05-30',
  },
  {
    title: 'Interstellar',
    description: 'Nhóm phi hành gia du hành qua lỗ sâu để tìm hành tinh mới cho nhân loại.',
    genre: 'Sci-Fi',
    duration: 169,
    poster: 'https://picsum.photos/seed/interstellar/400/600',
    rating: 8.7,
    releaseDate: '2014-11-07',
  },
  {
    title: 'The Conjuring',
    description: 'Hai nhà ngoại cảm Ed và Lorraine Warren điều tra vụ ám ảnh kinh hoàng tại nông trại Perron.',
    genre: 'Horror',
    duration: 112,
    poster: 'https://picsum.photos/seed/conjuring/400/600',
    rating: 7.5,
    releaseDate: '2013-07-19',
  },
  {
    title: 'Your Name',
    description: 'Hai thiếu niên Taki và Mitsuha hoán đổi cơ thể và dần phát hiện mối liên hệ kỳ bí.',
    genre: 'Animation',
    duration: 106,
    poster: 'https://picsum.photos/seed/yourname/400/600',
    rating: 8.4,
    releaseDate: '2016-08-26',
  },
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides liên minh với người Fremen để giành lại quê hương và đối đầu kẻ thù.',
    genre: 'Sci-Fi',
    duration: 166,
    poster: 'https://picsum.photos/seed/dune2/400/600',
    rating: 8.8,
    releaseDate: '2024-03-01',
  },
  {
    title: 'Joker',
    description: 'Arthur Fleck, một diễn viên hài thất bại, dần trượt vào vòng xoáy điên loạn tại Gotham.',
    genre: 'Drama',
    duration: 122,
    poster: 'https://picsum.photos/seed/joker/400/600',
    rating: 8.4,
    releaseDate: '2019-10-04',
  },
];

const theatersSeed: SeedTheater[] = [
  { name: 'CGV Vincom Center', address: '72 Lê Thánh Tôn, Q.1, TP.HCM', totalSeats: 120 },
  { name: 'Lotte Cinema Nowzone', address: '235 Nguyễn Văn Cừ, Q.5, TP.HCM', totalSeats: 100 },
  { name: 'Galaxy Nguyễn Du', address: '116 Nguyễn Du, Q.1, TP.HCM', totalSeats: 80 },
  { name: 'BHD Star Bitexco', address: '2 Hải Triều, Q.1, TP.HCM', totalSeats: 150 },
];

const showtimesSeed: SeedShowtime[] = [
  // Avengers
  { movieTitle: 'Avengers: Endgame', theaterName: 'CGV Vincom Center', showDate: '2026-03-28', showTime: '09:00', price: 90000 },
  { movieTitle: 'Avengers: Endgame', theaterName: 'CGV Vincom Center', showDate: '2026-03-28', showTime: '14:00', price: 110000 },
  { movieTitle: 'Avengers: Endgame', theaterName: 'Lotte Cinema Nowzone', showDate: '2026-03-28', showTime: '19:00', price: 120000 },
  // Spirited Away
  { movieTitle: 'Spirited Away', theaterName: 'Galaxy Nguyễn Du', showDate: '2026-03-28', showTime: '10:00', price: 80000 },
  { movieTitle: 'Spirited Away', theaterName: 'Galaxy Nguyễn Du', showDate: '2026-03-29', showTime: '15:00', price: 90000 },
  // Parasite
  { movieTitle: 'Parasite', theaterName: 'BHD Star Bitexco', showDate: '2026-03-28', showTime: '11:00', price: 95000 },
  { movieTitle: 'Parasite', theaterName: 'CGV Vincom Center', showDate: '2026-03-29', showTime: '20:00', price: 130000 },
  // Interstellar
  { movieTitle: 'Interstellar', theaterName: 'BHD Star Bitexco', showDate: '2026-03-29', showTime: '18:30', price: 120000 },
  { movieTitle: 'Interstellar', theaterName: 'Lotte Cinema Nowzone', showDate: '2026-03-30', showTime: '21:00', price: 110000 },
  // The Conjuring
  { movieTitle: 'The Conjuring', theaterName: 'Lotte Cinema Nowzone', showDate: '2026-03-28', showTime: '22:00', price: 100000 },
  // Your Name
  { movieTitle: 'Your Name', theaterName: 'Galaxy Nguyễn Du', showDate: '2026-03-29', showTime: '10:30', price: 85000 },
  { movieTitle: 'Your Name', theaterName: 'CGV Vincom Center', showDate: '2026-03-30', showTime: '16:00', price: 95000 },
  // Dune: Part Two
  { movieTitle: 'Dune: Part Two', theaterName: 'BHD Star Bitexco', showDate: '2026-03-30', showTime: '14:00', price: 140000 },
  { movieTitle: 'Dune: Part Two', theaterName: 'CGV Vincom Center', showDate: '2026-03-30', showTime: '19:30', price: 150000 },
  // Joker
  { movieTitle: 'Joker', theaterName: 'Galaxy Nguyễn Du', showDate: '2026-03-28', showTime: '20:30', price: 100000 },
  { movieTitle: 'Joker', theaterName: 'Lotte Cinema Nowzone', showDate: '2026-03-29', showTime: '13:00', price: 90000 },
];

/* ───────── Init ───────── */

export async function initDatabase(): Promise<void> {
  if (ready) return;

  db = await SQLite.openDatabaseAsync('movie_ticket.db');

  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      fullName TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      genre TEXT NOT NULL,
      duration INTEGER NOT NULL,
      poster TEXT,
      rating REAL NOT NULL DEFAULT 0,
      releaseDate TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS theaters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      totalSeats INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS showtimes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movieId INTEGER NOT NULL,
      theaterId INTEGER NOT NULL,
      showDate TEXT NOT NULL,
      showTime TEXT NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (movieId) REFERENCES movies(id),
      FOREIGN KEY (theaterId) REFERENCES theaters(id)
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      showtimeId INTEGER NOT NULL,
      seatNumber TEXT NOT NULL,
      bookingTime TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (showtimeId) REFERENCES showtimes(id),
      UNIQUE(showtimeId, seatNumber)
    );
  `);

  await seedIfEmpty();
  ready = true;
}

/* ───────── Query helpers ───────── */

export async function executeQuery<T = unknown>(sql: string, params: (string | number | null)[] = []): Promise<T[]> {
  if (!db) throw new Error('Database not initialized');
  return db.getAllAsync<T>(sql, params);
}

export async function executeRun(sql: string, params: (string | number | null)[] = []) {
  if (!db) throw new Error('Database not initialized');
  return db.runAsync(sql, params);
}

/* ───────── Seed ───────── */

async function seedIfEmpty() {
  // Users
  const usersCount = await executeQuery<{ count: number }>('SELECT COUNT(*) as count FROM users');
  if ((usersCount[0]?.count ?? 0) === 0) {
    for (const u of usersSeed) {
      await executeRun(
        'INSERT INTO users (username, password, fullName, email, createdAt) VALUES (?, ?, ?, ?, ?)',
        [u.username, u.password, u.fullName, u.email, new Date().toISOString()]
      );
    }
  }

  // Movies
  const moviesCount = await executeQuery<{ count: number }>('SELECT COUNT(*) as count FROM movies');
  if ((moviesCount[0]?.count ?? 0) === 0) {
    for (const m of moviesSeed) {
      await executeRun(
        'INSERT INTO movies (title, description, genre, duration, poster, rating, releaseDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [m.title, m.description, m.genre, m.duration, m.poster, m.rating, m.releaseDate]
      );
    }
  }

  // Theaters
  const theatersCount = await executeQuery<{ count: number }>('SELECT COUNT(*) as count FROM theaters');
  if ((theatersCount[0]?.count ?? 0) === 0) {
    for (const t of theatersSeed) {
      await executeRun(
        'INSERT INTO theaters (name, address, totalSeats) VALUES (?, ?, ?)',
        [t.name, t.address, t.totalSeats]
      );
    }
  }

  // Showtimes
  const showtimesCount = await executeQuery<{ count: number }>('SELECT COUNT(*) as count FROM showtimes');
  if ((showtimesCount[0]?.count ?? 0) === 0) {
    for (const s of showtimesSeed) {
      const movie = await executeQuery<{ id: number }>('SELECT id FROM movies WHERE title = ? LIMIT 1', [s.movieTitle]);
      const theater = await executeQuery<{ id: number }>('SELECT id FROM theaters WHERE name = ? LIMIT 1', [s.theaterName]);
      if (!movie[0] || !theater[0]) continue;
      await executeRun(
        'INSERT INTO showtimes (movieId, theaterId, showDate, showTime, price) VALUES (?, ?, ?, ?, ?)',
        [movie[0].id, theater[0].id, s.showDate, s.showTime, s.price]
      );
    }
  }
}
