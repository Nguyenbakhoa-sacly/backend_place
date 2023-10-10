
const express = require('express');

const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes')

const app = express();
const hostname = '127.0.0.1';
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));

// Sử dụng middleware bodyParser.json() để parse dữ liệu JSON trong request body.
app.use(bodyParser.json());

app.use('/api/places', placesRoutes)

app.use((err, req, res, next) => {
  // Kiểm tra xem tiêu đề phản hồi đã được gửi chưa
  if (res.headerSent) {
    // Nếu đã gửi, thì chỉ cần chuyển lỗi cho hàm middleware tiếp theo
    return next(err)
  }
  // Nếu chưa gửi, thì đặt mã trạng thái phản hồi thành mã lỗi, hoặc thành 500 nếu lỗi không có mã
  res.status(err.code || 500)
    // Đặt nội dung phản hồi thành một đối tượng JSON có thuộc tính `message` chứa thông báo lỗi
    .json({ message: err.message || 'An unknown error occurred' })
})

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

