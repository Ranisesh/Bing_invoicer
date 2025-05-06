async function loadData() {
    try {
        const customers = await fetch('customers.json').then(res => res.json());
        const products = await fetch('products.json').then(res => res.json());

        const customerSelect = document.getElementById("customerSelect");
        customers.forEach(c => {
            const option = document.createElement("option");
            option.value = c.id;
            option.textContent = c.name;
            customerSelect.appendChild(option);
        });

        const productSelect = document.getElementById("productSelect");
        products.forEach(p => {
            const option = document.createElement("option");
            option.value = p.id;
            option.textContent = `${p.name} - ₹${p.price}`;
            productSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Error loading data:", error);
    }
}

let invoiceItems = [];

function addToInvoice() {
    const productId = document.getElementById("productSelect").value;
    const quantity = parseInt(document.getElementById("quantity").value);

    fetch('products.json').then(res => res.json()).then(products => {
        const product = products.find(p => p.id == productId);
        if (product) {
            invoiceItems.push({ 
                name: product.name, 
                quantity, 
                price: product.price, 
                total: product.price * quantity 
            });
            console.log("Updated Invoice Items:", invoiceItems); // ✅ Debugging
            renderInvoice();
        }
    });
}

function renderInvoice() {
    let total = 0;
    let productHTML = "";
    invoiceItems.forEach(item => {
        productHTML += `<div>${item.name} x ${item.quantity} <span>₹${item.total}</span></div>`;
        total += item.total;
    });

    document.getElementById("productList").innerHTML = productHTML;
    document.getElementById("totalAmount").innerHTML = `Total: ₹${total}`;
}

function saveInvoice() {
    const customerId = document.getElementById("customerSelect").value;

    fetch('customers.json').then(res => res.json()).then(customers => {
        const customer = customers.find(c => c.id == customerId);
        if (customer) {
            const invoice = {
                customer: customer.name,
                phone: customer.phone,
                email: customer.email,
                items: [...invoiceItems], // ✅ Ensuring items are stored correctly
                total: invoiceItems.reduce((sum, item) => sum + item.total, 0),
                date: new Date().toISOString().split("T")[0]
            };

            localStorage.setItem(`invoice_${Date.now()}`, JSON.stringify(invoice)); // ✅ Fixed: Store invoices properly
            alert("Invoice saved successfully!");
        }
    });
}

// 📌 **Fixed Print Invoice Function**
function printInvoice() {
    let invoices = [];
    for (let key in localStorage) {
        if (key.startsWith("invoice_")) {
            invoices.push(JSON.parse(localStorage.getItem(key)));
        }
    }

    let latestInvoice = invoices[invoices.length - 1]; // ✅ Get most recent invoice

    console.log("Invoice Items at Print:", latestInvoice?.items); // ✅ Debugging check

    if (!latestInvoice || !latestInvoice.items || latestInvoice.items.length === 0) {
        alert("No items in the invoice! Please add products first.");
        return;
    }

    let customerName = latestInvoice.customer;
    let customerPhone = latestInvoice.phone;

    let printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
        <head>
            <title>Invoice</title>
            <style>
                body { font-family: Arial, sans-serif; width: 90%; margin: auto; padding: 20px; }
                h2, p { text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid black; padding: 8px; text-align: center; }
                .total { font-weight: bold; text-align: right; padding-top: 10px; }
            </style>
        </head>
        <body>
            <h2>Bing Invoicer Hyderabad</h2>
            <p>Phone: 9440624409 | Email: seshqtx@gmail.com</p>

            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Phone:</strong> ${customerPhone}</p>

            <table>
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
                ${latestInvoice.items.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price}</td>
                    <td>₹${item.total}</td>
                </tr>`).join('')}
            </table>

            <p class="total">Total Amount: ₹${latestInvoice.total}</p>

            <p style="text-align: center;">Thank you for your purchase!</p>
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.print();
}

// 📌 **Fixed Daily Sales Summary**
function dailySalesSummary() {
    let invoices = [];
    for (let key in localStorage) {
        if (key.startsWith("invoice_")) {
            invoices.push(JSON.parse(localStorage.getItem(key)));
        }
    }
    let today = new Date().toISOString().split("T")[0];
    let salesToday = invoices.filter(inv => inv.date === today);

    let totalSales = salesToday.reduce((sum, inv) => sum + inv.total, 0);
    alert(`📊 Daily Sales Summary (${today}):\nTotal Sales: ₹${totalSales}\nInvoices: ${salesToday.length}`);
}

// 📌 **Fixed Customer Sales Report**
function customerSalesSummary() {
    let invoices = [];
    for (let key in localStorage) {
        if (key.startsWith("invoice_")) {
            invoices.push(JSON.parse(localStorage.getItem(key)));
        }
    }
    let selectedCustomer = document.getElementById("customerSelect").selectedOptions[0].text;
    let customerInvoices = invoices.filter(inv => inv.customer === selectedCustomer);

    let totalSpent = customerInvoices.reduce((sum, inv) => sum + inv.total, 0);
    alert(`📊 Customer Sales Summary for ${selectedCustomer}:\nTotal Spent: ₹${totalSpent}\nInvoices: ${customerInvoices.length}`);
}

loadData();