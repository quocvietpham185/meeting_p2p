module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,html,mdx}",
            "./src/app/**/*.{js,ts,jsx,tsx}",
            "./src/components/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    screens: {
      sm: '640px',   
      md: '768px',    
      lg: '1024px',   
      xl: '1280px',
      '2xl': '1536px'
    },
    extend: {
      colors: {
        // Primary Colors
        primary: {
          background: "var(--primary-background)",
          foreground: "var(--primary-foreground)",
          light: "var(--primary-light)",
          dark: "var(--primary-dark)",
        },
        // Secondary Colors
        secondary: {
          background: "var(--secondary-background)",
          foreground: "var(--secondary-foreground)",
          light: "var(--secondary-light)",
          dark: "var(--secondary-dark)",
        },
        // Text Colors
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          placeholder: "var(--text-placeholder)",
          accent: "var(--text-accent)",
          inverse: "var(--text-inverse)",
        },
        // Background Colors
        background: {
          main: "var(--bg-main)",
          card: "var(--bg-card)",
          primary: "var(--bg-primary)",
        },
        // Border Colors
        border: {
          primary: "var(--border-primary)",
          secondary: "var(--border-secondary)",
          light: "var(--border-light)",
        },
        // Component-specific colors
        button: {
          primary: {
            background: "var(--button-primary-bg)",
            text: "var(--button-primary-text)",
          },
          secondary: {
            background: "var(--button-secondary-bg)",
            text: "var(--button-secondary-text)",
            border: "var(--button-secondary-border)",
          },
        },
        input: {
          background: "var(--input-bg)",
          text: "var(--input-text)",
          placeholder: "var(--input-placeholder)",
          border: "var(--input-border)",
        },
        checkbox: {
          text: "var(--checkbox-text)",
        },
        link: {
          text: "var(--link-text)",
        },
      },
      // Typography
      fontSize: {
        'xs': 'var(--font-size-xs)',
        'sm': 'var(--font-size-sm)',
        'base': 'var(--font-size-base)',
        'lg': 'var(--font-size-lg)',
        'xl': 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
      },
      fontWeight: {
        'normal': 'var(--font-weight-normal)',
        'medium': 'var(--font-weight-medium)',
        'bold': 'var(--font-weight-bold)',
      },
      lineHeight: {
        'tight': 'var(--line-height-tight)',
        'normal': 'var(--line-height-normal)',
        'relaxed': 'var(--line-height-relaxed)',
        'loose': 'var(--line-height-loose)',
        'xl': 'var(--line-height-xl)',
        '2xl': 'var(--line-height-2xl)',
      },
      // Spacing
      spacing: {
        'xs': 'var(--spacing-xs)',
        'sm': 'var(--spacing-sm)',
        'md': 'var(--spacing-md)',
        'lg': 'var(--spacing-lg)',
        'xl': 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
        '4xl': 'var(--spacing-4xl)',
        '5xl': 'var(--spacing-5xl)',
        '6xl': 'var(--spacing-6xl)',
        '7xl': 'var(--spacing-7xl)',
        '8xl': 'var(--spacing-8xl)',
        '9xl': 'var(--spacing-9xl)',
        '10xl': 'var(--spacing-10xl)',
      },
      // Border Radius
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
      },
      // Border Width
      borderWidth: {
        'thin': 'var(--border-width-thin)',
        'thick': 'var(--border-width-thick)',
      },
    },
  },
  plugins: []
};