export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍕</span>
            <span className="text-white font-semibold">RaftFoodLab</span>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} RaftFoodLab. Built with ❤️ for RaftLabs Assessment.
          </p>
        </div>
      </div>
    </footer>
  );
}

