import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { FloatingChatButton } from '@/components/chat/FloatingChatButton'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ThemedToaster } from '@/components/ui/ThemedToaster'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'devCache — The Agentic AI Marketplace for Developers',
  description: 'Turn your development expertise into specialized AI agents. Create, share, and orchestrate agents for design, engineering, QA, and beyond — with the community that builds with them.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        {/* FOUC prevention — must run before any CSS to apply dark class immediately */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('devcache-theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
        {/* Material Symbols Outlined font */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" 
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} bg-background`}>
        <ThemeProvider>
          {children}
          <ThemedToaster />
        </ThemeProvider>
        <FloatingChatButton />
      </body>
    </html>
  )
}
