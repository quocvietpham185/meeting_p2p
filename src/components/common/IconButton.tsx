'use client';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { ButtonHTMLAttributes, ReactNode, CSSProperties } from 'react';

const iconButtonClasses = cva(
  'inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'text-text-primary hover:text-primary-background hover:bg-primary-light focus:ring-primary-light',
        primary: 'bg-primary-background text-primary-foreground hover:bg-primary-dark focus:ring-primary-light',
        secondary: 'bg-secondary-background text-secondary-foreground border border-border-primary hover:bg-secondary-light focus:ring-secondary-light',
        ghost: 'text-text-primary hover:text-primary-background hover:bg-primary-light focus:ring-primary-light',
        outline: 'border-2 border-primary-background text-primary-background bg-transparent hover:bg-primary-light focus:ring-primary-light',
      },
      size: {
        small: 'h-8 w-8 text-sm',
        medium: 'h-10 w-10 text-base',
        large: 'h-12 w-12 text-lg',
        xl: 'h-14 w-14 text-xl',
      },
      shape: {
        square: 'rounded-sm',
        rounded: 'rounded-md',
        circle: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'medium',
      shape: 'rounded',
    },
  }
)

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof iconButtonClasses> {
  // Icon props
  icon?: ReactNode;
  iconSize?: string;
  
  // Styling props
  text_font_size?: string;
  text_font_family?: string;
  text_font_weight?: string;
  text_color?: string;
  fill_background_color?: string;
  border_border?: string;
  border_border_radius?: string;
  
  // Optional parameters
  layout_width?: string;
  layout_height?: string;
  padding?: string;
  position?: string;
  
  // Accessibility
  'aria-label': string;
  tooltip?: string;
}

const IconButton = ({
  // Icon props
  icon,
  iconSize,
  
  // Styling props
  text_font_size = "text-base",
  text_font_family = "Inter",
  text_font_weight = "font-normal",
  text_color = "text-text-primary",
  fill_background_color,
  border_border,
  border_border_radius = "rounded-sm",
  
  // Optional parameters (no defaults)
  layout_width,
  layout_height,
  padding,
  position,
  
  // Standard React props
  variant,
  size,
  shape,
  disabled = false,
  className,
  onClick,
  type = 'button',
  tooltip,
  ...props
}: IconButtonProps) => {
  // Safe validation for optional parameters
  const hasValidWidth = layout_width && typeof layout_width === 'string' && layout_width.trim() !== ''
  const hasValidHeight = layout_height && typeof layout_height === 'string' && layout_height.trim() !== ''
  const hasValidPadding = padding && typeof padding === 'string' && padding.trim() !== ''
  const hasValidPosition = position && typeof position === 'string' && position.trim() !== ''
  const hasValidBorder = border_border && typeof border_border === 'string' && border_border.trim() !== ''

  const optionalClasses = [
    hasValidWidth ? `w-[${layout_width}]` : '',
    hasValidHeight ? `h-[${layout_height}]` : '',
    hasValidPadding ? `p-[${padding}]` : '',
    hasValidPosition ? position : '',
    hasValidBorder ? `border-[${border_border}]` : '',
  ].filter(Boolean).join(' ')

  // Build custom styles for non-Tailwind properties
  const customStyles: CSSProperties = {
    // Only use inline styles for truly custom values
    ...(text_font_family && !text_font_family.startsWith('font-') && { fontFamily: text_font_family }),
  }

  // Build Tailwind classes for styling
  const styleClasses = [
    text_font_size,
    text_font_family.startsWith('font-') ? text_font_family : '',
    text_font_weight,
    text_color,
    // Only apply these if not using variant system
    !variant && fill_background_color ? fill_background_color : '',
    border_border_radius,
  ].filter(Boolean).join(' ')

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      event.preventDefault()
      return
    }
    
    if (typeof onClick === 'function') {
      onClick(event)
    }
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      style={customStyles}
      className={twMerge(
        iconButtonClasses({ variant, size, shape }),
        styleClasses,
        optionalClasses,
        className
      )}
      aria-disabled={disabled}
      title={tooltip}
      {...props}
    >
      {icon && (
        <span 
          className={twMerge(
            'flex items-center justify-center',
            iconSize || 'w-5 h-5'
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
    </button>
  )
}

export default IconButton