<?php
// Koneksi ke database
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "barbershop";

// Membuat koneksi
$conn = new mysqli($servername, $username, $password, $dbname);

// Cek koneksi
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Mengambil data yang dikirimkan dari frontend
$data = json_decode(file_get_contents("php://input"));

// Menyimpan data ke dalam database
$kode_transaksi = $data->kode_transaksi;
$waktu_transaksi = $data->waktu_transaksi;
$nama_pelanggan = $data->nama_pelanggan;
$services = $data->services;

foreach ($services as $service) {
    $kode_layanan = $service->kode_layanan;
    $kuantitas = $service->kuantitas;

    $sql = "INSERT INTO transactions (kode_transaksi, waktu_transaksi, nama_pelanggan, kode_layanan, kuantitas) 
            VALUES ('$kode_transaksi', '$waktu_transaksi', '$nama_pelanggan', '$kode_layanan', $kuantitas)";

    if ($conn->query($sql) !== TRUE) {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
}

// Menutup koneksi
$conn->close();

// Mengirim respons kembali ke frontend
header("Content-Type: application/json");
echo json_encode(array("message" => "Data transaksi berhasil disimpan."));
?>
   ```