
// Search Modal Functions
function openSearchModal() {
    document.getElementById('searchModal').style.display = 'flex';
    // Automatically show all bills when modal opens
    showAllBills();
}

function showAllBills() {
    const bills = JSON.parse(localStorage.getItem('akshayaBills') || '[]');
    // Sort by timestamp, newest first
    bills.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    displaySearchResults(bills);
}

function closeSearchModal() {
    document.getElementById('searchModal').style.display = 'none';
}

function clearSearch() {
    document.getElementById('searchCustomer').value = '';
    document.getElementById('searchDate').value = '';
    document.getElementById('searchBillNo').value = '';
    document.getElementById('searchResults').innerHTML = '';
}

function searchBills() {
    const searchCustomer = document.getElementById('searchCustomer').value.toLowerCase().trim();
    const searchDate = document.getElementById('searchDate').value;
    const searchBillNo = document.getElementById('searchBillNo').value.toLowerCase().trim();

    // Get all bills from localStorage
    const bills = JSON.parse(localStorage.getItem('akshayaBills') || '[]');

    // Filter bills based on search criteria
    let results = bills.filter(bill => {
        const matchCustomer = !searchCustomer || bill.customerName.toLowerCase().includes(searchCustomer);
        const matchDate = !searchDate || bill.billDate === searchDate;
        const matchBillNo = !searchBillNo || bill.billNo.toLowerCase().includes(searchBillNo);

        return matchCustomer && matchDate && matchBillNo;
    });

    // Sort by timestamp, newest first
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    displaySearchResults(results);
}

function displaySearchResults(results) {
    const resultsContainer = document.getElementById('searchResults');

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No bills found. Create and print a bill to save it to the database.</p>';
        return;
    }

    let html = `<div class="results-header"><strong>${results.length} bill(s) found</strong></div>`;
    html += '<div class="results-list">';

    results.forEach(bill => {
        const [year, month, day] = bill.billDate.split('-');
        const formattedDate = `${day}-${month}-${year}`;

        html += `
            <div class="result-item">
                <div class="result-header">
                    <strong>Bill No:</strong> ${bill.billNo} | 
                    <strong>Date:</strong> ${formattedDate} | 
                    <strong>Customer:</strong> ${bill.customerName}
                </div>
                <div class="result-services">
                    <table class="result-table">
                        <thead>
                            <tr>
                                <th>Service</th>
                                <th>Rate</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        bill.services.forEach(service => {
            html += `
                <tr>
                    <td>${service.particulars}</td>
                    <td>₹${service.rate.toFixed(2)}</td>
                    <td>₹${service.amount.toFixed(2)}</td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2"><strong>TOTAL</strong></td>
                                <td><strong>₹${bill.total}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div class="result-actions">
                    <button class="btn btn-load" onclick='loadBill(${JSON.stringify(bill)})'>Load Bill</button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    resultsContainer.innerHTML = html;
}

function loadBill(bill) {
    // Load bill data into the form
    document.getElementById('billNo').value = bill.billNo;
    document.getElementById('billDate').value = bill.billDate;
    document.getElementById('customerName').value = bill.customerName === 'N/A' ? '' : bill.customerName;

    // Clear existing rows
    const tableBody = document.getElementById('billTableBody');
    tableBody.innerHTML = '';

    // Add services
    bill.services.forEach((service, index) => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td class="serial-no">${index + 1}</td>
            <td><input type="text" class="particulars" value="${service.particulars}" oninput="calculateTotal()"></td>
            <td><input type="number" class="rate" value="${service.rate}" step="0.01" oninput="calculateRow(this)"></td>
            <td class="amount">${service.amount.toFixed(2)}</td>
            <td class="no-print"><button class="btn-delete" onclick="deleteRow(this)">Delete</button></td>
        `;
    });

    // Add empty rows
    for (let i = 0; i < 3; i++) {
        addRow();
    }

    // Recalculate total
    calculateTotal();

    // Close modal
    closeSearchModal();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('searchModal');
    if (event.target === modal) {
        closeSearchModal();
    }
}
