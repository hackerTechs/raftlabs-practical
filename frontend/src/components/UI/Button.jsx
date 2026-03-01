import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// ─── Style maps ────────────────────────────────────────────────────────────────

const VARIANT_CLASSES = {
  primary:
    'bg-orange-500 text-white font-medium hover:bg-orange-600 active:scale-[0.98] disabled:opacity-60',
  secondary:
    'bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 disabled:opacity-40',
  danger:
    'text-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-60',
  ghost:
    'text-gray-500 hover:text-gray-700',
};

const SIZE_CLASSES = {
  xs: 'px-2 py-1.5 text-xs rounded-lg gap-1',
  sm: 'px-3 py-2 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 rounded-xl gap-2',
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Reusable Button component.
 *
 * @param {'primary'|'secondary'|'danger'|'ghost'} variant  Visual style
 * @param {'xs'|'sm'|'md'|'lg'}                    size     Padding & text size
 * @param {boolean}                                 fullWidth  Stretch to 100%
 * @param {boolean}                                 loading    Show spinner & disable
 * @param {string}                                  to         Render as react-router <Link>
 * @param {string}                                  className  Extra classes (appended)
 */
const Button = forwardRef(
  (
    {
      variant = 'primary',
      size = 'lg',
      fullWidth = false,
      loading = false,
      disabled = false,
      to,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const classes = [
      'inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:cursor-not-allowed',
      VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary,
      SIZE_CLASSES[size] || SIZE_CLASSES.lg,
      fullWidth && 'w-full',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Render as <Link> when `to` is provided
    if (to) {
      return (
        <Link ref={ref} to={to} className={classes} {...props}>
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={classes}
        {...props}
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

