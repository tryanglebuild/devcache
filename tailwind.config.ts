import type { Config } from 'tailwindcss'

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Shadcn UI Colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        
        // Surface Hierarchy (Legacy - keeping for compatibility)
        'surface-dim': '#0b1326',
        'surface': '#0b1326',
        'surface-bright': '#31394d',
        'surface-container-lowest': '#060e20',
        'surface-container-low': '#131b2e',
        'surface-container': '#171f33',
        'surface-container-high': '#222a3d',
        'surface-container-highest': '#2d3449',
        'surface-variant': '#2d3449',
        'surface-tint': '#c0c1ff',
        
        // Primary Colors (Legacy - keeping for compatibility)
        'primary-container': '#8083ff',
        'primary-dim': '#494bd6',
        'primary-fixed': '#e1e0ff',
        'primary-fixed-dim': '#c0c1ff',
        'on-primary': '#1000a9',
        'on-primary-container': '#0d0096',
        'on-primary-fixed': '#07006c',
        'on-primary-fixed-variant': '#2f2ebe',
        
        // Secondary Colors (Legacy - keeping for compatibility)
        'secondary-container': '#42447b',
        'secondary-dim': '#292a60',
        'secondary-fixed': '#e1e0ff',
        'secondary-fixed-dim': '#c0c1ff',
        'on-secondary': '#292a60',
        'on-secondary-container': '#b2b3f2',
        'on-secondary-fixed': '#13144a',
        'on-secondary-fixed-variant': '#404178',
        
        // Tertiary Colors
        'tertiary': '#ffb783',
        'tertiary-container': '#d97721',
        'tertiary-dim': '#703700',
        'tertiary-fixed': '#ffdcc5',
        'tertiary-fixed-dim': '#ffb783',
        'on-tertiary': '#4f2500',
        'on-tertiary-container': '#452000',
        'on-tertiary-fixed': '#301400',
        'on-tertiary-fixed-variant': '#703700',
        
        // Error Colors (Legacy - keeping for compatibility)
        'error-container': '#93000a',
        'on-error': '#690005',
        'on-error-container': '#ffdad6',
        
        // Text Colors
        'on-surface': '#dae2fd',
        'on-surface-variant': '#c7c4d7',
        'on-background': '#dae2fd',
        
        // Outline & Borders
        'outline': '#908fa0',
        'outline-variant': '#464554',
        
        // Inverse Colors
        'inverse-surface': '#dae2fd',
        'inverse-on-surface': '#283044',
        'inverse-primary': '#494bd6',
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
  plugins: [],
} satisfies Config
