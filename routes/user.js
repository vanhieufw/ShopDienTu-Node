const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const productsModel = require("../models/productsModel");
const userModel = require("../models/userModel");
const cartModel = require("../models/cartModel");
const orderModel = require("../models/orderModel");
const { requireLogin } = require("../middleware/auth");

// Cấu hình multer để upload ảnh avatar
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "../public/img/avatars")),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + (file.originalname || "avatar.jpg")),
});
const uploadAvatar = multer({ storage: avatarStorage });

router.get("/", async (req, res) => {
  try {
    const products = await productsModel.get10LatestProducts();
    let totalQty = 0;
    let topSelling = [];
    let featuredProducts = [];
    let recentlyViewed = [];
    try {
      if (req.session.user_id) {
        const cartModel = require("../models/cartModel");
        const cart = await cartModel.getFullCart(req.session.user_id);
        totalQty = cart.totalItems || 0;
      }
      if (typeof productsModel.getTopSelling === "function") {
        topSelling = await productsModel.getTopSelling(3);
      } else {
        topSelling = (products || []).slice(0, 3);
      }
      if (typeof productsModel.getFeatured === "function") {
        featuredProducts = await productsModel.getFeatured(3);
      } else {
        featuredProducts = (products || []).slice(0, 3);
      }
      recentlyViewed = req.session.recentlyViewed || [];
    } catch (err) {
      console.error("home extras", err);
    }
    res.render("user/home", {
      products,
      topSelling,
      featuredProducts,
      recentlyViewed,
      totalQty,
      session: req.session,
      keyword: req.query.keyword || "",
    });
  } catch (e) {
    console.error(e);
    res.status(500).send("Lỗi server");
  }
});

router.get("/shop", async (req, res) => {
  try {
    const products = await productsModel.getAllProducts();
    res.render("user/shop", { products, session: req.session });
  } catch (e) {
    console.error(e);
    res.status(500).send("Lỗi server");
  }
});

router.get("/search", async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const products = await productsModel.searchProducts(keyword);
    res.render("user/viewSearch", { products, keyword, session: req.session });
  } catch (e) {
    console.error(e);
    res.status(500).send("Lỗi server");
  }
});

router.get("/detail", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.redirect("/");
    const product = await productsModel.getProductById(id);
    if (!product) return res.redirect("/");
    if (!req.session.recentlyViewed) req.session.recentlyViewed = [];
    const exists = req.session.recentlyViewed.findIndex(
      (p) => String(p.IDProduct) === String(product.IDProduct),
    );
    if (exists >= 0) req.session.recentlyViewed.splice(exists, 1);
    req.session.recentlyViewed.unshift({
      IDProduct: product.IDProduct,
      NameProduct: product.NameProduct,
      ImageUrlProduct: product.ImageUrlProduct,
      PriceProduct: product.PriceProduct,
      Discount: product.Discount,
    });
    if (req.session.recentlyViewed.length > 3)
      req.session.recentlyViewed = req.session.recentlyViewed.slice(0, 3);
    const relatedProducts = await productsModel.get10LatestProducts();
    const reviews = await productsModel.getReviewsByProductId(id);
    let totalQty = 0;
    try {
      if (req.session.user_id) {
        const cartModel = require("../models/cartModel");
        const cart = await cartModel.getFullCart(req.session.user_id);
        totalQty = cart.totalItems || 0;
      }
    } catch (e) {}
    res.render("user/single-product", {
      product,
      relatedProducts,
      reviews,
      session: req.session,
      totalQty,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send("Lỗi server");
  }
});

router.post("/submit-review", requireLogin, async (req, res) => {
  try {
    const { id_product, name, email, rating, review } = req.body;
    await productsModel.insertReview(id_product, name, email, rating, review);
    res.redirect("/detail?id=" + id_product);
  } catch (e) {
    console.error(e);
    res.status(500).send("Lỗi server");
  }
});

