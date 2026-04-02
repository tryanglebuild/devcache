/**
 * Content Sanitization Utilities
 * 
 * Sanitizes user input to prevent XSS, SQL injection, and other attacks
 */

import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content
 * Removes dangerous tags and attributes while preserving safe formatting
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote',
      'a',
      'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
  })
}

/**
 * Sanitize markdown content
 * Removes potentially dangerous patterns while preserving markdown syntax
 */
export function sanitizeMarkdown(markdown: string): string {
  // Remove script tags
  let sanitized = markdown.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  // Remove data: protocol (except for images)
  sanitized = sanitized.replace(/(?<!src=["'])data:/gi, '')
  
  return sanitized
}

/**
 * Sanitize plain text
 * Escapes HTML entities and removes control characters
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

/**
 * Sanitize filename
 * Removes path traversal attempts and dangerous characters
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\.\./g, '') // Remove path traversal
    .replace(/[\/\\]/g, '') // Remove path separators
    .replace(/[<>:"|?*\x00-\x1F]/g, '') // Remove invalid characters
    .trim()
    .substring(0, 255) // Limit length
}

/**
 * Sanitize URL
 * Validates and sanitizes URLs to prevent XSS
 */
export function sanitizeURL(url: string): string | null {
  try {
    const parsed = new URL(url)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }
    
    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Sanitize agent template content
 * Comprehensive sanitization for agent templates
 */
export function sanitizeAgentTemplate(content: string): string {
  // First pass: sanitize markdown
  let sanitized = sanitizeMarkdown(content)
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\n{4,}/g, '\n\n\n')
  
  // Limit total length (1MB)
  if (sanitized.length > 1024 * 1024) {
    sanitized = sanitized.substring(0, 1024 * 1024)
  }
  
  return sanitized
}

/**
 * Validate and sanitize JSON
 * Ensures JSON is valid and within size limits
 */
export function sanitizeJSON(json: string, maxSize: number = 1024 * 100): any {
  // Check size
  if (json.length > maxSize) {
    throw new Error(`JSON exceeds maximum size of ${maxSize} bytes`)
  }
  
  try {
    const parsed = JSON.parse(json)
    
    // Prevent prototype pollution
    if (parsed.__proto__ || parsed.constructor || parsed.prototype) {
      throw new Error('Invalid JSON: contains dangerous properties')
    }
    
    return parsed
  } catch (error) {
    throw new Error('Invalid JSON format')
  }
}

/**
 * Sanitize SQL-like strings (for search queries)
 * Prevents SQL injection in search queries
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[';-]/g, '') // Remove SQL comment and statement terminators
    .replace(/\b(DROP|DELETE|INSERT|UPDATE|ALTER|CREATE|EXEC|EXECUTE)\b/gi, '') // Remove dangerous SQL keywords
    .trim()
    .substring(0, 500) // Limit length
}

/**
 * Sanitize tags array
 * Ensures tags are safe and within limits
 */
export function sanitizeTags(tags: string[]): string[] {
  return tags
    .map(tag => sanitizeText(tag.trim()))
    .filter(tag => tag.length > 0 && tag.length <= 50)
    .slice(0, 20) // Max 20 tags
}

/**
 * Detect and prevent common attack patterns
 */
export function detectMaliciousContent(content: string): {
  isSafe: boolean
  reasons: string[]
} {
  const reasons: string[] = []
  
  // Check for script tags
  if (/<script/i.test(content)) {
    reasons.push('Contains script tags')
  }
  
  // Check for event handlers
  if (/on\w+\s*=/i.test(content)) {
    reasons.push('Contains event handlers')
  }
  
  // Check for javascript: protocol
  if (/javascript:/i.test(content)) {
    reasons.push('Contains javascript: protocol')
  }
  
  // Check for data: protocol (except images)
  if (/data:(?!image)/i.test(content)) {
    reasons.push('Contains suspicious data: protocol')
  }
  
  // Check for SQL injection patterns
  if (/(\bUNION\b|\bSELECT\b.*\bFROM\b|\bDROP\b.*\bTABLE\b)/i.test(content)) {
    reasons.push('Contains SQL injection patterns')
  }
  
  // Check for path traversal
  if (/\.\.[\/\\]/.test(content)) {
    reasons.push('Contains path traversal attempts')
  }
  
  return {
    isSafe: reasons.length === 0,
    reasons,
  }
}
