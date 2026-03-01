const store = require('../db/store');

const menuService = {
  /**
   * Retrieve all menu items, optionally filtered by category.
   */
  getAllItems: async (category) => {
    if (category) {
      return store.menu.getByCategory(category);
    }
    return store.menu.getAll();
  },

  /**
   * Retrieve a single menu item by its ID.
   */
  getItemById: async (id) => {
    return store.menu.getById(id);
  },

  /**
   * Get all unique categories.
   */
  getCategories: async () => {
    return store.menu.getCategories();
  },
};

module.exports = menuService;
