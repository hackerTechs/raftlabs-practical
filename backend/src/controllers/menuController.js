const menuService = require('../services/menuService');

const menuController = {
  /**
   * GET /api/menu
   * Query params: ?category=Pizza
   */
  getMenuItems: async (req, res, next) => {
    try {
      const { category } = req.query;
      const items = await menuService.getAllItems(category);
      res.json({ success: true, data: items, count: items.length });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/menu/categories
   */
  getCategories: async (_req, res, next) => {
    try {
      const categories = await menuService.getCategories();
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/menu/:id
   */
  getMenuItem: async (req, res, next) => {
    try {
      const item = await menuService.getItemById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, error: 'Menu item not found' });
      }
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = menuController;
