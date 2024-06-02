<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "djb_barbershop";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Receive data from POST request
$data = json_decode(file_get_contents('php://input'), true);

$transactionCode = $data['transaction_code'];
$transactionTime = date('Y-m-d H:i:s', strtotime($data['transaction_time'])); // Format transaction_time
$customerName = $data['customer_name'];
$serviceData = $data['service_data'];

// Prepare statement
$stmt = $conn->prepare("INSERT INTO Transaksi (kode_transaksi, waktu_transaksi, nama_pelanggan, kode_layanan, kuantitas) VALUES (?, ?, ?, ?, ?)");

if ($stmt === false) {
    die('Error preparing statement');
}

$stmt->bind_param("ssssi", $transactionCode, $transactionTime, $customerName, $kode_layanan, $kuantitas);

foreach ($serviceData as $service) {
    $serviceName = $service['serviceName']; // Assuming serviceName corresponds to kode_layanan

    // Check if serviceName exists in Layanan table
    $checkStmt = $conn->prepare("SELECT kode_layanan FROM Layanan WHERE nama_layanan = ?");
    $checkStmt->bind_param("s", $serviceName);
    $checkStmt->execute();
    $checkStmt->store_result();

    if ($checkStmt->num_rows > 0) {
        $checkStmt->bind_result($kode_layanan);
        $checkStmt->fetch();

        $kuantitas = $service['qty'];

        // Insert into Transaksi table
        $stmt->execute();
    } else {
        echo "Error: Kode layanan $serviceName does not exist.";
    }
}

$stmt->close();
$conn->close();
?>
