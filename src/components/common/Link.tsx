'use client';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
 import NextLink from'next/link';
import { AnchorHTMLAttributes, ReactNode, CSSProperties } from 'react';

const linkClasses = cva(
  'inline-flex items-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'text-link-text hover:text-primary-dark focus:ring-primary-light underline-offset-4 hover:underline',
        subtle: 'text-text-muted hover:text-text-primary focus:ring-secondary-light',
        button: 'text-primary-foreground bg-primary-background hover:bg-primary-dark focus:ring-primary-light px-4 py-2 rounded-sm no-underline',
        ghost: 'text-text-primary hover:text-primary-background focus:ring-primary-light hover:bg-primary-light px-2 py-1 rounded-sm no-underline',
      },
      size: {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg',
      },
      underline: {
        none: 'no-underline',
        hover: 'no-underline hover:underline',
        always: 'underline',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'medium',
      underline: 'hover',
    },
  }
)

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>, VariantProps<typeof linkClasses> {
  // Navigation props
  href: string;
  external?: boolean;
  
  // Styling props
  text?: string;
  text_font_size?: string;
  text_font_family?: string;
  text_font_weight?: string;
  text_line_height?: string;
  text_text_align?: string;
  text_color?: string;
  
  // Optional parameters
  layout_gap?: string;
  layout_width?: string;
  padding?: string;
  position?: string;
  
  // Standard React props
  children?: ReactNode;
  disabled?: boolean;
}

const Link = ({
  // Navigation props
  href,
  external = false,
  
  // Styling props
  text,
  text_font_size = "text-base",
  text_font_family = "Inter",
  text_font_weight = "font-normal",
  text_line_height = "leading-normal",
  text_text_align = "left",
  text_color = "text-link-text",
  
  // Optional parameters (no defaults)
  layout_gap,
  layout_width,
  padding,
  position,
  
  // Standard React props
  variant,
  size,
  underline,
  disabled = false,
  className,
  children,
  target,
  rel,
  ...props
}: LinkProps) => {
  // Safe validation for optional parameters
  const hasValidGap = layout_gap && typeof layout_gap === 'string' && layout_gap.trim() !== ''
  const hasValidWidth = layout_width && typeof layout_width === 'string' && layout_width.trim() !== ''
  const hasValidPadding = padding && typeof padding === 'string' && padding.trim() !== ''
  const hasValidPosition = position && typeof position === 'string' && position.trim() !== ''

  const optionalClasses = [
    hasValidGap ? `gap-[${layout_gap}]` : '',
    hasValidWidth ? `w-[${layout_width}]` : '',
    hasValidPadding ? `p-[${padding}]` : '',
    hasValidPosition ? position : '',
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
    text_line_height,
    `text-${text_text_align}`,
    text_color,
  ].filter(Boolean).join(' ')

  const combinedClassName = twMerge(
    linkClasses({ variant, size, underline }),
    styleClasses,
    optionalClasses,
    disabled && 'pointer-events-none opacity-50',
    className
  )

  const linkProps = {
    style: customStyles,
    className: combinedClassName,
    target: external ? '_blank' : target,
    rel: external ? 'noopener noreferrer' : rel,
    'aria-disabled': disabled,
    ...props,
  }

  const content = children || text

  // External links or disabled links use regular anchor tag
  if (external || disabled || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return (
      <a href={disabled ? undefined : href} {...linkProps}>
        {content}
      </a>
    )
  }

  // Internal links use Next.js Link
  return (
    <NextLink href={href} {...linkProps}>
      {content}
    </NextLink>
  )
}

export default Link