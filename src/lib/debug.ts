/**
 * Debug Utility - Centralized logging for development
 * 
 * Usage:
 *   import { debug } from '@/lib/debug'
 *   debug.log('🔍 Message', { data })
 *   debug.cart('Adding item', item)
 *   debug.api('Fetching products')
 */

const isDev = process.env.NODE_ENV === 'development'

type LogLevel = 'log' | 'warn' | 'error' | 'info'

interface DebugOptions {
  force?: boolean // Log even in production
  prefix?: string
}

function createLogger(level: LogLevel, emoji: string, defaultPrefix: string) {
  return (message: string, data?: unknown, options?: DebugOptions) => {
    const shouldLog = isDev || options?.force
    if (!shouldLog) return

    const prefix = options?.prefix || defaultPrefix
    const fullMessage = `${emoji} [${prefix}] ${message}`

    if (data !== undefined) {
      console[level](fullMessage, data)
    } else {
      console[level](fullMessage)
    }
  }
}

export const debug = {
  // General logging
  log: createLogger('log', '📝', 'DEBUG'),
  warn: createLogger('warn', '⚠️', 'WARN'),
  info: createLogger('info', 'ℹ️', 'INFO'),
  
  // Always log errors (even in production)
  error: (message: string, data?: unknown) => {
    console.error(`❌ [ERROR] ${message}`, data !== undefined ? data : '')
  },

  // Domain-specific loggers
  cart: createLogger('log', '🛒', 'CART'),
  api: createLogger('log', '🌐', 'API'),
  product: createLogger('log', '📦', 'PRODUCT'),
  config: createLogger('log', '⚙️', 'CONFIG'),
  nutrition: createLogger('log', '🍎', 'NUTRITION'),
  modal: createLogger('log', '🪟', 'MODAL'),
  checkout: createLogger('log', '💳', 'CHECKOUT'),
  
  // Performance timing
  time: (label: string) => {
    if (isDev) console.time(`⏱️ ${label}`)
  },
  timeEnd: (label: string) => {
    if (isDev) console.timeEnd(`⏱️ ${label}`)
  },

  // Group logging
  group: (label: string, fn: () => void) => {
    if (!isDev) return fn()
    console.group(`📂 ${label}`)
    fn()
    console.groupEnd()
  },

  // Table for arrays/objects
  table: (data: unknown[], columns?: string[]) => {
    if (isDev) console.table(data, columns)
  },
}

export default debug
