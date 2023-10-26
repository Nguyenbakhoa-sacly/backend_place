
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routers')
const HttpError = require('./models/http-error')

const app = express();
app.use(cors());

dotenv.config();
const hostname = `${process.env.HOST_NAME}`;
const port = process.env.PORT || 3001;

// app.use(bodyParser.urlencoded({ extended: false }));

// Sử dụng middleware bodyParser.json() để parse dữ liệu JSON trong request body.
app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type,Accept, Authorization')
  res.setHeader('Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE');
  next();
})

app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
})

app.use((err, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, err => {
      console.log(err);
    })
  }

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

mongoose
  .connect(`${process.env.MONGO_DB}`)
  .then(
    () => {
      app.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
      });
    }
  )
  .catch(err => console.log(err));



