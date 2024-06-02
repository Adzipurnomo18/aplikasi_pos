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

// Prepare data from POST
$transactionCode = $_POST['transaction_code'];
$transactionTime = $_POST['transaction_time'];
$customerName = $_POST['customer_name'];

// Insert transaction into database
$sql = "INSERT INTO Transaksi (kode_transaksi, waktu_transaksi, nama_pelanggan)
        VALUES ('$transactionCode', '$transactionTime', '$customerName')";

if ($conn->query($sql) === TRUE) {
    echo "Transaction saved successfully";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>
