const pool = require("./db");

class OrderModel {
  /**
   * Tạo đơn hàng (giữ API cũ cho routes/user.js)
   * createOrder(userId, total, shippingAddress, paymentMethod)
   * hoặc createOrder({ fullName, phone, ... })
   */
  async createOrder(userIdOrData, total, shippingAddress, paymentMethod) {
    if (typeof userIdOrData === "object" && userIdOrData !== null) {
      const data = userIdOrData;
      const orderCode =
        "ORD" + Date.now() + Math.floor(Math.random() * 90 + 10);
      const [r] = await pool.query(
        `INSERT INTO orders
          (OrderCode, FullNameUser, Phone, Province, Ward, AddressDetail, Note,
           IDUser, TotalAmountOrder, ShippingAddressOrder, PaymentMethodOrder, StatusOrder)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Chờ xác nhận')`,
        [
          orderCode,
          data.fullName || "",
          data.phone || "",
          data.province || "",
          data.ward || "",
          data.addressDetail || "",
          data.note || "",
          data.userId,
          data.total,
          data.fullAddress || data.address || shippingAddress || "",
          data.payment || paymentMethod || "cod",
        ],
      );
      return r.insertId;
    }

    // API cũ: createOrder(userId, total, shippingAddress, paymentMethod)
    const orderCode = "ORD" + Date.now() + Math.floor(Math.random() * 90 + 10);
    const [r] = await pool.query(
      `INSERT INTO orders
        (OrderCode, IDUser, TotalAmountOrder, ShippingAddressOrder, PaymentMethodOrder, StatusOrder)
       VALUES (?, ?, ?, ?, ?, 'Chờ xác nhận')`,
      [
        orderCode,
        userIdOrData,
        total,
        shippingAddress || "",
        paymentMethod || "cod",
      ],
    );
    return r.insertId;
  }

  async createOrderDetail(orderId, productId, name, quantity, price) {
    const subtotal = Number(price) * Number(quantity);
    await pool.query(
      `INSERT INTO order_details
        (IDOrder, IDProduct, NameProduct, QuantityOrderDetail, UnitPriceOrderDetail, SubtotalOrderDetail)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, productId, name, quantity, price, subtotal],
    );
    return true;
  }

  // alias
  async addDetail(orderId, productId, name, quantity, price) {
    return this.createOrderDetail(orderId, productId, name, quantity, price);
  }

  async getOrdersByUser(userId) {
    const [rows] = await pool.query(
      "SELECT * FROM orders WHERE IDUser = ? ORDER BY OrderDateOrder DESC",
      [userId],
    );
    return rows;
  }
  async updateStatus(id, status) {
    await pool.query("UPDATE orders SET StatusOrder = ? WHERE IDOrder = ?", [
      status,
      id,
    ]);
    return true;
  }
  async getOrderById(id) {
    const [rows] = await pool.query(
      "SELECT * FROM orders WHERE IDOrder = ? LIMIT 1",
      [id],
    );
    return rows[0] || null;
  }

  async getOrderDetails(orderId) {
    const [rows] = await pool.query(
      "SELECT * FROM order_details WHERE IDOrder = ?",
      [orderId],
    );
    return rows;
  }

  async getDetailsByOrder(orderId) {
    return this.getOrderDetails(orderId);
  }

  async getAllOrders() {
    const [rows] = await pool.query(
      `SELECT o.*, u.FullNameUser as CustomerName
       FROM orders o
       LEFT JOIN users u ON o.IDUser = u.IDUser
       ORDER BY o.OrderDateOrder DESC`,
    );
    return rows;
  }

  async updateStatus(id, status) {
    await pool.query("UPDATE orders SET StatusOrder = ? WHERE IDOrder = ?", [
      status,
      id,
    ]);
    return true;
  }
}

module.exports = new OrderModel();
