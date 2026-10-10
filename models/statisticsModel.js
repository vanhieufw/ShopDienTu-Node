const pool = require('./db');

class StatisticsModel {
  async getTotalRevenue() {
    const [rows] = await pool.query(
      `SELECT SUM(TotalAmountOrder) as total FROM orders WHERE StatusOrder = 'Hoàn thành'`
    );
    return rows[0].total || 0;
  }

  async countOrders() {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM orders');
    return rows[0].count;
  }

  async countCustomers() {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE RoleUser = 0'
    );
    return rows[0].count;
  }

  async getMonthlyRevenue() {
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(OrderDateOrder, '%Y-%m') as month,
              SUM(TotalAmountOrder) as revenue
       FROM orders
       WHERE StatusOrder = 'Hoàn thành'
       GROUP BY month
       ORDER BY month ASC
       LIMIT 12`
    );
    return rows;
  }

  async getOrderStatusStats() {
    const [rows] = await pool.query(
      `SELECT StatusOrder, COUNT(*) as quantity FROM orders GROUP BY StatusOrder`
    );
    return rows;
  }
}

module.exports = new StatisticsModel();
