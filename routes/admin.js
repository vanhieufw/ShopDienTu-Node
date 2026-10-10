const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const productsModel = require('../models/productsModel');
const categoryModel = require('../models/categoryModel');
const { requireAdmin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/img')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + (file.originalname || 'img'))
});
const upload = multer({ storage });

router.use(requireAdmin);

router.get('/products', async (req, res) => {
  const products = await productsModel.getAllProducts();
  res.render('admin/sanpham', { products, session: req.session });
});

router.get('/products/create', async (req, res) => {
  const categories = await categoryModel.getAll();
  res.render('admin/them_san_pham', { product: null, categories, session: req.session });
});

router.get('/products/edit', async (req, res) => {
  const product = await productsModel.getProductById(req.query.id);
  const categories = await categoryModel.getAll();
  res.render('admin/them_san_pham', { product, categories, session: req.session });
});

router.post('/products/store', upload.single('ImageUrlProduct'), async (req, res) => {
  const { id, NameProduct, PriceProduct, StockQuantityProduct, DescriptionProduct, IDCategory } = req.body;
  const image = req.file ? req.file.filename : '';
  if (id) await productsModel.updateProduct(id, NameProduct, PriceProduct, StockQuantityProduct, DescriptionProduct, image, IDCategory);
  else await productsModel.insertProduct(NameProduct, PriceProduct, StockQuantityProduct, DescriptionProduct, image, IDCategory);
  res.redirect('/admin/products');
});

router.get('/products/delete', async (req, res) => {
  await productsModel.deleteProduct(req.query.id);
  res.redirect('/admin/products');
});

router.get('/categories', async (req, res) => {
  const categories = await categoryModel.getAll();
  res.render('admin/danhmuc', { categories, session: req.session });
});

router.post('/categories/store', async (req, res) => {
  const { NameCategory, id } = req.body;
  if (id) await categoryModel.update(id, NameCategory);
  else await categoryModel.insert(NameCategory);
  res.redirect('/admin/categories');
});

router.get('/categories/delete', async (req, res) => {
  await categoryModel.delete(req.query.id);
  res.redirect('/admin/categories');
});

router.get('/reviews', async (req, res) => {
  const reviews = await productsModel.getAllReviews();
  res.render('admin/danhgia', { reviews, session: req.session });
});

router.get('/reviews/delete', async (req, res) => {
  await productsModel.deleteReview(req.query.id);
  res.redirect('/admin/reviews');
});

router.get('/orders', async (req, res) => {
  const orders = await productsModel.getAllOrders();
  res.render('admin/admin_orders', { orders, session: req.session });
});

module.exports = router;
