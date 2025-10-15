import {
  CreatorOrderGroup,
  CreatorCustomerOrderGroup,
  CustomerOrderGroup,
} from "@/lib/types";

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

  // Group orders by customer within the creator
  const ordersByCustomer = creatorGroup.orders.reduce((acc, order) => {
    const customerName = order.customer?.name || "Unknown Customer";
    const customerId = order.customer_id;

    if (!acc[customerId]) {
      acc[customerId] = {
        customerName,
        orders: [],
        customerTotal: 0,
      };
    }

    const orderTotal = parseFloat(order.service.price) * order.quantity;
    acc[customerId].orders.push(order);
    acc[customerId].customerTotal += orderTotal;

    return acc;
  }, {} as Record<string, { customerName: string; orders: typeof creatorGroup.orders; customerTotal: number }>);

  const orderRows = Object.values(ordersByCustomer)
    .map((customerGroup) => {
      // Customer header row
      const customerHeader = `
    <tr class="customer-header">
      <td colspan="5" class="font-semibold bg-gray-50 border-t-2 border-gray-300 py-2">
        ${customerGroup.customerName} - Total: ${formatCurrency(
        customerGroup.customerTotal
      )}
      </td>
    </tr>
  `;

      // Individual order rows for this customer
      const customerOrderRows = customerGroup.orders
        .map(
          (order) => `
    <tr>
      <td class="pl-4">${order.customer?.name || "Unknown Customer"}</td>
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

      return customerHeader + customerOrderRows;
    })
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
          .customer-header td { font-weight: bold; background-color: #f8f9fa !important; }
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

export const generateInvoiceHTMLForCreatorCustomer = (
  creatorCustomerGroup: CreatorCustomerOrderGroup
): string => {
  const invoiceNumber = `INV-${Date.now()}`;
  const currentDate = new Date().toLocaleDateString();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const orderRows = creatorCustomerGroup.orders
    .map(
      (order) => `
    <tr>
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
            <h3>Creator: ${creatorCustomerGroup.creatorName}</h3>
            <h3>Customer: ${creatorCustomerGroup.customerName}</h3>
            <p>Total Orders: ${creatorCustomerGroup.orderCount}</p>
          </div>
          <div>
            <p><strong>Date:</strong> ${currentDate}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
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
          <p>Total Amount: ${formatCurrency(
            creatorCustomerGroup.totalAmount
          )}</p>
        </div>

        <div style="margin-top: 50px; text-align: center; color: #666;">
          <p>Thank you for your business!</p>
        </div>

        <button class="print-button" onclick="window.print()">Print Invoice</button>
      </body>
    </html>
  `;
};

export const handleCreateInvoiceForCreatorCustomer = (
  creatorCustomerGroup: CreatorCustomerOrderGroup
) => {
  // Generate invoice HTML
  const invoiceHTML =
    generateInvoiceHTMLForCreatorCustomer(creatorCustomerGroup);

  // Open invoice in new window
  const invoiceWindow = window.open("", "_blank", "width=800,height=600");
  if (invoiceWindow) {
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
    invoiceWindow.print();
  }
};

export const generateInvoiceHTMLForCustomer = (
  customerGroup: CustomerOrderGroup
): string => {
  const invoiceNumber = `INV-CUSTOMER-${
    customerGroup.customerId
  }-${Date.now()}`;
  const currentDate = new Date().toLocaleDateString();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Group orders by creator within the customer invoice
  const ordersByCreator = customerGroup.orders.reduce(
    (
      acc: Record<
        string,
        { creatorName: string; orders: any[]; creatorTotal: number }
      >,
      order
    ) => {
      const creatorName = order.createdByUser?.name || "Unknown User";
      const creatorId = order.created_by;

      if (!acc[creatorId]) {
        acc[creatorId] = {
          creatorName,
          orders: [],
          creatorTotal: 0,
        };
      }

      const orderTotal = parseFloat(order.service.price) * order.quantity;
      acc[creatorId].orders.push(order);
      acc[creatorId].creatorTotal += orderTotal;

      return acc;
    },
    {}
  );

  const orderRows = Object.values(ordersByCreator)
    .map(
      (creatorGroup: {
        creatorName: string;
        orders: any[];
        creatorTotal: number;
      }) => {
        // Creator header row
        const creatorHeader = `
    <tr class="creator-header">
      <td colspan="4" class="font-semibold bg-blue-50 border-t-2 border-blue-300 py-2">
        Creator: ${creatorGroup.creatorName} - Total: ${formatCurrency(
          creatorGroup.creatorTotal
        )}
      </td>
    </tr>
  `;

        // Individual order rows for this creator
        const creatorOrderRows = creatorGroup.orders
          .map(
            (order: any) => `
    <tr>
      <td class="pl-4">${order.service?.name || "Unknown Service"}</td>
      <td>${order.quantity}</td>
      <td>${formatCurrency(
        parseFloat(order.service.price) * order.quantity
      )}</td>
      <td>${new Date(order.createdAt).toLocaleDateString()}</td>
    </tr>
  `
          )
          .join("");

        return creatorHeader + creatorOrderRows;
      }
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
          .creator-header td { font-weight: bold; background-color: #e3f2fd !important; }
          .total { text-align: right; font-weight: bold; font-size: 18px; }
          .print-button { display: none; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CUSTOMER INVOICE</h1>
          <h2>${invoiceNumber}</h2>
        </div>

        <div class="invoice-details">
          <div>
            <h3>Customer: ${customerGroup.customerName}</h3>
            <p>Total Orders: ${customerGroup.orderCount}</p>
          </div>
          <div>
            <p><strong>Date:</strong> ${currentDate}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
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
          <p>Total Amount: ${formatCurrency(customerGroup.totalAmount)}</p>
        </div>

        <div style="margin-top: 50px; text-align: center; color: #666;">
          <p>Thank you for your business!</p>
        </div>

        <button class="print-button" onclick="window.print()">Print Invoice</button>
      </body>
    </html>
  `;
};

export const handleCreateInvoiceForCustomer = (
  customerGroup: CustomerOrderGroup
) => {
  // Generate invoice HTML
  const invoiceHTML = generateInvoiceHTMLForCustomer(customerGroup);

  // Open invoice in new window
  const invoiceWindow = window.open("", "_blank", "width=800,height=600");
  if (invoiceWindow) {
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
    invoiceWindow.print();
  }
};
