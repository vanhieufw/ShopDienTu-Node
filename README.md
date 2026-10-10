# ShopDienTu Node.js - Zonanio

Chuyển backend PHP → Node.js, giao diện theo bản DACS2 - Copy (Zonanio).

## Cài đặt nhanh

```bash
cd ShopDienTu-Node-Final
npm install

# BẮT BUỘC: copy ảnh từ project PHP
xcopy /E /I "C:\xampp\htdocs\DACS2\ShopDienTu\frontend\img\*" "public\img\"

# Sửa .env cho đúng database
# DB_NAME=dacs2  hoặc  sanphamdientu
# DB_PORT=3308

npm run dev
```

Mở http://localhost:3000

## Lưu ý ảnh sản phẩm
Đường dẫn ảnh trong DB là tên file (vd: `legion.jpg`). File phải nằm trong `public/img/`.
