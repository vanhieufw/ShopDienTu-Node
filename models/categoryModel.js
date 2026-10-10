const pool = require('./db');

class CategoryModel {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY IDCategory DESC');
    return rows;
  }

  async insert(name) {
    const [r] = await pool.query('INSERT INTO categories (NameCategory) VALUES (?)', [name]);
    return r.insertId;
  }

  async update(id, name) {
    await pool.query('UPDATE categories SET NameCategory = ? WHERE IDCategory = ?', [name, id]);
    return true;
  }

  async delete(id) {
    await pool.query('DELETE FROM categories WHERE IDCategory = ?', [id]);
    return true;
  }

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE IDCategory = ? LIMIT 1', [id]);
    return rows[0] || null;
  }
}

module.exports = new CategoryModel();
