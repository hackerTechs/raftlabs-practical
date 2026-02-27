const { getClient } = require('./redisClient');

const menuItems = [
  {
    id: '1',
    name: 'Margherita Pizza',
    description: 'Classic pizza with fresh mozzarella, tomatoes, and basil on a crispy thin crust.',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80',
    category: 'Pizza',
  },
  {
    id: '2',
    name: 'Pepperoni Pizza',
    description: 'Loaded with spicy pepperoni slices and melted mozzarella cheese.',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80',
    category: 'Pizza',
  },
  {
    id: '3',
    name: 'Classic Burger',
    description: 'Juicy beef patty with lettuce, tomato, pickles, and our secret sauce.',
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
    category: 'Burgers',
  },
  {
    id: '4',
    name: 'Cheese Burger',
    description: 'Double cheese burger with caramelized onions and crispy bacon.',
    price: 12.49,
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&q=80',
    category: 'Burgers',
  },
  {
    id: '5',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with parmesan, croutons, and creamy Caesar dressing.',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&q=80',
    category: 'Salads',
  },
  {
    id: '6',
    name: 'Chicken Wings',
    description: 'Crispy fried chicken wings tossed in spicy buffalo sauce. Served with ranch.',
    price: 11.49,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80',
    category: 'Sides',
  },
  {
    id: '7',
    name: 'French Fries',
    description: 'Golden crispy fries seasoned with sea salt and herbs. Perfectly crunchy.',
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80',
    category: 'Sides',
  },
  {
    id: '8',
    name: 'Chocolate Milkshake',
    description: 'Rich and creamy chocolate milkshake topped with whipped cream.',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&q=80',
    category: 'Drinks',
  },
  {
    id: '9',
    name: 'Veggie Wrap',
    description: 'Fresh vegetables, hummus, and feta cheese wrapped in a warm tortilla.',
    price: 9.49,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80',
    category: 'Wraps',
  },
  {
    id: '10',
    name: 'Pasta Carbonara',
    description: 'Creamy pasta with crispy pancetta, egg, parmesan, and black pepper.',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&q=80',
    category: 'Pasta',
  },
];

/**
 * Seed menu items into Redis.
 */
async function seedMenuItems() {
  const client = getClient();
  const pipeline = client.pipeline();
  for (const item of menuItems) {
    pipeline.hset('menu:items', item.id, JSON.stringify(item));
  }
  await pipeline.exec();
  console.log(`[Seed] ${menuItems.length} menu items loaded into Redis`);
}

module.exports = { seedMenuItems, menuItems };

