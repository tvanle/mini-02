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
  { username: 'admin', password: '123456', fullName: 'Admin Hệ Thống', email: 'admin@movie.local' },
  { username: 'vana', password: '123456', fullName: 'Nguyễn Văn A', email: 'vana@movie.local' },
  { username: 'thib', password: '123456', fullName: 'Trần Thị B', email: 'thib@movie.local' },
  { username: 'vanc', password: '123456', fullName: 'Lê Văn C', email: 'vanc@movie.local' },
  { username: 'thid', password: '123456', fullName: 'Phạm Thị D', email: 'thid@movie.local' },
  { username: 'mine', password: '123456', fullName: 'Hoàng Minh E', email: 'mine@movie.local' },
];

const moviesSeed: SeedMovie[] = [
  // ── Action ──
  {
    title: 'Avengers: Endgame',
    description: 'Các siêu anh hùng tập hợp lần cuối để đảo ngược hành động của Thanos và khôi phục trật tự vũ trụ. Cuộc chiến kéo dài 3 giờ đầy cảm xúc với pha du hành thời gian ngoạn mục.',
    genre: 'Action',
    duration: 181,
    poster: 'https://picsum.photos/seed/avengers/400/600',
    rating: 8.4,
    releaseDate: '2019-04-26',
  },
  {
    title: 'John Wick: Chapter 4',
    description: 'John Wick tiếp tục hành trình trả thù, đối đầu với High Table trên khắp thế giới từ Osaka đến Paris. Những pha hành động mãn nhãn với vũ khí và võ thuật đỉnh cao.',
    genre: 'Action',
    duration: 169,
    poster: 'https://picsum.photos/seed/johnwick4/400/600',
    rating: 7.7,
    releaseDate: '2023-03-24',
  },
  {
    title: 'Top Gun: Maverick',
    description: 'Pete "Maverick" Mitchell trở lại huấn luyện phi công trẻ cho nhiệm vụ nguy hiểm nhất sự nghiệp. Những cảnh bay chiến đấu thực tế cực kỳ hoành tráng.',
    genre: 'Action',
    duration: 130,
    poster: 'https://picsum.photos/seed/topgun/400/600',
    rating: 8.3,
    releaseDate: '2022-05-27',
  },
  {
    title: 'Mad Max: Fury Road',
    description: 'Max Rockatansky và Furiosa dẫn đầu cuộc rượt đuổi xuyên sa mạc hậu tận thế để giải thoát những người phụ nữ khỏi bạo chúa Immortan Joe.',
    genre: 'Action',
    duration: 120,
    poster: 'https://picsum.photos/seed/madmax/400/600',
    rating: 8.1,
    releaseDate: '2015-05-15',
  },
  // ── Animation ──
  {
    title: 'Spirited Away',
    description: 'Cô bé Chihiro lạc vào thế giới linh hồn và phải làm việc tại nhà tắm thần linh để tìm cách giải cứu bố mẹ đã bị biến thành heo. Kiệt tác hoạt hình của Miyazaki.',
    genre: 'Animation',
    duration: 125,
    poster: 'https://picsum.photos/seed/spirited/400/600',
    rating: 8.6,
    releaseDate: '2001-07-20',
  },
  {
    title: 'Your Name',
    description: 'Hai thiếu niên Taki ở Tokyo và Mitsuha ở vùng quê bỗng hoán đổi cơ thể trong giấc mơ, dần phát hiện mối liên hệ kỳ bí vượt không gian và thời gian.',
    genre: 'Animation',
    duration: 106,
    poster: 'https://picsum.photos/seed/yourname/400/600',
    rating: 8.4,
    releaseDate: '2016-08-26',
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    description: 'Miles Morales du hành qua đa vũ trụ, gặp gỡ hàng trăm Spider-People và đối mặt với mâu thuẫn giữa trách nhiệm siêu anh hùng và số phận cá nhân.',
    genre: 'Animation',
    duration: 140,
    poster: 'https://picsum.photos/seed/spiderverse/400/600',
    rating: 8.7,
    releaseDate: '2023-06-02',
  },
  {
    title: 'Suzume',
    description: 'Cô gái 17 tuổi Suzume tình cờ mở cánh cửa dẫn đến thảm họa, cùng chàng trai bí ẩn Souta hành trình khắp Nhật Bản để đóng lại những cánh cửa tai ương.',
    genre: 'Animation',
    duration: 122,
    poster: 'https://picsum.photos/seed/suzume/400/600',
    rating: 7.8,
    releaseDate: '2022-11-11',
  },
  {
    title: 'Coco',
    description: 'Cậu bé Miguel mơ trở thành nhạc sĩ, vô tình lạc vào Thế giới người chết đúng ngày lễ Día de los Muertos và khám phá bí mật gia đình qua nhiều thế hệ.',
    genre: 'Animation',
    duration: 105,
    poster: 'https://picsum.photos/seed/coco/400/600',
    rating: 8.4,
    releaseDate: '2017-11-22',
  },
  // ── Thriller ──
  {
    title: 'Parasite',
    description: 'Gia đình nghèo Kim dần thâm nhập vào gia đình giàu Park bằng các chiêu trò tinh vi, nhưng mọi thứ đổ vỡ khi bí mật kinh hoàng trong tầng hầm được hé lộ.',
    genre: 'Thriller',
    duration: 132,
    poster: 'https://picsum.photos/seed/parasite/400/600',
    rating: 8.5,
    releaseDate: '2019-05-30',
  },
  {
    title: 'Gone Girl',
    description: 'Nick Dunne trở thành nghi phạm số một khi vợ anh Amy mất tích bí ẩn. Câu chuyện lật mở nhiều tầng lừa dối trong mối quan hệ hôn nhân độc hại.',
    genre: 'Thriller',
    duration: 149,
    poster: 'https://picsum.photos/seed/gonegirl/400/600',
    rating: 8.1,
    releaseDate: '2014-10-03',
  },
  {
    title: 'Shutter Island',
    description: 'Hai cảnh sát liên bang điều tra vụ mất tích bệnh nhân trên đảo tâm thần Shutter Island. Sự thật cuối cùng làm đảo lộn mọi nhận thức.',
    genre: 'Thriller',
    duration: 138,
    poster: 'https://picsum.photos/seed/shutterisland/400/600',
    rating: 8.2,
    releaseDate: '2010-02-19',
  },
  // ── Sci-Fi ──
  {
    title: 'Interstellar',
    description: 'Nhóm phi hành gia du hành qua lỗ sâu gần sao Thổ để tìm hành tinh mới cho nhân loại đang trên bờ tuyệt chủng. Khám phá sâu sắc về thời gian, trọng lực và tình yêu.',
    genre: 'Sci-Fi',
    duration: 169,
    poster: 'https://picsum.photos/seed/interstellar/400/600',
    rating: 8.7,
    releaseDate: '2014-11-07',
  },
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides liên minh với người Fremen trên hành tinh Arrakis, nắm quyền lãnh đạo và đối đầu với gia tộc Harkonnen trong cuộc chiến tranh giành gia vị Spice.',
    genre: 'Sci-Fi',
    duration: 166,
    poster: 'https://picsum.photos/seed/dune2/400/600',
    rating: 8.8,
    releaseDate: '2024-03-01',
  },
  {
    title: 'The Matrix',
    description: 'Lập trình viên Neo phát hiện thế giới thực chỉ là mô phỏng máy tính, gia nhập cuộc kháng chiến chống lại trí tuệ nhân tạo đang nô dịch loài người.',
    genre: 'Sci-Fi',
    duration: 136,
    poster: 'https://picsum.photos/seed/matrix/400/600',
    rating: 8.7,
    releaseDate: '1999-03-31',
  },
  {
    title: 'Blade Runner 2049',
    description: 'Sĩ quan K, một replicant thế hệ mới, phát hiện bí mật có thể phá hủy trật tự xã hội và lần theo dấu vết Rick Deckard đã mất tích 30 năm.',
    genre: 'Sci-Fi',
    duration: 164,
    poster: 'https://picsum.photos/seed/bladerunner/400/600',
    rating: 8.0,
    releaseDate: '2017-10-06',
  },
  // ── Horror ──
  {
    title: 'The Conjuring',
    description: 'Hai nhà ngoại cảm Ed và Lorraine Warren điều tra vụ ám ảnh kinh hoàng tại nông trại gia đình Perron ở Rhode Island. Dựa trên sự kiện có thật.',
    genre: 'Horror',
    duration: 112,
    poster: 'https://picsum.photos/seed/conjuring/400/600',
    rating: 7.5,
    releaseDate: '2013-07-19',
  },
  {
    title: 'Get Out',
    description: 'Chris Washington đến thăm gia đình bạn gái da trắng và dần phát hiện bí mật rùng rợn ẩn sau vẻ ngoài thân thiện của họ. Phim kinh dị châm biếm xã hội xuất sắc.',
    genre: 'Horror',
    duration: 104,
    poster: 'https://picsum.photos/seed/getout/400/600',
    rating: 7.7,
    releaseDate: '2017-02-24',
  },
  {
    title: 'A Quiet Place',
    description: 'Gia đình Abbott sống trong im lặng tuyệt đối để tránh những sinh vật săn mồi bằng âm thanh. Mọi tiếng động nhỏ đều có thể dẫn đến cái chết.',
    genre: 'Horror',
    duration: 90,
    poster: 'https://picsum.photos/seed/quietplace/400/600',
    rating: 7.5,
    releaseDate: '2018-04-06',
  },
  // ── Drama ──
  {
    title: 'Joker',
    description: 'Arthur Fleck, một diễn viên hài thất bại bị xã hội ruồng bỏ, dần trượt vào vòng xoáy bạo lực và điên loạn, biến thành biểu tượng hỗn loạn tại thành phố Gotham.',
    genre: 'Drama',
    duration: 122,
    poster: 'https://picsum.photos/seed/joker/400/600',
    rating: 8.4,
    releaseDate: '2019-10-04',
  },
  {
    title: 'The Shawshank Redemption',
    description: 'Andy Dufresne, một chủ ngân hàng bị kết tội oan giết vợ, trải qua gần 20 năm trong nhà tù Shawshank. Câu chuyện về hy vọng, tình bạn và sự kiên nhẫn phi thường.',
    genre: 'Drama',
    duration: 142,
    poster: 'https://picsum.photos/seed/shawshank/400/600',
    rating: 9.3,
    releaseDate: '1994-10-14',
  },
  {
    title: 'Forrest Gump',
    description: 'Forrest Gump, chàng trai có IQ thấp nhưng trái tim thuần khiết, vô tình tham gia vào nhiều sự kiện lịch sử quan trọng của nước Mỹ suốt 3 thập kỷ.',
    genre: 'Drama',
    duration: 142,
    poster: 'https://picsum.photos/seed/forrestgump/400/600',
    rating: 8.8,
    releaseDate: '1994-07-06',
  },
  {
    title: 'Oppenheimer',
    description: 'Câu chuyện về J. Robert Oppenheimer, cha đẻ bom nguyên tử, từ quá trình phát triển vũ khí hủy diệt đến nỗi day dứt lương tâm và phiên tòa an ninh gây chấn động.',
    genre: 'Drama',
    duration: 180,
    poster: 'https://picsum.photos/seed/oppenheimer/400/600',
    rating: 8.5,
    releaseDate: '2023-07-21',
  },
  // ── Comedy ──
  {
    title: 'The Grand Budapest Hotel',
    description: 'Gustave H., quản lý huyền thoại của khách sạn Grand Budapest, cùng chàng phục vụ Moustafa vướng vào vụ trộm bức tranh và cuộc chiến thừa kế kỳ quặc.',
    genre: 'Comedy',
    duration: 99,
    poster: 'https://picsum.photos/seed/budapest/400/600',
    rating: 8.1,
    releaseDate: '2014-03-28',
  },
  {
    title: 'Kung Fu Panda 4',
    description: 'Po được chọn làm Lãnh đạo Tinh thần của Thung lũng Hòa bình nhưng phải đối mặt với phản diện mới - phù thủy tắc kè hoa Chameleon có thể biến hình thành bất kỳ ai.',
    genre: 'Comedy',
    duration: 94,
    poster: 'https://picsum.photos/seed/kungfupanda4/400/600',
    rating: 6.4,
    releaseDate: '2024-03-08',
  },
  {
    title: 'Everything Everywhere All at Once',
    description: 'Evelyn Wang, chủ tiệm giặt tầm thường, bất ngờ phải du hành đa vũ trụ để chống lại thế lực hủy diệt. Kết hợp hài hước, hành động và triết lý gia đình sâu sắc.',
    genre: 'Comedy',
    duration: 139,
    poster: 'https://picsum.photos/seed/everything/400/600',
    rating: 8.0,
    releaseDate: '2022-03-25',
  },
  // ── Romance ──
  {
    title: 'La La Land',
    description: 'Mia, cô gái mơ làm diễn viên, và Sebastian, nghệ sĩ jazz cổ điển, yêu nhau giữa Hollywood đầy cạnh tranh. Tình yêu và đam mê sự nghiệp liệu có thể song hành?',
    genre: 'Romance',
    duration: 128,
    poster: 'https://picsum.photos/seed/lalaland/400/600',
    rating: 8.0,
    releaseDate: '2016-12-09',
  },
  {
    title: 'Titanic',
    description: 'Trên chuyến tàu Titanic định mệnh năm 1912, chàng họa sĩ nghèo Jack và tiểu thư thượng lưu Rose tìm thấy tình yêu trước thảm họa chìm tàu kinh hoàng.',
    genre: 'Romance',
    duration: 195,
    poster: 'https://picsum.photos/seed/titanic/400/600',
    rating: 7.9,
    releaseDate: '1997-12-19',
  },
  {
    title: 'About Time',
    description: 'Tim Lake phát hiện đàn ông trong gia đình có khả năng du hành thời gian. Anh dùng năng lực này để tìm tình yêu, nhưng nhận ra không phép màu nào thay thế được việc sống trọn vẹn.',
    genre: 'Romance',
    duration: 123,
    poster: 'https://picsum.photos/seed/abouttime/400/600',
    rating: 7.8,
    releaseDate: '2013-09-04',
  },
];

