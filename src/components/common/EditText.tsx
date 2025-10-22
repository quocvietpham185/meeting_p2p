'use client';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { InputHTMLAttributes, forwardRef, CSSProperties, useId } from 'react';

const editTextClasses = cva(
  'w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default:
          'bg-input-background text-input-text border border-input-border focus:ring-primary-light focus:border-primary-background',
        filled:
          'bg-secondary-light text-text-primary border border-transparent focus:ring-primary-light focus:border-primary-background',
        outline:
          'bg-transparent text-text-primary border-2 border-border-primary focus:ring-primary-light focus:border-primary-background',
      },
      size: {
        small: 'text-sm px-3 py-2',
        medium: 'text-base px-4 py-3',
        large: 'text-lg px-5 py-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'medium',
    },
  }
);

interface EditTextProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof editTextClasses> {
  placeholder?: string;
  text_font_size?: string;
  text_font_family?: string;
  text_font_weight?: string;
  text_line_height?: string;
  text_text_align?: string;
  text_color?: string;
  fill_background_color?: string;
  border_border?: string;
  border_border_radius?: string;
  layout_gap?: string;
  layout_width?: string;
  padding?: string;
  position?: string;
  label?: string;
  error?: string;
  helperText?: string;
}

const EditText = forwardRef<HTMLInputElement, EditTextProps>(({
  placeholder = 'Enter your email (e.g., viet@example.com)',
  text_font_size = 'text-base',
  text_font_family = 'Inter',
  text_font_weight = 'font-normal',
  text_line_height = 'leading-normal',
  text_text_align = 'left',
  text_color = 'text-text-placeholder',
  fill_background_color = 'bg-input-background',
  border_border = 'border-input-border',
  border_border_radius = 'rounded-sm',
  layout_gap,
  layout_width,
  padding,
  position,
  label,
  error,
  helperText,
  variant,
  size,
  disabled = false,
  className,
  type = 'text',
  id,
  ...props
}, ref) => {
  // ✅ Không đọc ref trong render — chỉ dùng useId
  const reactId = useId();
  const inputId = id || `input-${reactId}`;

  const optionalClasses = [
    layout_gap ? `gap-[${layout_gap}]` : '',
    layout_width ? `w-[${layout_width}]` : '',
    padding ? `p-[${padding}]` : '',
    position || '',
  ].filter(Boolean).join(' ');

  const customStyles: CSSProperties = {
    ...(text_font_family && !text_font_family.startsWith('font-') && { fontFamily: text_font_family }),
  };

  const borderClass = border_border.includes('solid') ? 'border' : border_border;

  const styleClasses = [
    text_font_size,
    text_font_family.startsWith('font-') ? text_font_family : '',
    text_font_weight,
    text_line_height,
    `text-${text_text_align}`,
    text_color,
    fill_background_color,
    borderClass,
    border_border_radius,
  ].filter(Boolean).join(' ');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        style={customStyles}
        className={twMerge(
          editTextClasses({ variant, size }),
          styleClasses,
          optionalClasses,
          error && 'border-red-500 focus:ring-red-200 focus:border-red-500',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          error
            ? `${inputId}-error`
            : helperText
            ? `${inputId}-helper`
            : undefined
        }
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1 text-sm text-text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
});

EditText.displayName = 'EditText';
export default EditText;
