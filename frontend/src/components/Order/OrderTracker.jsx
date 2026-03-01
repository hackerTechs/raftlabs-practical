import { Package, ChefHat, Truck, CircleCheckBig } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'Order Received', label: 'Order Received', icon: Package, color: 'blue' },
  { key: 'Preparing', label: 'Preparing', icon: ChefHat, color: 'yellow' },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck, color: 'orange' },
  { key: 'Delivered', label: 'Delivered', icon: CircleCheckBig, color: 'green' },
];

const COLORS = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', ring: 'ring-blue-200', line: 'bg-blue-400' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', ring: 'ring-yellow-200', line: 'bg-yellow-400' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', ring: 'ring-orange-200', line: 'bg-orange-400' },
  green: { bg: 'bg-green-100', text: 'text-green-600', ring: 'ring-green-200', line: 'bg-green-400' },
};

export default function OrderTracker({ currentStatus }) {
  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="w-full py-6">
      <div className="flex justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full mx-8" />
        <div
          className="absolute top-6 left-0 h-1 bg-gradient-to-r from-orange-400 to-green-400 rounded-full mx-8 transition-all duration-1000"
          style={{ width: `calc(${(currentIndex / (STATUS_STEPS.length - 1)) * 100}% - 2rem)`, marginLeft: '1.5rem' }}
        />

        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const colors = COLORS[step.color];
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted
                    ? `${colors.bg} ${colors.text} ${isCurrent ? `` : ''}`
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Icon size={22} />
              </div>
              <span
                className={`mt-2 text-xs font-medium text-center max-w-[80px] ${
                  isCompleted ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
              {isCurrent && (
                <span className="mt-1 text-xs text-orange-500 font-semibold animate-pulse">
                  Current
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

