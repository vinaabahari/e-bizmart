// class Hewan{
//   String nama;
//   String suara;

//   Hewan(this.nama, this.suara);
// }
// void main(){
//   Hewan hewan1 = Hewan("Kucing", "Meow");
//   print('Nama Hewan: ${hewan1.nama}, Suara: ${hewan1.suara}');
// }

class Siswa{
  String nama;
  int umur;
  int kelas;

  Siswa(this.nama, this.kelas, this.umur);
}

void main(){
  List<Siswa> daftarSiswa = [
    Siswa("Vina", 12, 17),
    Siswa("Ledy", 12, 16),
    Siswa("Sheyra", 12, 18)
  ];
  for (var Siswa in daftarSiswa){
    print("Nama siswa: ${Siswa.nama}, Kelas: ${Siswa.kelas}, Umur: ${Siswa.umur}");
  }
}