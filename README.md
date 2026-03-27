# Shopping App (Bám sát đề local database)

Ứng dụng Android bằng React Native/Expo theo mô hình local-first:
- Không dùng backend server.
- Dữ liệu nghiệp vụ lưu local bằng `SQLite` (`expo-sqlite`, mô phỏng Room).
- Trạng thái đăng nhập lưu local (tương đương SharedPreferences) bằng `AsyncStorage`.

## Chức năng
- Đăng nhập / đăng ký
- Xem danh mục sản phẩm
- Xem danh sách sản phẩm và chi tiết sản phẩm
- Thêm vào giỏ, tạo đơn hàng
- Checkout và hiển thị hóa đơn
- Lịch sử đơn hàng

## Cấu trúc dữ liệu
- `Users`
- `Categories`
- `Products`
- `Orders`
- `OrderDetails` (nằm trong `items` của `Order`)

## Chạy dự án
```bash
cd mobile
npm install
npx expo start
```

## Tài khoản seed
- Username: `admin` | Password: `123456`
- Username: `staff` | Password: `123456`
