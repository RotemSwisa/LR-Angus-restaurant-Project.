const express = require('express');
const MenuController = require('../controllers/MenuController');

const router = express.Router();

// נתיבי תפריט
router.get('/', MenuController.getFullMenu);                     // GET /api/menu
router.get('/category/:category', MenuController.getByCategory); // GET /api/menu/category/מנות-עיקריות
router.get('/search', MenuController.searchDishes);              // GET /api/menu/search?term=המבורגר
router.get('/dish/:id', MenuController.getDishById);             // GET /api/menu/dish/1
router.get('/statistics', MenuController.getMenuStatistics);     // GET /api/menu/statistics

module.exports = router;