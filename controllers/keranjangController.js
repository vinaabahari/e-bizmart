const KeranjangPembelian = require('../models/keranjangPembelianModel');
const User = require('../models/userModel');
const DetailTransaksi = require('../models/detailTransaksi');
const Penjualan = require("../models/penjualanModel"); 
const Barang = require('../models/barangModel');
const fs = require('fs'); 
const path = require('path');
const pdf = require("pdf-creator-node");



const keranjangController={
    getDaftarKeranjang: async (req,res) =>{
        try {
            const keranjang = await KeranjangPembelian.find({
                user_id: req.session.user.id 
            }).populate('id_barang');
            res.render('keranjang', {keranjang});
        } catch (error) {
            console.log(error);
            res.status(500).send("Terjadi Kesalahan");
        }
    },
    tambahBarangKedalamKeranjang: async (req, res) => {
        try {
            const id = req.params.id;
            const user_id = req.session.user.id; // Assuming user.id is correctly accessed

            const keranjang = new KeranjangPembelian({ id_barang: id, jumlah: 1, user_id: user_id });
            await keranjang.save();
            res.redirect('/barang/transaksi');
        } catch (error) {
            console.log(error);
            res.status(500).send("Terjadi kesalahan");
        }
    },
    tambahJumlahBarang: async (req, res) => {
        try {
            const id = req.params.id;
            const keranjang = await KeranjangPembelian.findById(id);
            keranjang.jumlah += 1;
            await keranjang.save();
            res.redirect("/keranjang");
        } catch (error) {
            console.log(error);
            res.status(500).send("Terjadi kesalahan");
        }
    },
    kurangiJumlahBarang: async (req, res) => {
        try {
            const id = req.params.id;
            const keranjang = await KeranjangPembelian.findById(id);
            if (keranjang.jumlah > 1) {
                keranjang.jumlah -= 1;
                await keranjang.save();
            }
            res.redirect("/keranjang");
        } catch (error) {
            console.log(error);
            res.status(500).send("Terjadi kesalahan");
        }
    },
    deleteKeranjang: async(req, res) => {
        try {
            const id = req.params.id;
            await KeranjangPembelian.findByIdAndDelete(id);
            res.redirect('/keranjang');
        } catch (error) {
            console.log(error);
            res.status(500).send("Terjadi kesalahan");
        }
    },
    beliBarang: async (req, res) => {
    try {
        const user_id = req.session.user.id;
        const metodePembayaran = req.body.metode_pembayaran;
        const keranjang = await KeranjangPembelian.find({ user_id: user_id }).populate('id_barang');
        const user = await User.findById(user_id);

        if (!keranjang.length) {
            return res.status(400).send("Keranjang kosong.");
        }

        let totalHarga = 0;
        let detailItems = []; 

        for (const item of keranjang) {
            const barang = item.id_barang;
            if (!barang) continue; 

            if (barang.stok_barang < item.jumlah) {
                return res.status(500).send(`Stok barang ${barang.nama_barang} tidak cukup.`);
            }

            const subtotal = barang.harga_barang * item.jumlah;
            totalHarga += subtotal;

            detailItems.push({
                nama_barang: barang.nama_barang,
                harga: barang.harga_barang,
                jumlah: item.jumlah,
                total: subtotal,
            });

            await Barang.findByIdAndUpdate(item.id_barang._id, {
                $inc: { stok_barang: -item.jumlah }
            });

            const updatedBarang = await Barang.findById(item.id_barang._id);
            if (updatedBarang.stok_barang < 1) {
                await Barang.findByIdAndUpdate(item.id_barang._id, {
                    status_ketersediaan: "Habis"
                });
            }
        }

        const newPenjualan = new Penjualan({
            id_user: user_id,
            tanggal: new Date(),
            pembayaran: metodePembayaran,
            total: totalHarga,
            status_transaksi: 'Selesai'
        });
        const savedPenjualan = await newPenjualan.save();
        console.log("penjualan" + savedPenjualan); // Logging the saved sales data

        // Save transaction details for each item
        for (const item of keranjang) {
            await new DetailTransaksi({
                id_penjualan: savedPenjualan._id,
                id_barang: item.id_barang._id,
                jumlah: item.jumlah,
                harga_satuan: item.id_barang.harga_barang,
                sub_total: item.id_barang.harga_barang * item.jumlah
            }).save();
        }

        // After successful purchase, redirect to print receipt
        res.redirect(`/keranjang/struk/${savedPenjualan._id}`);
    } catch (error) {
        console.log(error);
        res.status(500).send("Terjadi kesalahan saat memproses pembelian.");
    }
},
getStrukKeranjang: async (req, res) => {
    try {
        const id = req.params.id;
        const penjualan = await Penjualan.findById(id).populate("id_user");
        const detail = await DetailTransaksi.find({
            id_penjualan: penjualan._id
        }).populate("id_barang");

        let totalHarga = 0;
        detail.forEach(item => {
            const subTotal = item.harga_satuan * item.jumlah; // Subtotal per barang
            totalHarga += subTotal; // Tambahkan ke total harga
        });

        res.render('downloadStruk', { penjualan, detail, totalHarga });
    } catch (error) {
        console.log(error);
        res.status(500).send("Terjadi kesalahan");
    }
},
clearKeranjang: async (req, res) => {
    try {
        await KeranjangPembelian.deleteMany({ user_id: req.session.user.id });
        res.redirect("/keranjang");
    } catch (error) {
        console.log(error);
        res.status(500).send("Terjadi kesalahan");
    }
},
    cetakStruk: async (req, res) => {
    try {
        const penjualanId = req.params.id;
        console.log("penjualanId yang diterima:", penjualanId);

        if (!penjualanId || penjualanId.length < 10) { // Assuming ID has a minimum length
        return res.status(400).send("ID transaksi tidak valid.");
        }

        const penjualan = await Penjualan.findById(penjualanId).populate("id_user");
        const detail = await DetailTransaksi.find({
        id_penjualan: penjualanId
        }).populate("id_barang");


        if (!penjualan) return res.status(404).send("Transaksi tidak ditemukan.");

        let totalHarga = 0;
        let detailItems = [];

        detail.forEach(d => {
        const subTotal = d.harga_satuan * d.jumlah;
        totalHarga += subTotal;

        detailItems.push({
            nama_barang: d.id_barang.nama_barang,
            harga: d.harga_satuan,
            jumlah: d.jumlah,
            total: subTotal
        });
        });

        // Generate PDF
        const html = fs.readFileSync(path.join(__dirname, "../template/templateStrukKeranjangPDF.html"), "utf8");

        const document = {
        html: html,
        data: {
            barang: detailItems,
            total_harga: totalHarga,
            metode_pembayaran: penjualan.pembayaran,
            tanggal_pembelian: new Date(penjualan.tanggal).toLocaleString('id-ID'),
            nama_pembeli: penjualan.id_user.nama_user
        },
        path: "./output/struk_pembelian.pdf"
        };

        await pdf.create(document, {});

        res.download("./output/struk_pembelian.pdf");
    } catch (error) {
        console.log(error);
        res.status(500).send("Terjadi kesalahan saat mencetak struk.");
    }
    },
}
module.exports = keranjangController;