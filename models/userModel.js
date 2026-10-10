const pool = require('./db');
const bcrypt = require('bcryptjs');

class UserModel {
  async insertUser(FullNameUser, BirthDay, PhoneNumberUser, EmailUser, PasswordHashUser) {
    const [r] = await pool.query(
      `INSERT INTO users (FullNameUser, BirthDay, PhoneNumberUser, EmailUser, PasswordHashUser)
       VALUES (?, ?, ?, ?, ?)`,
      [FullNameUser, BirthDay, PhoneNumberUser, EmailUser, PasswordHashUser]
    );
    return r.insertId;
  }

  async getUserByPhone(phone) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE PhoneNumberUser = ? LIMIT 1',
      [phone]
    );
    return rows[0] || null;
  }

  async checkPhoneExists(phone) {
    const [rows] = await pool.query(
      'SELECT IDUser FROM users WHERE PhoneNumberUser = ? LIMIT 1',
      [phone]
    );
    return rows.length > 0;
  }

  async getUserByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE EmailUser = ? LIMIT 1',
      [email]
    );
    return rows[0] || null;
  }

  async updateResetCode(email, code) {
    const expire = new Date(Date.now() + 15 * 60 * 1000);
    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expire = ? WHERE EmailUser = ?',
      [code, expire, email]
    );
    return true;
  }

  async verifyCode(email, code) {
    const [rows] = await pool.query(
      `SELECT * FROM users
       WHERE EmailUser = ? AND reset_token = ? AND reset_token_expire > NOW()
       LIMIT 1`,
      [email, code]
    );
    return rows[0] || null;
  }

  async updatePasswordByEmail(email, newPass) {
    await pool.query(
      `UPDATE users SET PasswordHashUser = ?, reset_token = NULL, reset_token_expire = NULL
       WHERE EmailUser = ?`,
      [newPass, email]
    );
    return true;
  }

  async getUserById(userId) {
    const [rows] = await pool.query('SELECT * FROM users WHERE IDUser = ? LIMIT 1', [userId]);
    return rows[0] || null;
  }

  async updateUserInfo(userId, fullname, phone, email, province, ward, addressDetail, note, birthday, gender, avatar = null) {
    if (avatar) {
      await pool.query(
        `UPDATE users SET
          FullNameUser=?, PhoneNumberUser=?, EmailUser=?,
          Province=?, Ward=?, AddressDetail=?, Note=?,
          BirthDay=?, GenderUser=?, AvatarUser=?
         WHERE IDUser=?`,
        [fullname, phone, email, province, ward, addressDetail, note, birthday, gender, avatar, userId]
      );
    } else {
      await pool.query(
        `UPDATE users SET
          FullNameUser=?, PhoneNumberUser=?, EmailUser=?,
          Province=?, Ward=?, AddressDetail=?, Note=?,
          BirthDay=?, GenderUser=?
         WHERE IDUser=?`,
        [fullname, phone, email, province, ward, addressDetail, note, birthday, gender, userId]
      );
    }
    return true;
  }

  // helpers đăng ký / đăng nhập
  async register({ fullName, phone, email, password, birthday }) {
    const hash = await bcrypt.hash(password, 10);
    return this.insertUser(fullName, birthday || null, phone, email, hash);
  }

  async loginByPhone(phone, password) {
    const user = await this.getUserByPhone(phone);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.PasswordHashUser);
    if (!ok) {
      // fallback nếu DB lưu plain text (PHP cũ)
      if (user.PasswordHashUser !== password) return null;
    }
    return user;
  }
}

module.exports = new UserModel();
