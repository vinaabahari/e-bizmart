const DetailTransaksi = require("../models/detailTransaksi");

const penjualanController = {
  getDaftarPenjualan: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 5;
      const skip = (page - 1) * limit;
      const search = req.query.search?.trim().toLowerCase() || "";

      // 1.Ambil semua detail transaksi
      const allDetail = await DetailTransaksi.find({})
      .populate('id_barang')
      .populate({
        path: 'id_penjualan',
        populate:{
            path: 'id_user',
        },
      })
      .sort({_id: -1});
      //2. Filter search nama user
      const filteredDetail = allDetail.filter((dt) => {
        const namaUser = dt.id_penjualan?.id_user?.nama_user.toLowerCase() || "";
        return !search|| namaUser.includes(search);
      });
      //3. Ambil hanya data untuk halaman ini
      const paginatedDetail = filteredDetail.slice(skip, skip + limit);

      //4. Kelompokkan detail ke dalam masing-masing penjualan
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

      res.render("riwayatPenjualan", {
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

module.exports = penjualanController;