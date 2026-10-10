const pool = require('./db');

class CartModel {
  async getOrCreateCart(userId) {
    const [rows] = await pool.query(
      'SELECT IDShoppingCart FROM ShoppingCarts WHERE IDUser = ? LIMIT 1',
      [userId]
    );
    if (rows.length) return rows[0].IDShoppingCart;
    const [r] = await pool.query('INSERT INTO ShoppingCarts (IDUser) VALUES (?)', [userId]);
    return r.insertId;
  }

  async getCartItems(cartId) {
    const [rows] = await pool.query(
      `SELECT ci.*, p.NameProduct, p.PriceProduct, p.ImageUrlProduct, p.StockQuantityProduct, p.Discount
       FROM CartItems ci
       JOIN products p ON ci.IDProduct = p.IDProduct
       WHERE ci.IDShoppingCart = ?`,
      [cartId]
    );
    return rows;
  }

  async getCartCount(cartId) {
    const [rows] = await pool.query(
      'SELECT SUM(QuantityCartItem) AS total FROM CartItems WHERE IDShoppingCart = ?',
      [cartId]
    );
    return rows[0].total || 0;
  }

  async addToCart(cartId, productId, quantity = 1) {
    const [ex] = await pool.query(
      'SELECT QuantityCartItem FROM CartItems WHERE IDShoppingCart = ? AND IDProduct = ?',
      [cartId, productId]
    );
    if (ex.length) {
      await pool.query(
        'UPDATE CartItems SET QuantityCartItem = QuantityCartItem + ? WHERE IDShoppingCart = ? AND IDProduct = ?',
        [quantity, cartId, productId]
      );
    } else {
      await pool.query(
        'INSERT INTO CartItems (IDShoppingCart, IDProduct, QuantityCartItem) VALUES (?, ?, ?)',
        [cartId, productId, quantity]
      );
    }
    return true;
  }

  async updateQuantity(cartId, productId, quantity) {
    quantity = Math.max(1, quantity);
    const [ex] = await pool.query(
      'SELECT IDCartItem FROM CartItems WHERE IDShoppingCart = ? AND IDProduct = ?',
      [cartId, productId]
    );
    if (ex.length) {
      await pool.query(
        'UPDATE CartItems SET QuantityCartItem = ? WHERE IDShoppingCart = ? AND IDProduct = ?',
        [quantity, cartId, productId]
      );
    } else {
      await pool.query(
        'INSERT INTO CartItems (IDShoppingCart, IDProduct, QuantityCartItem) VALUES (?, ?, ?)',
        [cartId, productId, quantity]
      );
    }
    return true;
  }

  async removeFromCart(cartId, productId) {
    await pool.query(
      'DELETE FROM CartItems WHERE IDShoppingCart = ? AND IDProduct = ?',
      [cartId, productId]
    );
    return true;
  }

  async clearCart(cartId) {
    await pool.query('DELETE FROM CartItems WHERE IDShoppingCart = ?', [cartId]);
    return true;
  }

  async getFullCart(userId) {
    const cartId = await this.getOrCreateCart(userId);
    const items = await this.getCartItems(cartId);
    let subtotal = 0;
    let totalItems = 0;
    items.forEach((it) => {
      const price = Number(it.PriceProduct) || 0;
      const disc = it.Discount != null ? Number(it.Discount) : 0;
      const unit = (price * (100 - disc)) / 100;
      const qty = Number(it.QuantityCartItem) || 0;
      subtotal += unit * qty;
      totalItems += qty;
    });
    const vat = Math.round(subtotal * 0.05);
    return {
      items,
      cartItems: items,
      subtotal,
      cartSubtotal: subtotal,
      vat,
      cartTax: vat,
      orderTotal: subtotal + vat,
      cartTotal: subtotal + vat,
      totalItems,
      cartCount: totalItems,
      totalQty: totalItems,
      IDShoppingCart: cartId
    };
  }
}

module.exports = new CartModel();
