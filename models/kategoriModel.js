const mongoose = require("mongoose");

const kategoriSchema = new mongoose.Schema({
  nama_kategori: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Kategori", kategoriSchema);