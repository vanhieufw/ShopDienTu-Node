const pool = require('./db');

class ProductsModel {
  async getAllProducts() {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY IDProduct DESC');
    return rows;
  }

  async getProductsByFilter(start, limit, catId = 0) {
    let sql = 'SELECT * FROM products';
    const params = [];
    if (catId > 0) {
      sql += ' WHERE IDCategory = ?';
      params.push(catId);
    }
    sql += ' ORDER BY IDProduct DESC LIMIT ?, ?';
    params.push(start, limit);
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async get10LatestProducts() {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY IDProduct DESC LIMIT 10');
    return rows;
  }

  async searchProducts(keyword, categoryId = 0) {
    let sql = 'SELECT * FROM products WHERE NameProduct LIKE ?';
    const params = [`%${keyword}%`];
    if (categoryId > 0) {
      sql += ' AND IDCategory = ?';
      params.push(categoryId);
    }
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async getProductById(id) {
    const [rows] = await pool.query(
      `SELECT p.*, c.NameCategory
       FROM products p
       LEFT JOIN categories c ON p.IDCategory = c.IDCategory
       WHERE p.IDProduct = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  async insertProduct(name, price, stock, desc, image, category) {
    const [r] = await pool.query(
      `INSERT INTO products (NameProduct, PriceProduct, StockQuantityProduct, DescriptionProduct, ImageUrlProduct, IDCategory)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, price, stock, desc, image, category]
    );
    return r.insertId;
  }

  async updateProduct(id, name, price, stock, desc, image, category) {
    if (image) {
      await pool.query(
        `UPDATE products SET NameProduct=?, PriceProduct=?, StockQuantityProduct=?, DescriptionProduct=?, ImageUrlProduct=?, IDCategory=? WHERE IDProduct=?`,
        [name, price, stock, desc, image, category, id]
      );
    } else {
      await pool.query(
        `UPDATE products SET NameProduct=?, PriceProduct=?, StockQuantityProduct=?, DescriptionProduct=?, IDCategory=? WHERE IDProduct=?`,
        [name, price, stock, desc, category, id]
      );
    }
    return true;
  }

  async deleteProduct(id) {
    await pool.query('DELETE FROM products WHERE IDProduct = ?', [id]);
    return true;
  }

  async countTotalProducts(catId = 0) {
    let sql = 'SELECT COUNT(*) as total FROM products';
    const params = [];
    if (catId > 0) {
      sql += ' WHERE IDCategory = ?';
      params.push(catId);
    }
    const [rows] = await pool.query(sql, params);
    return rows[0].total;
  }

  async getReviewsByProductId(id) {
    const [rows] = await pool.query(
      'SELECT * FROM reviews WHERE IDProduct = ? ORDER BY IDReview DESC',
      [id]
    );
    return rows;
  }

  async insertReview(idProduct, name, email, rating, content) {
    const [r] = await pool.query(
      `INSERT INTO reviews (IDProduct, NameComment, EmailComment, Rating, Content)
       VALUES (?, ?, ?, ?, ?)`,
      [idProduct, name, email, rating, content]
    );
    return r.insertId;
  }

  async decreaseStock(productId, quantity) {
    try {
      await pool.query('UPDATE products SET StockQuantityProduct = StockQuantityProduct - ? WHERE IDProduct = ?', [quantity, productId]);
    } catch (e) {
      await pool.query('UPDATE products SET QuantityProduct = QuantityProduct - ? WHERE IDProduct = ?', [quantity, productId]);
    }
    return true;
  }

  async increaseSold(productId, quantity) {
    await pool.query('UPDATE products SET Sold = Sold + ? WHERE IDProduct = ?', [quantity, productId]);
    return true;
  }

  async getAllReviews() {
    const [rows] = await pool.query(
      `SELECT r.*, p.NameProduct, p.ImageUrlProduct
       FROM reviews r
       INNER JOIN products p ON r.IDProduct = p.IDProduct
       ORDER BY r.IDReview DESC`
    );
    return rows;
  }

  async deleteReview(id) {
    await pool.query('DELETE FROM reviews WHERE IDReview = ?', [id]);
    return true;
  }

  async getProductsByCategory(idCat) {
    const [rows] = await pool.query('SELECT * FROM products WHERE IDCategory = ?', [idCat]);
    return rows;
  }

  async getTopSelling(limit = 3) {
    const [rows] = await pool.query(
      `SELECT IDProduct, NameProduct, PriceProduct, Discount, ImageUrlProduct, Sold
       FROM products
       WHERE IsActiveProduct = 1 OR IsActiveProduct IS NULL
       ORDER BY Sold DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  async getTopSellingProducts(limit = 3) {
    return this.getTopSelling(limit);
  }

  async getMostReviewedProducts(limit = 3) {
    const [rows] = await pool.query(
      `SELECT p.IDProduct, p.NameProduct, p.PriceProduct, p.Discount, p.ImageUrlProduct,
              COUNT(r.IDReview) AS review_count
       FROM products p
       LEFT JOIN reviews r ON p.IDProduct = r.IDProduct
       WHERE p.IsActiveProduct = 1 OR p.IsActiveProduct IS NULL
       GROUP BY p.IDProduct
       ORDER BY review_count DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  async getFeatured(limit = 3) {
    return this.getMostReviewedProducts(limit);
  }

  async updateDiscount(id, discount) {
    await pool.query('UPDATE products SET Discount = ? WHERE IDProduct = ?', [discount, id]);
    return true;
  }

  // ==================== ĐƠN HÀNG ====================
  async getAllOrders() {
    const [rows] = await pool.query(`
      SELECT o.*, u.FullNameUser, u.PhoneNumberUser
      FROM orders o
      LEFT JOIN users u ON o.IDUser = u.IDUser
      ORDER BY o.OrderDateOrder DESC
    `);
    return rows;
  }

  async getOrderById(id) {
    const [rows] = await pool.query(`
      SELECT o.*, u.FullNameUser, u.PhoneNumberUser
      FROM orders o
      LEFT JOIN users u ON o.IDUser = u.IDUser
      WHERE o.IDOrder = ?
    `, [id]);
    return rows[0] || null;
  }

  async getOrderDetails(orderId) {
    const [rows] = await pool.query(`
      SELECT od.*, p.NameProduct, p.ImageUrlProduct
      FROM order_details od
      LEFT JOIN products p ON od.IDProduct = p.IDProduct
      WHERE od.IDOrder = ?
    `, [orderId]);
    return rows;
  }

  async updateOrderStatus(id, status) {
    await pool.query(`UPDATE orders SET StatusOrder = ? WHERE IDOrder = ?`, [status, id]);
    return true;
  }

  // ==================== THỐNG KÊ ====================
  async getTotalRevenue() {
    const [rows] = await pool.query(`
      SELECT SUM(TotalAmountOrder) as total 
      FROM orders 
      WHERE StatusOrder IN ('Hoàn thành', 'Giao hàng thành công')
    `);
    return rows[0].total || 0;
  }

  async getTotalOrders() {
    const [rows] = await pool.query(`SELECT COUNT(*) as total FROM orders`);
    return rows[0].total || 0;
  }

  async getTotalCustomers() {
    const [rows] = await pool.query(`
      SELECT COUNT(*) as total FROM users 
      WHERE RoleUser = 0 OR RoleUser IS NULL
    `);
    return rows[0].total || 0;
  }
}

module.exports = new ProductsModel();