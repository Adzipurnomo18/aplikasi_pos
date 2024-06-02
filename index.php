<!DOCTYPE html>
<html>
<head>
    <title>DJB Barbershop POS</title>
    <link rel="stylesheet" href="style.css">
    <style>
        @media print {
            body * {
                visibility: hidden;
            }
            #receipt, #receipt * {
                visibility: visible;
            }
            #receipt {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
            }
        }
        .receipt-header {
            text-align: center;
        }
        .receipt-footer {
            text-align: right;
            margin-top: 20px;
        }
        .receipt-separator {
            border-top: 1px solid #000;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>DJB Barbershop POS</h1>
        </header>
        
        <main>
            <section class="services">
                <h2>Available Services</h2>
                <div id="service-list">
                    <?php
                    // Koneksi ke database MySQL
                    $servername = "localhost";
                    $username = "root";
                    $password = "";
                    $dbname = "djb_barbershop";

                    // Buat koneksi
                    $conn = new mysqli($servername, $username, $password, $dbname);

                    // Cek koneksi
                    if ($conn->connect_error) {
                        die("Koneksi gagal: " . $conn->connect_error);
                    }

                    // Ambil data layanan
                    $sql = "SELECT * FROM Layanan";
                    $result = $conn->query($sql);

                    // Tampilkan data layanan
                    if ($result->num_rows > 0) {
                        while($row = $result->fetch_assoc()) {
                            // Format tarif ke dalam format yang diinginkan
                            $tarifFormatted = number_format($row['tarif'], 0, ',', '.');
                            
                            echo "<div class='service-item' data-id='{$row['kode_layanan']}' data-tarif='{$row['tarif']}'>";
                            echo "<h3>{$row['nama_layanan']}</h3>";
                            echo "<p>Tarif: Rp. {$tarifFormatted}</p>";
                            echo "</div>";
                        }
                    } else {
                        echo "<p>No services available.</p>";
                    }
                    ?>
                </div>
            </section>

            <section class="cart">
                <h2>Cart</h2>
                <label for="customer-name">Nama Pelanggan:</label>
                <input type="text" id="customer-name" placeholder="Enter customer name">
                <table id="cart-table">
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Tarif</th>
                            <th>Qty</th>
                            <th>Total</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Items will be dynamically added here -->
                    </tbody>
                </table>
                <div class="cart-total">
                    <h3>Total: <span id="total-amount">0</span></h3>
                    <button id="process-transaction">Process Transaction</button>
                    <button id="save-to-db" style="display:none;">Simpan ke Database</button>
                </div>
            </section>

            <section class="receipt" id="receipt">
                <!-- Receipt will be dynamically generated here -->
            </section>
        </main>

        <footer>
            <p>&copy; 2024 DJB Barbershop</p>
        </footer>
    </div>

    <script src="script.js"></script>
</body>
</html>
