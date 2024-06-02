document.addEventListener('DOMContentLoaded', () => {
    const serviceItems = document.querySelectorAll('.service-item');
    const cartTableBody = document.querySelector('#cart-table tbody');
    const totalAmount = document.querySelector('#total-amount');
    const processTransactionButton = document.querySelector('#process-transaction');
    const receiptSection = document.querySelector('#receipt');
    const customerNameInput = document.querySelector('#customer-name');
    const saveToDBButton = document.querySelector('#save-to-db');
    let total = 0;
    let serviceMap = {}; // Object to keep track of selected services and their quantities

    serviceItems.forEach(item => {
        item.addEventListener('click', () => {
            const serviceName = item.querySelector('h3').innerText;
            const serviceTarif = parseFloat(item.getAttribute('data-tarif'));
            addToCart(serviceName, serviceTarif);
        });
    });

    function addToCart(serviceName, serviceTarif) {
        if (serviceMap[serviceName]) {
            // Increase quantity and update total
            serviceMap[serviceName].qty++;
            serviceMap[serviceName].total += serviceTarif;

            // Update the UI
            const row = cartTableBody.querySelector(`tr[data-id="${serviceName}"]`);
            row.querySelector('.qty').textContent = serviceMap[serviceName].qty;
            row.querySelector('.total').textContent = formatCurrency(serviceMap[serviceName].total);
        } else {
            // Add new row in the cart
            serviceMap[serviceName] = { qty: 1, total: serviceTarif };

            const row = document.createElement('tr');
            row.setAttribute('data-id', serviceName);
            row.innerHTML = `
                <td>${serviceName}</td>
                <td>${formatCurrency(serviceTarif)}</td>
                <td class="qty">1</td>
                <td class="total">${formatCurrency(serviceTarif)}</td>
                <td>
                    <button class="edit-item">Edit</button>
                    <button class="remove-item">Remove</button>
                </td>
            `;
            cartTableBody.appendChild(row);

            // Add event listener to edit item
            row.querySelector('.edit-item').addEventListener('click', () => {
                editCartItem(serviceName);
            });

            // Add event listener to remove item
            row.querySelector('.remove-item').addEventListener('click', () => {
                removeFromCart(row, serviceTarif);
            });
        }

        // Update total amount
        total += serviceTarif;
        totalAmount.textContent = formatCurrency(total);
    }

    function editCartItem(serviceName) {
        // Find the row in the cart table
        const row = cartTableBody.querySelector(`tr[data-id="${serviceName}"]`);
        const qty = serviceMap[serviceName].qty;
        const total = serviceMap[serviceName].total;

        // Prompt the user to enter a new quantity
        const newQty = prompt(`Enter new quantity for ${serviceName}:`, qty);
        if (newQty === null || newQty.trim() === '') {
            return; // User canceled or didn't provide a new quantity
        }

        // Validate and update the quantity
        const parsedQty = parseInt(newQty);
        if (isNaN(parsedQty) || parsedQty <= 0) {
            alert('Invalid quantity. Quantity must be a positive number.');
            return;
        }

        // Calculate the new total based on the updated quantity
        const newTotal = parsedQty * (total / qty);

        // Update the service map and UI
        serviceMap[serviceName].qty = parsedQty;
        serviceMap[serviceName].total = newTotal;
        row.querySelector('.qty').textContent = parsedQty;
        row.querySelector('.total').textContent = formatCurrency(newTotal);

        // Update total amount
        updateTotalAmount();
    }

    function removeFromCart(row, serviceTarif) {
        const serviceName = row.getAttribute('data-id');

        // Decrease quantity and update total
        serviceMap[serviceName].qty--;
        serviceMap[serviceName].total -= serviceTarif;

        // Remove row if quantity is zero
        if (serviceMap[serviceName].qty === 0) {
            delete serviceMap[serviceName];
            cartTableBody.removeChild(row);
        } else {
            // Update the UI
            row.querySelector('.qty').textContent = serviceMap[serviceName].qty;
            row.querySelector('.total').textContent = formatCurrency(serviceMap[serviceName].total);
        }

        // Update total amount
        updateTotalAmount();
    }

    function updateTotalAmount() {
        total = Object.values(serviceMap).reduce((acc, curr) => acc + curr.total, 0);
        totalAmount.textContent = formatCurrency(total);
    }

    processTransactionButton.addEventListener('click', () => {
        if (customerNameInput.value.trim() === '') {
            alert('Please enter customer name.');
            return;
        }

        const transactionCode = 'TRX' + Date.now();
        const currentDate = new Date();
        const transactionTime = currentDate.toLocaleString();
        let discount = 0;
        let finalTotal = total;

        if (total >= 200000) {
            discount = total * 0.2;
            finalTotal = total - discount;
        }

        const tax = finalTotal * 0.1;
        const totalWithTax = finalTotal + tax;

        generateReceipt(transactionCode, transactionTime, customerNameInput.value, discount, finalTotal, tax, totalWithTax);

        // Show the save button
        saveToDBButton.style.display = 'block';
    });

    saveToDBButton.addEventListener('click', () => {
        // Prepare data to send to simpan_kedatabase.php
        const transactionCode = 'TRX' + Date.now();
        const currentDate = new Date();
        const transactionTime = currentDate.toLocaleString();
        const customerName = customerNameInput.value;
        const serviceData = [];

        // Prepare service data
        Object.keys(serviceMap).forEach(serviceName => {
            const qty = serviceMap[serviceName].qty;
            serviceData.push({ serviceName, qty });
        });

        // Prepare data to send
        const data = {
            transaction_code: transactionCode,
            transaction_time: transactionTime,
            customer_name: customerName,
            service_data: serviceData
        };

        // Send data to simpan_kedatabase.php
        fetch('simpan_kedatabase.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.text())
        .then(result => {
            alert(result); // Show result from server (success or error message)
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error saving transaction. Please try again.');
        });
    });

    function generateReceipt(transactionCode, transactionTime, customerName, discount, finalTotal, tax, totalWithTax) {
        let receiptHTML = `
            <div id="print-section">
                <div class="center-align">
                    <h2>DJB Barbershop</h2>
                    <p>Jl. Jend. Sudirman No 133 Thehok, Jambi</p>
                    <p>Telp (0741)-612673</p>
                </div>
                <hr>
                <p>Waktu Transaksi: ${transactionTime}</p>
                <p>Kode Transaksi : ${transactionCode}</p>
                <p>Nama Pelanggan : ${customerName}</p>
                <hr>
                
                <table class="receipt-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Layanan</th>
                            <th>Kuantitas</th>
                            <th>Tarif</th>
                            <th>Jumlah</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        let itemIndex = 1;
        Object.keys(serviceMap).forEach(serviceName => {
            const serviceData = serviceMap[serviceName];
            const serviceTarif = serviceData.total / serviceData.qty;

            receiptHTML += `
                <tr>
                    <td>${itemIndex}</td>
                    <td>${serviceName}</td>
                    <td>${serviceData.qty}</td>
                    <td>${formatCurrency(serviceTarif)}</td>
                    <td>${formatCurrency(serviceData.total)}</td>
                </tr>
            `;
            itemIndex++;
        });

        receiptHTML += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="4" align="center"><strong>Total</strong></td>
                            <td><strong>${formatCurrency(total)}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="4" align="center"><strong>Diskon Keseluruhan</strong></td>
                            <td><strong>${formatCurrency(discount)}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="4" align="center"><strong>Total Setelah Diskon</strong></td>
                            <td><strong>${formatCurrency(finalTotal)}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="4" align="center"><strong>Total Bayar (+PPN 10%)</strong></td>
                            <td><strong>${formatCurrency(totalWithTax)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
                <div class="right-align">
                    <p
                    <p>Jambi, ${new Date().toLocaleDateString()}</p>
                    <p>DJB Barbershop</p>
                </div>
            </div>
        `;

        receiptSection.innerHTML = receiptHTML;

        // Print the receipt
        window.print();

        // Show the save button after printing
        saveToDBButton.style.display = 'block';
    }

    function formatCurrency(amount) {
        return `Rp ${amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
    }
});