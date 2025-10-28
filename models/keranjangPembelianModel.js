const mongoose = require("mongoose");

const keranjangPembelianSchema = new mongoose.Schema({
  id_barang: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Barang",
    required: true,
  },
  jumlah: {
    type: Number,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("KeranjangPembelian", keranjangPembelianSchema);
