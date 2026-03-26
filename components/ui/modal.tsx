'use client'

import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl',
}

export function Modal({
  isOpen,
  onClose,
  children,
  className,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={cn(
          'relative w-full bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 fade-in duration-200',
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[#f2f4f6] transition-colors text-[#464554] hover:text-[#191c1e] z-10"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}

interface ModalHeaderProps {
  children: ReactNode
  className?: string
  icon?: ReactNode
  subtitle?: string
}

export function ModalHeader({ children, className, icon, subtitle }: ModalHeaderProps) {
  return (
    <div className={cn('px-8 py-6 border-b border-[#c7c4d7]/20', className)}>
      <div className="flex items-start gap-4">
        {icon && (
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#4648d4] to-[#6063ee] flex items-center justify-center text-white shadow-lg shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-black text-[#191c1e] tracking-tight">
            {children}
          </h2>
          {subtitle && (
            <p className="text-sm text-[#464554] mt-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

interface ModalBodyProps {
  children: ReactNode
  className?: string
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={cn('px-8 py-6', className)}>
      {children}
    </div>
  )
}

interface ModalFooterProps {
  children: ReactNode
  className?: string
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn('px-8 py-6 border-t border-[#c7c4d7]/20 flex gap-3', className)}>
      {children}
    </div>
  )
}
