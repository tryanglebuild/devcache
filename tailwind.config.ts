import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Shadcn UI Colors (vars hold full oklch values — use var() directly)
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },

        // Surface Hierarchy (from tokens.css)
        'surface': 'var(--surface)',
        'surface-bright': 'var(--surface-bright)',
        'surface-dim': 'var(--surface-dim)',
        'surface-container-lowest': 'var(--surface-container-lowest)',
        'surface-container-low': 'var(--surface-container-low)',
        'surface-container': 'var(--surface-container)',
        'surface-container-high': 'var(--surface-container-high)',
        'surface-container-highest': 'var(--surface-container-highest)',
        'surface-variant': 'var(--surface-variant)',
        'surface-tint': 'var(--surface-tint)',

        // Text Colors (from tokens.css)
        'on-surface': 'var(--on-surface)',
        'on-surface-variant': 'var(--on-surface-variant)',
        'on-background': 'var(--on-background)',

        // Outline & Borders (from tokens.css)
        'outline': 'var(--outline)',
        'outline-variant': 'var(--outline-variant)',

        // Primary (from tokens.css)
        'primary-container': 'var(--primary-container)',
        'primary-dim': 'var(--primary-dim)',
        'primary-fixed': 'var(--primary-fixed)',
        'primary-fixed-dim': 'var(--primary-fixed-dim)',
        'on-primary': 'var(--on-primary)',
        'on-primary-container': 'var(--on-primary-container)',
        'on-primary-fixed': 'var(--on-primary-fixed)',
        'on-primary-fixed-variant': 'var(--on-primary-fixed-variant)',

        // Secondary (from tokens.css)
        'secondary-container': 'var(--secondary-container)',
        'secondary-dim': 'var(--secondary-dim)',
        'secondary-fixed': 'var(--secondary-fixed)',
        'secondary-fixed-dim': 'var(--secondary-fixed-dim)',
        'on-secondary': 'var(--on-secondary)',
        'on-secondary-container': 'var(--on-secondary-container)',
        'on-secondary-fixed': 'var(--on-secondary-fixed)',
        'on-secondary-fixed-variant': 'var(--on-secondary-fixed-variant)',

        // Tertiary (from tokens.css)
        'tertiary': 'var(--tertiary)',
        'tertiary-container': 'var(--tertiary-container)',
        'tertiary-dim': 'var(--tertiary-dim)',
        'tertiary-fixed': 'var(--tertiary-fixed)',
        'tertiary-fixed-dim': 'var(--tertiary-fixed-dim)',
        'on-tertiary': 'var(--on-tertiary)',
        'on-tertiary-container': 'var(--on-tertiary-container)',
        'on-tertiary-fixed': 'var(--on-tertiary-fixed)',
        'on-tertiary-fixed-variant': 'var(--on-tertiary-fixed-variant)',

        // Error (from tokens.css)
        'error': 'var(--error)',
        'error-container': 'var(--error-container)',
        'error-dim': 'var(--error-dim)',
        'on-error': 'var(--on-error)',
        'on-error-container': 'var(--on-error-container)',

        // Inverse (from tokens.css)
        'inverse-surface': 'var(--inverse-surface)',
        'inverse-on-surface': 'var(--inverse-on-surface)',
        'inverse-primary': 'var(--inverse-primary)',

        // Semantic Status (from tokens.css)
        'success': 'var(--success)',
        'success-container': 'var(--success-container)',
        'on-success': 'var(--on-success)',
        'on-success-container': 'var(--on-success-container)',
        'warning': 'var(--warning)',
        'warning-container': 'var(--warning-container)',
        'on-warning': 'var(--on-warning)',
        'on-warning-container': 'var(--on-warning-container)',
        'info': 'var(--info)',
        'info-container': 'var(--info-container)',
        'on-info': 'var(--on-info)',
        'on-info-container': 'var(--on-info-container)',

        // Code Viewer (from tokens.css)
        'surface-code': 'var(--surface-code)',
        'on-surface-code': 'var(--on-surface-code)',
      },
      fontFamily: {
        headline: ['var(--font-inter)', 'Inter', 'sans-serif'],
        body: ['var(--font-inter)', 'Inter', 'sans-serif'],
        label: ['var(--font-inter)', 'Inter', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'DEFAULT': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config
