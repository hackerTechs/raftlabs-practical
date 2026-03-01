import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import { menuApi } from '../services/api';
import MenuList from '../components/Menu/MenuList';
import Button from '../components/UI/Button';

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, catRes] = await Promise.all([
          menuApi.getAll(),
          menuApi.getCategories(),
        ]);
        setItems(menuRes.data);
        setCategories(['All', ...catRes.data]);
      } catch (err) {
        toast.error(err.message || 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Delicious Food,{' '}
          <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Delivered Fast
          </span>
        </h1>
        <p className="text-gray-500 text-lg">
          Choose from our carefully curated menu
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search menu..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full whitespace-nowrap ${activeCategory === cat ? 'shadow-sm' : ''}`}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Items */}
      <MenuList items={filteredItems} loading={loading} />
    </div>
  );
}

