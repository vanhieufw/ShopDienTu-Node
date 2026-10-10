const pool = require('./db');

class OrdersModel {
  async createOrder(data) {
    const orderCode = 'ORD' + Date.now() + Math.floor(Math.random() * 90 + 10);
    const [r] = await pool.query(
      `INSERT INTO orders
        (OrderCode, FullNameUser, Phone, Province, Ward, AddressDetail, Note,
         IDUser, TotalAmountOrder, ShippingAddressOrder, PaymentMethodOrder, StatusOrder)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Chờ xác nhận')`,
      [
        orderCode,
        data.fullName,
        data.phone,
        data.province || '',
        data.ward || '',
        data.addressDetail || '',
        data.note || '',
        data.userId,
        data.total,
        data.fullAddress || data.address || '',
        data.payment || 'cod'
      ]
    );
    return r.insertId;
  }

  async getOrdersByUser(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM orders WHERE IDUser = ? ORDER BY OrderDateOrder DESC',
      [userId]
    );
    return rows;
  }

  async getAllOrders() {
    const [rows] = await pool.query(
      `SELECT o.*, u.FullNameUser as CustomerName
       FROM orders o
       JOIN users u ON o.IDUser = u.IDUser
       ORDER BY o.OrderDateOrder DESC`
    );
    return rows;
  }

  async getOrderById(id) {
    const [rows] = await pool.query('SELECT * FROM orders WHERE IDOrder = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  async updateStatus(id, status) {
    await pool.query('UPDATE orders SET StatusOrder = ? WHERE IDOrder = ?', [status, id]);
    return true;
  }
}

module.exports = new OrdersModel();