const theatersSeed: SeedTheater[] = [
  { name: 'CGV Vincom Center', address: '72 Lê Thánh Tôn, Q.1, TP.HCM', totalSeats: 120 },
  { name: 'CGV Aeon Tân Phú', address: '30 Bờ Bao Tân Thắng, Q.Tân Phú, TP.HCM', totalSeats: 140 },
  { name: 'Lotte Cinema Nowzone', address: '235 Nguyễn Văn Cừ, Q.5, TP.HCM', totalSeats: 100 },
  { name: 'Lotte Cinema Gò Vấp', address: '242 Nguyễn Văn Lượng, Q.Gò Vấp, TP.HCM', totalSeats: 110 },
  { name: 'Galaxy Nguyễn Du', address: '116 Nguyễn Du, Q.1, TP.HCM', totalSeats: 80 },
  { name: 'Galaxy Quang Trung', address: '304 Quang Trung, Q.Gò Vấp, TP.HCM', totalSeats: 90 },
  { name: 'BHD Star Bitexco', address: '2 Hải Triều, Q.1, TP.HCM', totalSeats: 150 },
  { name: 'BHD Star Phạm Hùng', address: '2-4 Phạm Hùng, Q.8, TP.HCM', totalSeats: 130 },
  { name: 'Cinestar Hai Bà Trưng', address: '135 Hai Bà Trưng, Q.1, TP.HCM', totalSeats: 95 },
  { name: 'Mega GS Cao Thắng', address: '19 Cao Thắng, Q.3, TP.HCM', totalSeats: 105 },
];

