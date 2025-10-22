'use client';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { InputHTMLAttributes, forwardRef, CSSProperties, useId } from 'react';

const checkboxClasses = cva(
  'rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'text-primary-background border-border-primary focus:ring-primary-light',
        secondary: 'text-secondary-dark border-border-secondary focus:ring-secondary-light',
      },
      size: {
        small: 'h-4 w-4',
        medium: 'h-5 w-5',
        large: 'h-6 w-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'medium',
    },
  }
);

const labelClasses = cva('select-none cursor-pointer', {
  variants: {
    size: {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
    },
  },
  defaultVariants: {
    size: 'medium',
  },
});

interface CheckBoxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof checkboxClasses> {
  text?: string;
  text_font_size?: string;
  text_font_family?: string;
  text_font_weight?: string;
  text_line_height?: string;
  text_text_align?: string;
  text_color?: string;
  layout_gap?: string;
  layout_width?: string;
  position?: string;
  label?: string;
  error?: string;
  helperText?: string;
}

const CheckBox = forwardRef<HTMLInputElement, CheckBoxProps>(
  (
    {
      text = 'Remember me',
      text_font_size = 'text-sm',
      text_font_family = 'Inter',
      text_font_weight = 'font-normal',
      text_line_height = 'leading-tight',
      text_text_align = 'left',
      text_color = 'text-checkbox-text',
      layout_gap,
      layout_width,
      position,
      label,
      error,
      helperText,
      variant,
      size,
      disabled = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    // ✅ Sinh ID ổn định, không bị random mỗi lần render
    const reactId = useId();
    const checkboxId = id || `checkbox-${reactId}`;

    const optionalClasses = [
      layout_gap ? `gap-[${layout_gap}]` : '',
      layout_width ? `w-[${layout_width}]` : '',
      position || '',
    ]
      .filter(Boolean)
      .join(' ');

    const customStyles: CSSProperties = {
      ...(text_font_family && !text_font_family.startsWith('font-') && {
        fontFamily: text_font_family,
      }),
    };

    const labelStyleClasses = [
      text_font_size,
      text_font_family.startsWith('font-') ? text_font_family : '',
      text_font_weight,
      text_line_height,
      `text-${text_text_align}`,
      text_color,
    ]
      .filter(Boolean)
      .join(' ');

    const displayText = label || text;

    return (
      <div className={twMerge('flex items-start', optionalClasses)}>
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            disabled={disabled}
            className={twMerge(
              checkboxClasses({ variant, size }),
              error && 'border-red-500 focus:ring-red-200',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error
                ? `${checkboxId}-error`
                : helperText
                ? `${checkboxId}-helper`
                : undefined
            }
            {...props}
          />
        </div>
        {displayText && (
          <div className="ml-3 text-sm">
            <label
              htmlFor={checkboxId}
              style={customStyles}
              className={twMerge(
                labelClasses({ size }),
                labelStyleClasses,
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {displayText}
            </label>
            {error && (
              <p id={`${checkboxId}-error`} className="mt-1 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p id={`${checkboxId}-helper`} className="mt-1 text-sm text-text-muted">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

CheckBox.displayName = 'CheckBox';
export default CheckBox;
