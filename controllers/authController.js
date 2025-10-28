//fungsi untuk render halaman register
const User = require("../models/userModel");
const bcrypt = require('bcrypt');

const authController = {
    getRegister: (req, res) => {
        res.render("register");
    },
    getLogin: (req, res) => {
        res.render("login");
    },
    register: async (req, res) => {
    try {
        const { nama, username, password, alamat } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const pelanggan = new User({
        nama_user: nama,
        username,
        password: hashedPassword,
        role: "pelanggan",
        alamat
        });

        await pelanggan.save();
        res.redirect('/auth/login');
    } catch (error) {
        console.log(error);
        res.status(500).send("Terjadi kesalahan");
    }
    },
    login: async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send("Username atau password salah");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send("Username atau password salah");
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      nama: user.nama_user,
      role: user.role
    };

    res.redirect('/barang/transaksi');
  } catch (error) {
    console.log(error);
    res.status(500).send("Terjadi kesalahan");
  }
},
logout: async(req, res) =>{
  req.session.destroy();
  res.redirect('/auth/login');
}
};

module.exports = authController;