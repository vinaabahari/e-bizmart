const Barang = require('../models/barangModel');
const Kategori = require('../models/kategoriModel');
const path = require("path");
const fs = require("fs");
const User = require('../models/userModel');
const DetailTransaksi = require('../models/detailTransaksi');
const Penjualan = require("../models/penjualanModel"); 
const pdf = require("pdf-creator-node");

const barangController = {
    getDaftarBarang: async (req,res) => {
        try {
            const barang = await Barang.find();
            res.render('daftarBarang', {barang});
        } catch (error) {
            console.log(error);
            res.status(500).send('Terjadi Kesalahan');
        }
    },
    getTambahBarang: async (req,res) => {
        try {
            const kategori = await Kategori.find();
            res.render('tambahBarang', {kategori});
        } catch (error) {
            console.log(error);
            res.status(500).send("Terjadi Kesalahan");
        }
    },
    tambahBarang: async (req, res) => {
    try {
        const fotoPath = req.file ? req.file.filename : null;
        let {
            id_kategori,
            nama_barang,
            harga_barang,
            keterangan_barang,
            stok_barang,
            exp_barang,
            status_ketersediaan,
        } = req.body;

        if (stok_barang == 0 && status_ketersediaan == "Tersedia") {
            status_ketersediaan = "Habis";
        } else if (stok_barang > 0 && status_ketersediaan != "Tersedia") {
            status_ketersediaan = "Tersedia";
        }

        if (status_ketersediaan == "Pre-order" || status_ketersediaan == "Habis") {
            stok_barang = "0";
        }

        const barang = new Barang({
            id_kategori,
            nama_barang,
            gambar_barang: fotoPath,
            harga_barang,
            keterangan_barang,
            stok_barang,
            exp_barang,
            status_ketersediaan,
        });

        await barang.save();
        res.redirect("/barang/daftar");
    } catch (error) {
        console.log(error);
        res.status(500).send("Terjadi kesalahan");
    }
    },
    getEditBarang: async(req,res) =>{
        try{
            const id = req.params.id;
            const barang = await Barang.findById(id);
            const kategori = await Kategori.find();
            res.render("editBarang", {barang, kategori});
        } catch(error) {
            console.log(error);
            res.status(500).send("Terjadi kesalahan");
        }
    },
    editBarang: async (req, res) => {
    try {
        const id  = req.params.id;
        let { nama_barang, harga_barang, keterangan_barang, stok_barang, exp_barang, status_ketersediaan } = req.body;

        const dataBarang = await Barang.findById(id);
        const fotoPath = req.file ? req.file.filename : null;

        if (stok_barang == 0 && status_ketersediaan == "Tersedia") {
            status_ketersediaan = "Habis";
        } else if (stok_barang > 0 && status_ketersediaan != "Tersedia") {
            status_ketersediaan = "Tersedia";
        }
        if (status_ketersediaan == "Pre-order" || status_ketersediaan == "Habis") {
            stok_barang = "0";
        }
        if (fotoPath && dataBarang.gambar_barang) {
            const imagePath = path.join(__dirname, '../public/img/', dataBarang.gambar_barang);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Barang.findByIdAndUpdate(id, {
            nama_barang: nama_barang || dataBarang.nama_barang,
            harga_barang: harga_barang || dataBarang.harga_barang,
            gambar_barang: fotoPath || dataBarang.gambar_barang,
            keterangan_barang: keterangan_barang || dataBarang.keterangan_barang,
            stok_barang: stok_barang || dataBarang.stok_barang,
            exp_barang: exp_barang || dataBarang.exp_barang,
            status_ketersediaan: status_ketersediaan || dataBarang.status_ketersediaan,
        });

        res.redirect("/barang/daftar");
    } catch (error) {
        console.log(error);
        res.status(500).send("Terjadi kesalahan");
    }
},
    deleteBarang: async (req, res) => {
    try {
        const id = req.params.id;
        const barang = await Barang.findById(id);

        if (barang.gambar_barang) {
            const imagePath = path.join(__dirname, '../public/img/', barang.gambar_barang);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Barang.findByIdAndDelete(id);
        res.redirect("/barang/daftar");
    } catch (error) {
        console.log(error);
        res.status(500).send("Terjadi kesalahan");
    }
},
    getDaftarBarangForHomePage: async (req,res) =>{
        try {
            const barang = await Barang.find({status_ketersediaan: {$ne: "Habis"}});
            res.render('homePage', {barang});
        } catch ({error}) {
            console.log(error);
            res.status(500).send("Terjadi Kesalahan");
        }
    },
    beliBarang: async (req, res) => {
    try {
        const user_id = req.session.user.id;
        const metodePembayaran = req.body.metode_pembayaran;
        const idBarang = req.params.id; 
        const user = await User.findById(user_id);

        const barang = await Barang.findById(idBarang);
        if (!barang) {
            return res.status(404).send("Barang tidak ditemukan.");
        }
        if (barang.stok_barang < 1) {
            return res.status(500).send("Stok habis");
        }

        const newPenjualan = new Penjualan({
            id_user: user_id,
            tanggal: new Date(),
            pembayaran: metodePembayaran,
            total: barang.harga_barang, 
            status_transaksi: 'Selesai'
        });
        await newPenjualan.save();

        const newDetailPenjualan = new DetailTransaksi({
            id_penjualan: newPenjualan._id,
            id_barang: idBarang,
            jumlah: 1, 
            harga_satuan: barang.harga_barang,
            sub_total: barang.harga_barang 
        });
        await newDetailPenjualan.save();

        // Update stok barang
        await Barang.findByIdAndUpdate(idBarang, {
            stok_barang: barang.stok_barang - 1
        });

        const updatedBarang = await Barang.findById(idBarang);
        if (updatedBarang.stok_barang < 1) {
            await Barang.findByIdAndUpdate(idBarang, {
                status_ketersediaan: "Habis"
            });
        }

        // Setelah pembelian berhasil, arahkan ke cetak struk
        res.redirect(`/barang/struk/${newPenjualan._id}`);
    } catch (error) {
        console.log(error);
        res.status(500).send("Terjadi kesalahan saat memproses pembelian.");
    }
},
    getStrukBeliBarang: async (req, res) => {
        try {
            const id = req.params.id;
            const penjualan = await Penjualan.findById(id).populate("id_user");
            const detail = await DetailTransaksi.find({
                id_penjualan: penjualan._id
            }).populate("id_barang");

            res.render('downloadStruk', { penjualan, detail });
        } catch (error) {
            console.log(error);
            res.status(500).send("Terjadi kesalahan");
        }
    },
    cetakStruk: async (req, res) => {
    try {
        const penjualanId = req.params.id;

        // Cari data penjualan
        const penjualan = await Penjualan.findById(penjualanId).populate('id_user');
        const detail = await DetailTransaksi.findOne({
        id_penjualan: penjualanId
        }).populate('id_barang');

        if (!penjualan || !detail) {
        return res.status(404).send("Data penjualan tidak ditemukan.");
        }

        // Baca template HTML
        const html = fs.readFileSync(path.join(
        __dirname, "../template/templateStrukPDF.html"
        ), "utf8");

        // Data yang mau diisi ke template
        const document = {
        html: html,
        data: {
            barang: {
            nama_barang: detail.id_barang.nama_barang,
            harga: detail.id_barang.harga_barang,
            jumlah: detail.jumlah,
            total: detail.sub_total,
            metode_pembayaran: penjualan.pembayaran,
            tanggal_pembelian: penjualan.tanggal.toLocaleString('id-ID'),
            nama_pembeli: penjualan.id_user.nama_user,
            status_transaksi: "selesai"
            }
        },
        path: "./output/struk_pembelian.pdf"
        };
        //generate pdf
        await pdf.create(document, {});
        //download file
        res.download('./output/struk_pembelian.pdf');
    } catch(error){
        console.log(error);
                res.status(500).send("Terjadi kesalahan");
    }
    }
}

module.exports = barangController;