router.get("/login", (req, res) =>
  res.render("Login", { error: null, session: req.session }),
);

router.post("/login", async (req, res) => {
  try {
    const { PhoneNumberUser, PasswordHashUser } = req.body;
    const user = await userModel.getUserByPhone(PhoneNumberUser);
    if (!user)
      return res.render("Login", {
        error: "Số điện thoại không tồn tại!",
        session: req.session,
      });
    if (user.PasswordHashUser !== PasswordHashUser)
      return res.render("Login", {
        error: "Mật khẩu sai!",
        session: req.session,
      });
    req.session.user_id = user.IDUser;
    req.session.user_name = user.FullNameUser;
    req.session.RoleUser = user.RoleUser;
    req.session.PhoneNumberUser = user.PhoneNumberUser;
    if (Number(user.RoleUser) === 1) return res.redirect("/admin/products");
    res.redirect("/");
  } catch (e) {
    console.error(e);
    res.status(500).send("Lỗi server");
  }
});

router.get("/register", (req, res) =>
  res.render("Register", { error: null, session: req.session }),
);

router.post("/register", async (req, res) => {
  try {
    const {
      FullNameUser,
      PhoneNumberUser,
      PasswordHashUser,
      BirthDay,
      EmailUser,
    } = req.body;
    if (await userModel.checkPhoneExists(PhoneNumberUser))
      return res.render("Register", {
        error: "Số điện thoại này đã được đăng ký!",
        session: req.session,
      });
    await userModel.insertUser(
      FullNameUser,
      BirthDay,
      PhoneNumberUser,
      EmailUser || "",
      PasswordHashUser,
    );
    res.redirect("/login");
  } catch (e) {
    console.error(e);
    res.status(500).send("Lỗi server");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

router.get("/cart", requireLogin, async (req, res) => {
  try {
    const cart = await cartModel.getFullCart(req.session.user_id);
    req.session.IDShoppingCart = cart.IDShoppingCart;
    res.render("user/cart", {
      ...cart,
      totalQty: cart.totalItems || 0,
      session: req.session,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send("Lỗi server");
  }
});

router.post("/add-to-cart", requireLogin, async (req, res) => {
  try {
    const productId = parseInt(req.body.product_id || req.query.id, 10);
    const quantity = parseInt(req.body.quantity || 1, 10);
    const cartId = await cartModel.getOrCreateCart(req.session.user_id);
    await cartModel.addToCart(cartId, productId, quantity);
    res.redirect("/cart");
  } catch (e) {
    console.error(e);
    res.status(500).send("Lỗi server");
  }
});

router.get("/cart/remove", requireLogin, async (req, res) => {
  try {
    const cartId = await cartModel.getOrCreateCart(req.session.user_id);
    const pid = req.query.product_id || req.query.remove;
    if (pid === "all" || req.query.clear_cart)
      await cartModel.clearCart(cartId);
    else if (pid) await cartModel.removeFromCart(cartId, parseInt(pid, 10));
    res.redirect("/cart");
  } catch (e) {
    console.error(e);
    res.status(500).send("Lỗi server");
  }
});

router.get("/cart/clear", requireLogin, async (req, res) => {
  try {
    const cartId = await cartModel.getOrCreateCart(req.session.user_id);
    await cartModel.clearCart(cartId);
    res.redirect("/cart");
  } catch (e) {
    console.error(e);
    res.status(500).send("Lỗi server");
  }
});

router.post("/cart/update-qty", requireLogin, async (req, res) => {
  try {
    const cartId =
      req.session.IDShoppingCart ||
      (await cartModel.getOrCreateCart(req.session.user_id));
    const productId = parseInt(req.body.product_id || req.body.IDProduct, 10);
    const quantity = parseInt(req.body.quantity, 10);
    await cartModel.updateQuantity(cartId, productId, quantity);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.json({ success: false, message: e.message });
  }
});

router.post("/ajax/update-quantity", requireLogin, async (req, res) => {
  try {
    const cartId =
      req.session.IDShoppingCart ||
      (await cartModel.getOrCreateCart(req.session.user_id));
    const productId = parseInt(req.body.IDProduct, 10);
    const quantity = Math.max(1, parseInt(req.body.quantity || 1, 10));
    const result = await cartModel.updateQuantity(cartId, productId, quantity);
    res.json({ success: !!result });
  } catch (e) {
    console.error(e);
    res.json({ success: false, message: "Server error" });
  }
});

// ==================== CHECKOUT ====================
router.get("/checkout", requireLogin, async (req, res) => {
  try {
    const cart = await cartModel.getFullCart(req.session.user_id);
    if (!cart.items.length) return res.redirect("/cart");
    req.session.IDShoppingCart = cart.IDShoppingCart;
    const user = await userModel.getUserById(req.session.user_id);
    const errors = req.session.checkout_errors || [];
    req.session.checkout_errors = [];
    res.render("user/checkout", {
      ...cart,
      user,
      currentUserInfo: user,
      totalQty: cart.totalItems || 0,
      session: req.session,
      errors,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send("Lỗi server");
  }
});

// Hàm xử lý đặt hàng – ĐÃ SỬA LỖI SỐ LƯỢNG & TIỀN
async function handlePlaceOrder(req, res) {
  try {
    console.log("===== ORDER BODY =====");
    console.log(req.body);

    const userId = req.session.user_id;
    const cart = await cartModel.getFullCart(userId);
    if (!cart.items.length) return res.redirect("/cart");

    const data = {
      fullName: (req.body.FullNameUser || "").trim(),
      phone: (req.body.Phone || "").trim(),
      province: (req.body.Province || "").trim(),
      ward: (req.body.Ward || "").trim(),
      addressDetail: (req.body.AddressDetail || "").trim(),
      payment: req.body.PaymentMethodOrder || "",
    };

    const required = [
      "fullName",
      "phone",
      "province",
      "ward",
      "addressDetail",
      "payment",
    ];
    const errors = required
      .filter((f) => !data[f])
      .map((f) => f + " là bắt buộc!");

    if (errors.length) {
      req.session.checkout_errors = errors;
      return res.redirect("/checkout");
    }

    const fullAddress = `${data.addressDetail}, ${data.ward}, ${data.province}`;

    // Ép kiểu số an toàn
    const orderTotal = parseInt(cart.orderTotal) || 0;

    const orderId = await orderModel.createOrder(
      userId,
      orderTotal,
      fullAddress,
      data.payment,
    );

    // Sửa lỗi số lượng & đơn giá bị loạn
    for (const item of cart.items) {
      const quantity = parseInt(item.QuantityCartItem) || 1;
      const unitPrice = parseInt(item.PriceProduct) || 0;

      await orderModel.createOrderDetail(
        orderId,
        item.IDProduct,
        item.NameProduct || "", // ← thêm tên sản phẩm
        quantity, // số lượng
        unitPrice, // đơn giá
      );
    }

    await cartModel.clearCart(cart.IDShoppingCart);
    res.redirect("/order-success?id=" + orderId);
  } catch (e) {
    console.error("LỖI ĐẶT HÀNG:", e);
    res.status(500).send("Lỗi server");
  }
}

router.post("/checkout", requireLogin, uploadAvatar.none(), handlePlaceOrder);
router.post(
  "/place-order",
  requireLogin,
  uploadAvatar.none(),
  handlePlaceOrder,
);

router.get("/place-order", requireLogin, (req, res) => {
  res.redirect("/checkout");
});

router.get("/order-success", requireLogin, (req, res) => {
  res.render("user/order_success", {
    orderId: req.query.id,
    session: req.session,
  });
});

router.get("/my-orders", requireLogin, async (req, res) => {
  try {
    const orders = await orderModel.getOrdersByUser(req.session.user_id);
    res.render("user/my_orders", { orders, session: req.session });
  } catch (e) {
    console.error(e);
    res.status(500).send("Lỗi server");
  }
});

router.get("/order-detail", requireLogin, async (req, res) => {
  try {
    const order = await orderModel.getOrderById(req.query.id);
    if (!order || Number(order.IDUser) !== Number(req.session.user_id))
      return res.redirect("/my-orders");
    const details = await orderModel.getOrderDetails(order.IDOrder);
    res.render("user/order_detail", { order, details, session: req.session });
  } catch (e) {
    console.error(e);
    res.status(500).send("Lỗi server");
  }
});

router.get("/about", (req, res) => {
  res.render("user/about", { session: req.session });
});

router.get("/contact", (req, res) => {
  res.render("user/contact", { session: req.session });
});

router.get("/my-account", requireLogin, async (req, res) => {
  try {
    const user = await userModel.getUserById(req.session.user_id);
    let totalQty = 0;
    try {
      const cart = await cartModel.getFullCart(req.session.user_id);
      totalQty = cart.totalItems || 0;
    } catch (e) {}
    res.render("user/my_account", {
      user: user || {},
      session: req.session,
      totalQty,
      success: req.query.success,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send("Lỗi server");
  }
});

// ==================== CẬP NHẬT HỒ SƠ ====================
async function handleUpdateProfile(req, res) {
  try {
    const userId = req.session.user_id;
    if (!userId) return res.redirect("/login");

    console.log("===== DEBUG UPDATE PROFILE =====");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const currentUser = await userModel.getUserById(userId);
    console.log("CURRENT USER:", currentUser);

    if (!currentUser) {
      return res.status(404).send("Không tìm thấy người dùng");
    }

    const b = req.body || {};

    const fullName =
      (b.FullNameUser || "").trim() || currentUser.FullNameUser || "";
    const phone =
      (b.PhoneNumberUser || "").trim() || currentUser.PhoneNumberUser || "";
    const email = (b.EmailUser || "").trim() || currentUser.EmailUser || "";
    const province = (b.Province || "").trim() || currentUser.Province || "";
    const ward = (b.Ward || "").trim() || currentUser.Ward || "";
    const address =
      (b.AddressDetail || "").trim() || currentUser.AddressDetail || "";
    const note = (b.Note || "").trim() || currentUser.Note || "";
    const birthday = b.BirthDay || currentUser.BirthDay || null;

    let gender = currentUser.GenderUser;
    if (b.GenderUser !== undefined && b.GenderUser !== "") {
      gender = b.GenderUser;
    }

    if (!phone) {
      console.log("PHONE RỖNG → dừng lại");
      return res.status(400).send("Số điện thoại không được để trống");
    }

    const avatar = req.file
      ? req.file.filename
      : currentUser.AvatarUser || null;

    console.log("GIÁ TRỊ SẼ UPDATE:", {
      fullName,
      phone,
      email,
      province,
      ward,
      address,
      note,
      birthday,
      gender,
      avatar,
    });

    await userModel.updateUserInfo(
      userId,
      fullName,
      phone,
      email,
      province,
      ward,
      address,
      note,
      birthday,
      gender,
      avatar,
    );

    if (fullName) req.session.user_name = fullName;
    if (avatar) req.session.user_avatar = avatar;

    res.redirect("/my-account?success=1");
  } catch (e) {
    console.error("LỖI CẬP NHẬT:", e);
    res.status(500).send("Lỗi cập nhật hồ sơ: " + e.message);
  }
}

router.post(
  "/update-profile",
  requireLogin,
  uploadAvatar.single("avatar"),
  handleUpdateProfile,
);
router.post(
  "/update_profile",
  requireLogin,
  uploadAvatar.single("avatar"),
  handleUpdateProfile,
);
router.get("/update-profile", requireLogin, (req, res) =>
  res.redirect("/my-account"),
);
router.get("/update_profile", requireLogin, (req, res) =>
  res.redirect("/my-account"),
);

module.exports = router;