const showtimesSeed: SeedShowtime[] = [
  // ── 28/03 ──────────────────────────────────────────
  { movieTitle: 'Avengers: Endgame', theaterName: 'CGV Vincom Center', showDate: '2026-03-28', showTime: '09:00', price: 90000 },
  { movieTitle: 'Avengers: Endgame', theaterName: 'CGV Vincom Center', showDate: '2026-03-28', showTime: '14:00', price: 110000 },
  { movieTitle: 'Avengers: Endgame', theaterName: 'Lotte Cinema Nowzone', showDate: '2026-03-28', showTime: '19:00', price: 120000 },
  { movieTitle: 'Avengers: Endgame', theaterName: 'BHD Star Bitexco', showDate: '2026-03-28', showTime: '21:00', price: 130000 },
  { movieTitle: 'John Wick: Chapter 4', theaterName: 'CGV Aeon Tân Phú', showDate: '2026-03-28', showTime: '10:00', price: 95000 },
  { movieTitle: 'John Wick: Chapter 4', theaterName: 'CGV Aeon Tân Phú', showDate: '2026-03-28', showTime: '15:30', price: 110000 },
  { movieTitle: 'John Wick: Chapter 4', theaterName: 'Mega GS Cao Thắng', showDate: '2026-03-28', showTime: '20:00', price: 120000 },
  { movieTitle: 'Spirited Away', theaterName: 'Galaxy Nguyễn Du', showDate: '2026-03-28', showTime: '10:00', price: 80000 },
  { movieTitle: 'Spirited Away', theaterName: 'Cinestar Hai Bà Trưng', showDate: '2026-03-28', showTime: '14:30', price: 85000 },
  { movieTitle: 'Spider-Man: Across the Spider-Verse', theaterName: 'CGV Vincom Center', showDate: '2026-03-28', showTime: '11:00', price: 100000 },
  { movieTitle: 'Spider-Man: Across the Spider-Verse', theaterName: 'Lotte Cinema Gò Vấp', showDate: '2026-03-28', showTime: '16:00', price: 95000 },
  { movieTitle: 'Parasite', theaterName: 'BHD Star Bitexco', showDate: '2026-03-28', showTime: '11:00', price: 95000 },
  { movieTitle: 'Parasite', theaterName: 'Galaxy Quang Trung', showDate: '2026-03-28', showTime: '19:30', price: 100000 },
  { movieTitle: 'The Conjuring', theaterName: 'Lotte Cinema Nowzone', showDate: '2026-03-28', showTime: '22:00', price: 100000 },
  { movieTitle: 'The Conjuring', theaterName: 'BHD Star Phạm Hùng', showDate: '2026-03-28', showTime: '22:30', price: 95000 },
  { movieTitle: 'Get Out', theaterName: 'Galaxy Nguyễn Du', showDate: '2026-03-28', showTime: '21:30', price: 90000 },
  { movieTitle: 'Joker', theaterName: 'Galaxy Nguyễn Du', showDate: '2026-03-28', showTime: '20:30', price: 100000 },
  { movieTitle: 'Joker', theaterName: 'Cinestar Hai Bà Trưng', showDate: '2026-03-28', showTime: '17:00', price: 90000 },
  { movieTitle: 'Oppenheimer', theaterName: 'BHD Star Bitexco', showDate: '2026-03-28', showTime: '14:00', price: 120000 },
  { movieTitle: 'Oppenheimer', theaterName: 'CGV Vincom Center', showDate: '2026-03-28', showTime: '18:00', price: 130000 },
  { movieTitle: 'La La Land', theaterName: 'Cinestar Hai Bà Trưng', showDate: '2026-03-28', showTime: '10:30', price: 80000 },
  { movieTitle: 'La La Land', theaterName: 'Galaxy Quang Trung', showDate: '2026-03-28', showTime: '15:00', price: 85000 },
  { movieTitle: 'The Grand Budapest Hotel', theaterName: 'Mega GS Cao Thắng', showDate: '2026-03-28', showTime: '11:00', price: 75000 },
  { movieTitle: 'Everything Everywhere All at Once', theaterName: 'Lotte Cinema Nowzone', showDate: '2026-03-28', showTime: '13:00', price: 95000 },
  { movieTitle: 'Everything Everywhere All at Once', theaterName: 'CGV Aeon Tân Phú', showDate: '2026-03-28', showTime: '19:00', price: 110000 },
  // ── 29/03 ──────────────────────────────────────────
  { movieTitle: 'Avengers: Endgame', theaterName: 'CGV Aeon Tân Phú', showDate: '2026-03-29', showTime: '10:00', price: 100000 },
  { movieTitle: 'Avengers: Endgame', theaterName: 'Mega GS Cao Thắng', showDate: '2026-03-29', showTime: '15:00', price: 110000 },
  { movieTitle: 'Top Gun: Maverick', theaterName: 'CGV Vincom Center', showDate: '2026-03-29', showTime: '09:30', price: 95000 },
  { movieTitle: 'Top Gun: Maverick', theaterName: 'BHD Star Bitexco', showDate: '2026-03-29', showTime: '14:00', price: 110000 },
  { movieTitle: 'Top Gun: Maverick', theaterName: 'Lotte Cinema Gò Vấp', showDate: '2026-03-29', showTime: '19:30', price: 120000 },
  { movieTitle: 'Your Name', theaterName: 'Galaxy Nguyễn Du', showDate: '2026-03-29', showTime: '10:30', price: 85000 },
  { movieTitle: 'Your Name', theaterName: 'Cinestar Hai Bà Trưng', showDate: '2026-03-29', showTime: '15:00', price: 90000 },
  { movieTitle: 'Suzume', theaterName: 'Galaxy Nguyễn Du', showDate: '2026-03-29', showTime: '13:00', price: 85000 },
  { movieTitle: 'Suzume', theaterName: 'Lotte Cinema Nowzone', showDate: '2026-03-29', showTime: '17:30', price: 95000 },
  { movieTitle: 'Coco', theaterName: 'CGV Vincom Center', showDate: '2026-03-29', showTime: '11:00', price: 80000 },
  { movieTitle: 'Coco', theaterName: 'Galaxy Quang Trung', showDate: '2026-03-29', showTime: '14:00', price: 80000 },
  { movieTitle: 'Parasite', theaterName: 'CGV Vincom Center', showDate: '2026-03-29', showTime: '20:00', price: 130000 },
  { movieTitle: 'Interstellar', theaterName: 'BHD Star Bitexco', showDate: '2026-03-29', showTime: '18:30', price: 120000 },
  { movieTitle: 'Interstellar', theaterName: 'CGV Aeon Tân Phú', showDate: '2026-03-29', showTime: '21:00', price: 130000 },
  { movieTitle: 'Gone Girl', theaterName: 'Mega GS Cao Thắng', showDate: '2026-03-29', showTime: '20:00', price: 100000 },
  { movieTitle: 'Shutter Island', theaterName: 'BHD Star Phạm Hùng', showDate: '2026-03-29', showTime: '21:00', price: 95000 },
  { movieTitle: 'A Quiet Place', theaterName: 'Lotte Cinema Nowzone', showDate: '2026-03-29', showTime: '22:00', price: 100000 },
  { movieTitle: 'The Shawshank Redemption', theaterName: 'BHD Star Bitexco', showDate: '2026-03-29', showTime: '10:00', price: 90000 },
  { movieTitle: 'The Shawshank Redemption', theaterName: 'Cinestar Hai Bà Trưng', showDate: '2026-03-29', showTime: '19:00', price: 100000 },
  { movieTitle: 'Forrest Gump', theaterName: 'Galaxy Nguyễn Du', showDate: '2026-03-29', showTime: '16:00', price: 85000 },
  { movieTitle: 'Joker', theaterName: 'Lotte Cinema Nowzone', showDate: '2026-03-29', showTime: '13:00', price: 90000 },
  { movieTitle: 'Kung Fu Panda 4', theaterName: 'CGV Vincom Center', showDate: '2026-03-29', showTime: '09:00', price: 75000 },
  { movieTitle: 'Kung Fu Panda 4', theaterName: 'Lotte Cinema Gò Vấp', showDate: '2026-03-29', showTime: '11:00', price: 75000 },
  { movieTitle: 'About Time', theaterName: 'Cinestar Hai Bà Trưng', showDate: '2026-03-29', showTime: '11:00', price: 80000 },
  { movieTitle: 'Titanic', theaterName: 'BHD Star Bitexco', showDate: '2026-03-29', showTime: '15:00', price: 110000 },
  // ── 30/03 ──────────────────────────────────────────
  { movieTitle: 'Dune: Part Two', theaterName: 'BHD Star Bitexco', showDate: '2026-03-30', showTime: '14:00', price: 140000 },
  { movieTitle: 'Dune: Part Two', theaterName: 'CGV Vincom Center', showDate: '2026-03-30', showTime: '19:30', price: 150000 },
  { movieTitle: 'Dune: Part Two', theaterName: 'Mega GS Cao Thắng', showDate: '2026-03-30', showTime: '21:00', price: 140000 },
  { movieTitle: 'Interstellar', theaterName: 'Lotte Cinema Nowzone', showDate: '2026-03-30', showTime: '21:00', price: 110000 },
  { movieTitle: 'Your Name', theaterName: 'CGV Vincom Center', showDate: '2026-03-30', showTime: '16:00', price: 95000 },
  { movieTitle: 'The Matrix', theaterName: 'CGV Aeon Tân Phú', showDate: '2026-03-30', showTime: '10:00', price: 90000 },
  { movieTitle: 'The Matrix', theaterName: 'BHD Star Phạm Hùng', showDate: '2026-03-30', showTime: '15:00', price: 95000 },
  { movieTitle: 'The Matrix', theaterName: 'Lotte Cinema Nowzone', showDate: '2026-03-30', showTime: '19:00', price: 110000 },
  { movieTitle: 'Blade Runner 2049', theaterName: 'BHD Star Bitexco', showDate: '2026-03-30', showTime: '10:00', price: 100000 },
  { movieTitle: 'Blade Runner 2049', theaterName: 'Galaxy Nguyễn Du', showDate: '2026-03-30', showTime: '18:00', price: 110000 },
  { movieTitle: 'Mad Max: Fury Road', theaterName: 'CGV Vincom Center', showDate: '2026-03-30', showTime: '11:00', price: 95000 },
  { movieTitle: 'Mad Max: Fury Road', theaterName: 'Mega GS Cao Thắng', showDate: '2026-03-30', showTime: '17:00', price: 100000 },
  { movieTitle: 'Spider-Man: Across the Spider-Verse', theaterName: 'Lotte Cinema Gò Vấp', showDate: '2026-03-30', showTime: '10:00', price: 90000 },
  { movieTitle: 'Spider-Man: Across the Spider-Verse', theaterName: 'CGV Aeon Tân Phú', showDate: '2026-03-30', showTime: '14:30', price: 100000 },
  { movieTitle: 'Coco', theaterName: 'Galaxy Quang Trung', showDate: '2026-03-30', showTime: '10:00', price: 75000 },
  { movieTitle: 'Oppenheimer', theaterName: 'BHD Star Bitexco', showDate: '2026-03-30', showTime: '17:00', price: 130000 },
  { movieTitle: 'Forrest Gump', theaterName: 'Cinestar Hai Bà Trưng', showDate: '2026-03-30', showTime: '14:00', price: 85000 },
  { movieTitle: 'The Shawshank Redemption', theaterName: 'Galaxy Nguyễn Du', showDate: '2026-03-30', showTime: '20:00', price: 100000 },
  { movieTitle: 'La La Land', theaterName: 'Cinestar Hai Bà Trưng', showDate: '2026-03-30', showTime: '11:00', price: 80000 },
  { movieTitle: 'Titanic', theaterName: 'CGV Vincom Center', showDate: '2026-03-30', showTime: '13:00', price: 100000 },
  { movieTitle: 'Everything Everywhere All at Once', theaterName: 'Lotte Cinema Nowzone', showDate: '2026-03-30', showTime: '15:30', price: 100000 },
  // ── 31/03 ──────────────────────────────────────────
  { movieTitle: 'Avengers: Endgame', theaterName: 'CGV Vincom Center', showDate: '2026-03-31', showTime: '10:00', price: 95000 },
  { movieTitle: 'Avengers: Endgame', theaterName: 'BHD Star Bitexco', showDate: '2026-03-31', showTime: '16:00', price: 115000 },
  { movieTitle: 'John Wick: Chapter 4', theaterName: 'Lotte Cinema Nowzone', showDate: '2026-03-31', showTime: '14:00', price: 110000 },
  { movieTitle: 'John Wick: Chapter 4', theaterName: 'BHD Star Phạm Hùng', showDate: '2026-03-31', showTime: '20:00', price: 120000 },
  { movieTitle: 'Top Gun: Maverick', theaterName: 'CGV Aeon Tân Phú', showDate: '2026-03-31', showTime: '11:00', price: 100000 },
  { movieTitle: 'Spirited Away', theaterName: 'Galaxy Nguyễn Du', showDate: '2026-03-31', showTime: '10:00', price: 80000 },
  { movieTitle: 'Spirited Away', theaterName: 'Galaxy Quang Trung', showDate: '2026-03-31', showTime: '14:00', price: 80000 },
  { movieTitle: 'Spider-Man: Across the Spider-Verse', theaterName: 'CGV Vincom Center', showDate: '2026-03-31', showTime: '13:00', price: 105000 },
  { movieTitle: 'Suzume', theaterName: 'Cinestar Hai Bà Trưng', showDate: '2026-03-31', showTime: '15:00', price: 90000 },
  { movieTitle: 'Parasite', theaterName: 'BHD Star Bitexco', showDate: '2026-03-31', showTime: '19:00', price: 120000 },
  { movieTitle: 'Get Out', theaterName: 'Lotte Cinema Nowzone', showDate: '2026-03-31', showTime: '21:30', price: 95000 },
  { movieTitle: 'A Quiet Place', theaterName: 'Galaxy Nguyễn Du', showDate: '2026-03-31', showTime: '22:00', price: 95000 },
  { movieTitle: 'Dune: Part Two', theaterName: 'CGV Vincom Center', showDate: '2026-03-31', showTime: '18:00', price: 145000 },
  { movieTitle: 'Dune: Part Two', theaterName: 'BHD Star Bitexco', showDate: '2026-03-31', showTime: '21:00', price: 150000 },
  { movieTitle: 'The Matrix', theaterName: 'Mega GS Cao Thắng', showDate: '2026-03-31', showTime: '19:00', price: 105000 },
  { movieTitle: 'Joker', theaterName: 'Galaxy Quang Trung', showDate: '2026-03-31', showTime: '20:00', price: 100000 },
  { movieTitle: 'Oppenheimer', theaterName: 'CGV Aeon Tân Phú', showDate: '2026-03-31', showTime: '14:30', price: 125000 },
  { movieTitle: 'La La Land', theaterName: 'Cinestar Hai Bà Trưng', showDate: '2026-03-31', showTime: '11:00', price: 80000 },
  { movieTitle: 'About Time', theaterName: 'Galaxy Nguyễn Du', showDate: '2026-03-31', showTime: '16:00', price: 85000 },
  { movieTitle: 'Kung Fu Panda 4', theaterName: 'Lotte Cinema Gò Vấp', showDate: '2026-03-31', showTime: '09:30', price: 70000 },
  { movieTitle: 'Kung Fu Panda 4', theaterName: 'CGV Vincom Center', showDate: '2026-03-31', showTime: '09:00', price: 75000 },
  // ── 01/04 ──────────────────────────────────────────
  { movieTitle: 'Avengers: Endgame', theaterName: 'Lotte Cinema Nowzone', showDate: '2026-04-01', showTime: '10:00', price: 95000 },
  { movieTitle: 'Avengers: Endgame', theaterName: 'CGV Vincom Center', showDate: '2026-04-01', showTime: '19:00', price: 125000 },
  { movieTitle: 'John Wick: Chapter 4', theaterName: 'CGV Vincom Center', showDate: '2026-04-01', showTime: '14:00', price: 115000 },
  { movieTitle: 'Top Gun: Maverick', theaterName: 'BHD Star Bitexco', showDate: '2026-04-01', showTime: '11:00', price: 105000 },
  { movieTitle: 'Top Gun: Maverick', theaterName: 'Mega GS Cao Thắng', showDate: '2026-04-01', showTime: '17:00', price: 110000 },
  { movieTitle: 'Mad Max: Fury Road', theaterName: 'CGV Aeon Tân Phú', showDate: '2026-04-01', showTime: '15:00', price: 100000 },
  { movieTitle: 'Mad Max: Fury Road', theaterName: 'BHD Star Phạm Hùng', showDate: '2026-04-01', showTime: '20:00', price: 110000 },
  { movieTitle: 'Spirited Away', theaterName: 'Cinestar Hai Bà Trưng', showDate: '2026-04-01', showTime: '10:00', price: 80000 },
  { movieTitle: 'Coco', theaterName: 'CGV Vincom Center', showDate: '2026-04-01', showTime: '09:00', price: 75000 },
  { movieTitle: 'Coco', theaterName: 'Lotte Cinema Gò Vấp', showDate: '2026-04-01', showTime: '11:00', price: 75000 },
  { movieTitle: 'Interstellar', theaterName: 'BHD Star Bitexco', showDate: '2026-04-01', showTime: '18:00', price: 125000 },
  { movieTitle: 'Dune: Part Two', theaterName: 'CGV Vincom Center', showDate: '2026-04-01', showTime: '20:30', price: 150000 },
  { movieTitle: 'Blade Runner 2049', theaterName: 'CGV Aeon Tân Phú', showDate: '2026-04-01', showTime: '20:00', price: 115000 },
  { movieTitle: 'The Shawshank Redemption', theaterName: 'Galaxy Nguyễn Du', showDate: '2026-04-01', showTime: '14:00', price: 90000 },
  { movieTitle: 'Gone Girl', theaterName: 'BHD Star Phạm Hùng', showDate: '2026-04-01', showTime: '21:00', price: 105000 },
  { movieTitle: 'Shutter Island', theaterName: 'Lotte Cinema Nowzone', showDate: '2026-04-01', showTime: '21:30', price: 100000 },
  { movieTitle: 'The Conjuring', theaterName: 'Galaxy Quang Trung', showDate: '2026-04-01', showTime: '22:00', price: 95000 },
  { movieTitle: 'Get Out', theaterName: 'Mega GS Cao Thắng', showDate: '2026-04-01', showTime: '22:00', price: 95000 },
  { movieTitle: 'Forrest Gump', theaterName: 'Cinestar Hai Bà Trưng', showDate: '2026-04-01', showTime: '16:00', price: 85000 },
  { movieTitle: 'Titanic', theaterName: 'BHD Star Bitexco', showDate: '2026-04-01', showTime: '13:00', price: 105000 },
  { movieTitle: 'Everything Everywhere All at Once', theaterName: 'CGV Aeon Tân Phú', showDate: '2026-04-01', showTime: '12:00', price: 100000 },
  { movieTitle: 'The Grand Budapest Hotel', theaterName: 'Cinestar Hai Bà Trưng', showDate: '2026-04-01', showTime: '13:00', price: 80000 },
  { movieTitle: 'A Quiet Place', theaterName: 'BHD Star Bitexco', showDate: '2026-04-01', showTime: '22:30', price: 100000 },
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
