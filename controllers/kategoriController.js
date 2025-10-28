const Kategori = require('../models/kategoriModel');

const kategoriController ={
    getDaftarKategori: async(req, res) =>{
        try {
            const kategori = await Kategori.find();
            res.render('daftarKategori', {kategori});
        } catch (error) {
            console.log(erorr);
            res.status(500).send("Terjadi Kesalahan");
        }
    },
    getTambahKategori: (req, res) =>{
        res.render('tambahKategori');
    },
    tambahKategori: async (req, res) => {
        try {
            const {namaKategori} = req.body;
            const kategori = new Kategori({nama_kategori: namaKategori});
            await kategori.save();
            res.redirect("/kategori/daftar");
        } catch (error) {
            console.log(error);
            res.status(500).send('Gagal menambah kategori');
        }
    },
    getEditKategori: async (req,res) =>{
        try {
            const id = req.params.id;
            const kategori = await Kategori.findById(id);
            res.render('editKategori',{kategori});
        } catch (error) {
            console.log(error);
            res.status(500).send("Terjadi kesalahan");
        }
    },
    editKategori: async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id);

        const dataKategori = await Kategori.findById(id);
        const { namaKategori } = req.body;
        await Kategori.findByIdAndUpdate(id, { nama_kategori: namaKategori || dataKategori.nama_kategori });
        res.redirect('/kategori/daftar');
    } catch (error) {
        console.log(error);
        res.status(500).send("Gagal mengedit kategori");
    }
    },
    deleteKategori: async(req,res) => {
        try {
            const id= req.params.id;
            await Kategori.findByIdAndDelete(id);
            res.redirect('/kategori/daftar');
        } catch (error) {
            console.log(error);
            res.status(500).send('Gagal menghapus kategori');
        }
    }
}
module.exports = kategoriController;