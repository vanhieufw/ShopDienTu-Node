const pool = require('./db');

class OrderDetailsModel {
  async addDetail(orderId, productId, name, quantity, price) {
    const subtotal = price * quantity;
    await pool.query(
      `INSERT INTO order_details
        (IDOrder, IDProduct, NameProduct, QuantityOrderDetail, UnitPriceOrderDetail, SubtotalOrderDetail)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, productId, name, quantity, price, subtotal]
    );
    return true;
  }

  async getDetailsByOrder(orderId) {
    const [rows] = await pool.query(
      'SELECT * FROM order_details WHERE IDOrder = ?',
      [orderId]
    );
    return rows;
  }
}

module.exports = new OrderDetailsModel();
