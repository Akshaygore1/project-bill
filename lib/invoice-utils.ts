import { CreatorOrderGroup } from "@/lib/types";

export const generateInvoiceHTML = (
  creatorGroup: CreatorOrderGroup
): string => {
  const invoiceNumber = `INV-${Date.now()}`;
  const currentDate = new Date().toLocaleDateString();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const orderRows = creatorGroup.orders
    .map(
      (order) => `
    <tr>
      <td>${order.customer?.name || "Unknown Customer"}</td>
      <td>${order.service?.name || "Unknown Service"}</td>
      <td>${order.quantity}</td>
      <td>${formatCurrency(
        parseFloat(order.service.price) * order.quantity
      )}</td>
      <td>${new Date(order.createdAt).toLocaleDateString()}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - ${invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { text-align: right; font-weight: bold; font-size: 18px; }
          .print-button { display: none; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <h2>${invoiceNumber}</h2>
        </div>

        <div class="invoice-details">
          <div>
            <h3>Creator: ${creatorGroup.creatorName}</h3>
            <p>Total Orders: ${creatorGroup.orderCount}</p>
          </div>
          <div>
            <p><strong>Date:</strong> ${currentDate}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Service</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${orderRows}
          </tbody>
        </table>

        <div class="total">
          <p>Total Amount: ${formatCurrency(creatorGroup.totalAmount)}</p>
        </div>

        <div style="margin-top: 50px; text-align: center; color: #666;">
          <p>Thank you for your business!</p>
        </div>

        <button class="print-button" onclick="window.print()">Print Invoice</button>
      </body>
    </html>
  `;
};

export const handleCreateInvoice = (creatorGroup: CreatorOrderGroup) => {
  // Generate invoice HTML
  const invoiceHTML = generateInvoiceHTML(creatorGroup);

  // Open invoice in new window
  const invoiceWindow = window.open("", "_blank", "width=800,height=600");
  if (invoiceWindow) {
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
    invoiceWindow.print();
  }
};
