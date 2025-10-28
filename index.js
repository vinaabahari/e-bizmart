const express = require("express");
const app = express();
const dotenv = require("dotenv").config(); // import library dotenv
const connectDB = require("./config/connectDb"); // mengambil fungsi connectDb
const path = require("path");
const session = require("express-session");

const authRoutes = require("./routes/authRoutes");
const kategoriRoutes = require('./routes/kategoriRoutes');
const barangRoutes = require('./routes/barangRoutes');
const keranjangRoutes = require("./routes/keranjangRoutes");
const pembelianRoutes = require('./routes/pembelianRoutes');
const penjualanRoutes = require('./routes/penjualanRoutes');
const port = process.env.PORT; // mengambil PORT dari file .env

connectDB(); // menjalankan fungsi connectDb

// rute dasar
app.get("/", (req, res) => {
  res.redirect("/auth/login");
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// mengkonfigurasi EJS sebagai template engine
app.set("view engine", "ejs");
// mengkonfigurasi lokasi folder untuk file template EJS
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: 'rahasia-anda', // ganti dengan string yang unik
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // kalau belum pakai HTTPS, set ke false
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use("/auth", authRoutes);
app.use("/kategori", kategoriRoutes);
app.use("/barang", barangRoutes);
app.use("/keranjang", keranjangRoutes);
app.use("/pembelian", pembelianRoutes);
app.use("/penjualan", penjualanRoutes);

// menjalankan server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});