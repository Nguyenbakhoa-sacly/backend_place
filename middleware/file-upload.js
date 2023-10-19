
const multer = require('multer');
const { v1: uuidv1 } = require('uuid');
const MINE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};
const fileUpload = multer({
  //Đặt giới hạn 500000 byte cho các tệp đã tải lên
  limits: 500000,
  //Định nghĩa cấu hình lưu trữ đĩa
  storage: multer.diskStorage({
    //Xác định thư mục nơi các tệp đã tải lên sẽ được lưu.
    destination: (req, file, cb) => {
      //Nơi các tệp đã tải lên sẽ được lưu.
      cb(null, 'uploads/images')
    },
    //Xác định tên tệp cho mỗi tệp đã tải lên.
    filename: (req, file, cb) => {
      const ext = MINE_TYPE_MAP[file.mimetype];
      cb(null, uuidv1() + '.' + ext);
    }
  }),
  //Lọc các tệp đã tải lên dựa trên loại MIME của chúng.
  fileFilter: (req, file, cb) => {
    const isValid = !!MINE_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error('Invalid mime type!');
    cb(error, isValid);
  }
});


module.exports = fileUpload;