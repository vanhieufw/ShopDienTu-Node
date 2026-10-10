-- Chạy trong phpMyAdmin nếu chưa có 2 bảng giỏ hàng
CREATE TABLE IF NOT EXISTS ShoppingCarts (
  IDShoppingCart BIGINT AUTO_INCREMENT PRIMARY KEY,
  IDUser BIGINT NOT NULL,
  FOREIGN KEY (IDUser) REFERENCES users(IDUser)
);

CREATE TABLE IF NOT EXISTS CartItems (
  IDCartItem BIGINT AUTO_INCREMENT PRIMARY KEY,
  IDShoppingCart BIGINT NOT NULL,
  IDProduct BIGINT NOT NULL,
  QuantityCartItem INT NOT NULL DEFAULT 1,
  FOREIGN KEY (IDShoppingCart) REFERENCES ShoppingCarts(IDShoppingCart) ON DELETE CASCADE,
  FOREIGN KEY (IDProduct) REFERENCES products(IDProduct)
);
