const Penjualan = require("../models/penjualanModel");
const DetailTransaksi = require("../models/detailTransaksi");

const pembelianController = {
  getDaftarPembelian: async (req, res) => {
    try {
      const idUser = req.session.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = 5;
      const skip = (page - 1) * limit;
      const search = req.query.search?.trim().toLowerCase() || "";

      // Ambil semua penjualan milik user
      const penjualanUser = await Penjualan.find({ id_user: idUser }).populate("id_user");
      const penjualanIds = penjualanUser.map((p) => p._id);

      // Ambil semua detail transaksi milik user
      let allDetail = await DetailTransaksi.find({
        id_penjualan: { $in: penjualanIds },
      })
        .populate("id_barang")
        .populate({
          path: "id_penjualan",
          populate: {
            path: "id_user",
          },
        })
        .sort({ _id: -1 });

      // Filter berdasarkan nama barang (jika ada search)
      const filteredDetail = allDetail.filter((dt) => {
        const namaBarang = dt.id_barang?.nama_barang?.toLowerCase() || "";
        return namaBarang.includes(search);
      });
      // Ambil detail sesuai halaman (pagination setelah filter)
      const paginatedDetail = filteredDetail.slice(skip, skip + limit);

      // Kelompokkan detail ke dalam masing-masing penjualan
      const penjualanMap = new Map();

      paginatedDetail.forEach((dt) => {
        const penjualanId = dt.id_penjualan._id.toString();

        if (!penjualanMap.has(penjualanId)) {
          penjualanMap.set(penjualanId, {
            ...dt.id_penjualan.toObject(),
            detail: [],
          });
        }
        penjualanMap.get(penjualanId).detail.push(dt);
      });

      const hasil = Array.from(penjualanMap.values());
      const totalPages = Math.ceil(filteredDetail.length / limit);

      res.render("riwayatPembelian", {
        pembelian: hasil,
        currentPage: page,
        totalPages,
        search,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Terjadi kesalahan saat memproses daftar pembelian.");
    }
  },
};

module.exports = pembelianController;