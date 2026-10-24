const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const productsModel = require('../models/productsModel');
const categoryModel = require('../models/categoryModel');
const { requireAdmin } = require('../middleware/auth');

// Cấu hình upload ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/img')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + (file.originalname || 'img'))
});
const upload = multer({ storage });

router.use(requireAdmin);

// ==================== SẢN PHẨM ====================
router.get('/products', async (req, res) => {
  try {
    const products = await productsModel.getAllProducts();
    res.render('admin/sanpham', { products, session: req.session, active: 'products' });
  } catch (e) {
    console.error(e);
    res.status(500).send('Lỗi server');
  }
});

router.get('/products/create', async (req, res) => {
  try {
    const categories = await categoryModel.getAll();
    res.render('admin/them_san_pham', { product: null, categories, session: req.session, active: 'products' });
  } catch (e) {
    console.error(e);
    res.status(500).send('Lỗi server');
  }
});

router.get('/products/edit', async (req, res) => {
  try {
    const product = await productsModel.getProductById(req.query.id);
    const categories = await categoryModel.getAll();
    res.render('admin/them_san_pham', { product, categories, session: req.session, active: 'products' });
  } catch (e) {
    console.error(e);
    res.status(500).send('Lỗi server');
  }
});

router.post('/products/store', upload.single('ImageUrlProduct'), async (req, res) => {
  try {
    const { id, NameProduct, PriceProduct, StockQuantityProduct, DescriptionProduct, IDCategory } = req.body;
    const image = req.file ? req.file.filename : '';
    if (id) {
      await productsModel.updateProduct(id, NameProduct, PriceProduct, StockQuantityProduct, DescriptionProduct, image, IDCategory);
    } else {
      await productsModel.insertProduct(NameProduct, PriceProduct, StockQuantityProduct, DescriptionProduct, image, IDCategory);
    }
    res.redirect('/admin/products');
  } catch (e) {
    console.error(e);
    res.status(500).send('Lỗi server');
  }
});

router.get('/products/delete', async (req, res) => {
  try {
    await productsModel.deleteProduct(req.query.id);
    res.redirect('/admin/products');
  } catch (e) {
    console.error(e);
    res.status(500).send('Lỗi server');
  }
});

// ==================== DANH MỤC ====================
router.get('/categories', async (req, res) => {
  try {
    const categories = await categoryModel.getAll();
    res.render('admin/danhmuc', { categories, session: req.session, active: 'categories' });
  } catch (e) {
    console.error(e);
    res.status(500).send('Lỗi server');
  }
});

router.post('/categories/store', async (req, res) => {
  try {
    const { NameCategory, id } = req.body;
    if (id) await categoryModel.update(id, NameCategory);
    else await categoryModel.insert(NameCategory);
    res.redirect('/admin/categories');
  } catch (e) {
    console.error(e);
    res.status(500).send('Lỗi server');
  }
});

router.get('/categories/delete', async (req, res) => {
  try {
    await categoryModel.delete(req.query.id);
    res.redirect('/admin/categories');
  } catch (e) {
    console.error(e);
    res.status(500).send('Lỗi server');
  }
});

// ==================== ĐÁNH GIÁ ====================
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await productsModel.getAllReviews();
    res.render('admin/danhgia', { reviews, session: req.session, active: 'reviews' });
  } catch (e) {
    console.error(e);
    res.status(500).send('Lỗi server');
  }
});

router.get('/reviews/delete', async (req, res) => {
  try {
    await productsModel.deleteReview(req.query.id);
    res.redirect('/admin/reviews');
  } catch (e) {
    console.error(e);
    res.status(500).send('Lỗi server');
  }
});

// ==================== ĐƠN HÀNG ====================
router.get('/orders', async (req, res) => {
  try {
    const orders = await productsModel.getAllOrders();
    res.render('admin/admin_orders', { orders, session: req.session, active: 'orders' });
  } catch (e) {
    console.error(e);
    res.status(500).send('Lỗi server');
  }
});

router.get('/orders/detail', async (req, res) => {
  try {
    const order = await productsModel.getOrderById(req.query.id);
    if (!order) return res.redirect('/admin/orders');
    const items = await productsModel.getOrderDetails(req.query.id);
    res.render('admin/Admin_order_Detail', { order, items, session: req.session, active: 'orders' });
  } catch (e) {
    console.error(e);
    res.status(500).send('Lỗi server');
  }
});

// Các action xử lý trạng thái đơn hàng (tùy model của bạn)
router.get('/orders/confirm', async (req, res) => {
  try {
    await productsModel.updateOrderStatus(req.query.id, 'Đang chuẩn bị hàng');
    res.redirect('/admin/orders');
  } catch (e) {
    console.error(e);
    res.status(500).send('Lỗi server');
  }
});

router.get('/orders/ship', async (req, res) => {
  try {
    await productsModel.updateOrderStatus(req.query.id, 'Đang vận chuyển');
    res.redirect('/admin/orders');
  } catch (e) {
    console.error(e);
    res.status(500).send('Lỗi server');
  }
});

router.get('/orders/complete', async (req, res) => {
  try {
    await productsModel.updateOrderStatus(req.query.id, 'Hoàn thành');
    res.redirect('/admin/orders');
  } catch (e) {
    console.error(e);
    res.status(500).send('Lỗi server');
  }
});

router.get('/orders/cancel', async (req, res) => {
  try {
    await productsModel.updateOrderStatus(req.query.id, 'Đã hủy');
    res.redirect('/admin/orders');
  } catch (e) {
    console.error(e);
    res.status(500).send('Lỗi server');
  }
});

// ==================== GIẢM GIÁ ====================
router.get('/discount', async (req, res) => {
  try {
    const products = await productsModel.getAllProducts();
    res.render('admin/admin_discount', { products, session: req.session, active: 'discount' });
  } catch (e) {
    console.error(e);
    res.status(500).send('Lỗi server');
  }
});

router.post('/products/update-discount', async (req, res) => {
  try {
    const { id, discount } = req.body;
    await productsModel.updateDiscount(id, discount);
    res.redirect('/admin/discount');
  } catch (e) {
    console.error(e);
    res.status(500).send('Lỗi server');
  }
});

// ==================== THỐNG KÊ ====================
router.get('/statistics', async (req, res) => {
  try {
    // Bạn cần viết các hàm này trong model (hoặc tạm để 0)
    const totalRevenue = await productsModel.getTotalRevenue?.() || 0;
    const totalOrders = await productsModel.getTotalOrders?.() || 0;
    const totalCustomers = await productsModel.getTotalCustomers?.() || 0;

    res.render('admin/admin_statistics', {
      totalRevenue,
      totalOrders,
      totalCustomers,
      chartMonths: [],
      chartRevenue: [],
      statusLabels: [],
      statusData: [],
      session: req.session,
      active: 'statistics'
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('Lỗi server');
  }
});

// ==================== CẤU HÌNH ====================
router.get('/setting', (req, res) => {
  res.render('admin/setting', { session: req.session, active: 'setting' });
});

module.exports = router;