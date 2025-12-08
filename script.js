// Initialize bill number and date
document.addEventListener('DOMContentLoaded', function () {
    // Set current date in yyyy-mm-dd format for date input
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    document.getElementById('billDate').value = `${year}-${month}-${day}`;

    // Generate bill number
    generateBillNumber();

    // Add initial rows
    for (let i = 0; i < 3; i++) {
        addRow();
    }
});

// Generate unique bill number
function generateBillNumber() {
    const date = new Date();
    const billNo = 'AKS' + date.getFullYear() +
        String(date.getMonth() + 1).padStart(2, '0') +
        String(date.getDate()).padStart(2, '0') +
        String(date.getHours()).padStart(2, '0') +
        String(date.getMinutes()).padStart(2, '0');
    document.getElementById('billNo').value = billNo;
}

// Add new row to the table
function addRow() {
    const tableBody = document.getElementById('billTableBody');
    const rowCount = tableBody.rows.length + 1;

    const row = tableBody.insertRow();
    row.innerHTML = `
        <td class="serial-no">${rowCount}</td>
        <td><input type="text" class="particulars" placeholder="Enter service name" oninput="calculateTotal()"></td>
        <td><input type="number" class="rate" placeholder="0" step="0.01" oninput="calculateRow(this)"></td>
        <td class="amount">0.00</td>
        <td class="no-print"><button class="btn-delete" onclick="deleteRow(this)">Delete</button></td>
    `;
}

// Calculate amount for a specific row
function calculateRow(input) {
    const row = input.closest('tr');
    const rate = parseFloat(row.querySelector('.rate').value) || 0;
    const amountCell = row.querySelector('.amount');

    amountCell.textContent = rate.toFixed(2);
    calculateTotal();
}

// Calculate grand total
function calculateTotal() {
    const tableBody = document.getElementById('billTableBody');
    let total = 0;

    for (let row of tableBody.rows) {
        const amount = parseFloat(row.querySelector('.amount').textContent) || 0;
        total += amount;
    }

    document.getElementById('grandTotal').textContent = total.toFixed(2);
}

// Delete a row
function deleteRow(button) {
    const row = button.closest('tr');
    row.remove();
    updateSerialNumbers();
    calculateTotal();
}

// Update serial numbers after deletion
function updateSerialNumbers() {
    const tableBody = document.getElementById('billTableBody');
    const rows = tableBody.rows;

    for (let i = 0; i < rows.length; i++) {
        rows[i].querySelector('.serial-no').textContent = i + 1;
    }
}

// Save bill to localStorage
function saveBill() {
    const billNo = document.getElementById('billNo').value;
    const billDate = document.getElementById('billDate').value;
    const customerName = document.getElementById('customerName').value;
    const tableBody = document.getElementById('billTableBody');

    // Collect all services
    const services = [];
    for (let row of tableBody.rows) {
        const particulars = row.querySelector('.particulars').value.trim();
        const rate = parseFloat(row.querySelector('.rate').value) || 0;
        const amount = parseFloat(row.querySelector('.amount').textContent) || 0;

        if (particulars) {
            services.push({ particulars, rate, amount });
        }
    }

    // Only save if there are services
    if (services.length === 0) {
        return;
    }

    const total = document.getElementById('grandTotal').textContent;

    // Create bill object
    const bill = {
        billNo,
        billDate,
        customerName: customerName || 'N/A',
        services,
        total,
        timestamp: new Date().toISOString()
    };

    // Get existing bills from localStorage
    let bills = JSON.parse(localStorage.getItem('akshayaBills') || '[]');

    // Check if bill already exists (by bill number)
    const existingIndex = bills.findIndex(b => b.billNo === billNo);
    if (existingIndex >= 0) {
        bills[existingIndex] = bill; // Update existing
    } else {
        bills.push(bill); // Add new
    }

    // Save to localStorage
    localStorage.setItem('akshayaBills', JSON.stringify(bills));
}

// Print bill
function printBill() {
    // Save bill before printing
    saveBill();

    // Convert date to dd-mm-yyyy format for printing
    const dateInput = document.getElementById('billDate');
    const originalValue = dateInput.value;

    if (originalValue) {
        const [year, month, day] = originalValue.split('-');
        const formattedDate = `${day}-${month}-${year}`;

        // Temporarily change the input type and value for printing
        dateInput.type = 'text';
        dateInput.value = formattedDate;

        // Print
        window.print();

        // Restore original type and value after print dialog closes
        setTimeout(() => {
            dateInput.type = 'date';
            dateInput.value = originalValue;
        }, 100);
    } else {
        window.print();
    }
}

// Clear form and reset to new bill
function clearForm() {
    // Clear customer name
    document.getElementById('customerName').value = '';

    // Reset date to today
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    document.getElementById('billDate').value = `${year}-${month}-${day}`;

    // Generate new bill number
    generateBillNumber();

    // Clear all rows
    const tableBody = document.getElementById('billTableBody');
    tableBody.innerHTML = '';

    // Add fresh rows
    for (let i = 0; i < 3; i++) {
        addRow();
    }

    // Reset total
    calculateTotal();

    // Show success message
    alert('Form cleared! Ready for a new bill.');
}

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    // Ctrl + P for print
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        printBill();
    }

    // Ctrl + N for new row
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        addRow();
    }
});
