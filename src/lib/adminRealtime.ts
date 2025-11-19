import { 
  getOrders,
  getTodayStats, 
  getDashboardAnalytics,
  getCoupons,
  getBatchData,
  smartPolling,
  BatchDataRequest
} from './adminApi';

// ===========================
// SSE Manager
// ===========================

class SSEManager {
  private eventSource: EventSource | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private callbacks: Map<string, Function[]> = new Map();

  connect(url: string) {
    if (this.eventSource) {
      this.disconnect();
    }

    try {
      this.eventSource = new EventSource(url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('SSE connection failed:', error);
      this.scheduleReconnect();
    }
  }

  private setupEventHandlers() {
    if (!this.eventSource) return;

    this.eventSource.onopen = () => {
      console.log('🔌 SSE Connected');
      this.reconnectAttempts = 0;
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('SSE message parse error:', error);
      }
    };

    this.eventSource.onerror = () => {
      console.error('SSE connection error');
      this.scheduleReconnect();
    };

    // Handle specific event types
    this.eventSource.addEventListener('order_update', (event) => {
      const data = JSON.parse(event.data);
      this.triggerCallbacks('order_update', data);
    });

    this.eventSource.addEventListener('status_change', (event) => {
      const data = JSON.parse(event.data);
      this.triggerCallbacks('status_change', data);
    });
  }

  private handleMessage(data: any) {
    const { type, payload } = data;
    this.triggerCallbacks(type, payload);
  }

  private triggerCallbacks(eventType: string, data: any) {
    const callbacks = this.callbacks.get(eventType) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('SSE callback error:', error);
      }
    });
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('SSE max reconnection attempts reached');
      return;
    }

    setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`SSE reconnect attempt ${this.reconnectAttempts}`);
      // Reconnect logic would go here
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  on(eventType: string, callback: Function) {
    if (!this.callbacks.has(eventType)) {
      this.callbacks.set(eventType, []);
    }
    this.callbacks.get(eventType)!.push(callback);
  }

  off(eventType: string, callback: Function) {
    const callbacks = this.callbacks.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
}

// Global SSE instance
const sseManager = new SSEManager();

// Real-time update manager for admin dashboard
export class AdminRealtimeManager {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private callbacks: Map<string, Function> = new Map();
  private lastData: Map<string, any> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private sseEnabled: boolean = false;
  private settings: {
    orderNotifications: boolean;
    soundNotifications: boolean;
    autoRefresh: boolean;
    refreshInterval: number;
    smartPolling: boolean;
    sseEnabled: boolean;
    batchMode: boolean;
  } = {
    orderNotifications: true,
    soundNotifications: false, // Disabled by default to reduce noise
    autoRefresh: false, // Disabled - use manual refresh instead
    refreshInterval: 120, // 2 minutes if enabled
    smartPolling: true,
    sseEnabled: false,
    batchMode: true
  };

  constructor() {
    // Load settings from localStorage (client-side only)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem('adminSettings');
        if (saved) {
          this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
      } catch (error) {
        console.warn('Failed to load admin settings from localStorage:', error);
      }
    }

    // Setup SSE if enabled
    if (this.settings.sseEnabled) {
      this.setupSSE();
    }

    // Setup SSE event handlers
    sseManager.on('order_update', (data: any) => {
      this.handleSSEOrderUpdate(data);
    });

    sseManager.on('status_change', (data: any) => {
      this.handleSSEStatusChange(data);
    });
  }

  // Setup SSE connection
  private setupSSE() {
    const sseUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/sse`;
    sseManager.connect(sseUrl);
  }

  // Handle SSE order updates
  private handleSSEOrderUpdate(data: any) {
    console.log('📡 SSE Order Update:', data);
    
    // Update cache
    this.updateCache('orders', data.orders, 5000); // 5 seconds TTL
    
    // Trigger callbacks
    const callback = this.callbacks.get('orders');
    if (callback) {
      callback(data.orders, true);
    }

    // Show notification
    if (this.settings.orderNotifications) {
      this.showNotification('orders', data.orders);
    }
  }

  // Handle SSE status changes
  private handleSSEStatusChange(data: any) {
    console.log('📡 SSE Status Change:', data);
    
    // Update specific order in cache
    const cachedOrders = this.getCache('orders');
    if (cachedOrders) {
      const updatedOrders = cachedOrders.data.map((order: any) => 
        order.id === data.orderId ? { ...order, ...data.updates } : order
      );
      this.updateCache('orders', updatedOrders, 5000);
      
      const callback = this.callbacks.get('orders');
      if (callback) {
        callback(updatedOrders, true);
      }
    }
  }

  // Cache management
  private updateCache(key: string, data: any, ttl: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private getCache(key: string): { data: any; timestamp: number; ttl: number } | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached;
  }

  // Update settings
  updateSettings(newSettings: Partial<typeof this.settings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('adminSettings', JSON.stringify(this.settings));
      } catch (error) {
        console.warn('Failed to save admin settings to localStorage:', error);
      }
    }
    
    // Restart polling with new interval if changed
    if (newSettings.refreshInterval || newSettings.smartPolling) {
      this.restartAll();
    }
    
    // Toggle SSE if enabled/disabled
    if (newSettings.sseEnabled !== undefined) {
      if (newSettings.sseEnabled && !this.sseEnabled) {
        this.setupSSE();
      } else if (!newSettings.sseEnabled && this.sseEnabled) {
        sseManager.disconnect();
      }
      this.sseEnabled = newSettings.sseEnabled;
    }
    
    // Stop all polling if auto-refresh disabled
    if (newSettings.autoRefresh === false) {
      this.stopAll();
    } else if (newSettings.autoRefresh === true) {
      this.startAll();
    }
  }

  // Register callback for data type
  on(dataType: string, callback: (...args: any[]) => void) {
    this.callbacks.set(dataType, callback);
  }

  // Start polling for specific data type
  start(dataType: string, intervalMs?: number) {
    if (!this.settings.autoRefresh) return;

    this.stop(dataType); // Clear existing interval

    // Use smart polling if enabled
    let interval = intervalMs;
    if (this.settings.smartPolling) {
      interval = smartPolling.calculateInterval(dataType);
    } else {
      interval = intervalMs || this.settings.refreshInterval * 1000;
    }

    const pollFunction = () => {
      this.fetchData(dataType);
    };

    const timeoutId = setTimeout(pollFunction, interval);
    this.intervals.set(dataType, timeoutId as any);
    
    // Initial fetch
    this.fetchData(dataType);
  }

  // Stop polling for specific data type
  stop(dataType: string) {
    const timeoutId = this.intervals.get(dataType);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.intervals.delete(dataType);
    }
  }

  // Start all polling (Optimized MORE - تم التحسين أكثر)
  startAll() {
    if (!this.settings.autoRefresh) return;

    // Use batch mode if enabled
    if (this.settings.batchMode) {
      this.startBatchMode();
      return;
    }

    // ✅ تحسين أكثر: زيادة Intervals لتقليل الضغط على API بشكل كبير
    const baseInterval = Math.max((this.settings.refreshInterval || 30), 30) * 1000; // 30s minimum (كان 15s)
    
    this.start('orders', baseInterval); // Orders: 30s (كان 15s)
    this.start('stats', baseInterval * 4); // Stats: 120s (كان 60s)
    this.start('coupons', baseInterval * 8); // Coupons: 240s (كان 120s)
    this.start('analytics', baseInterval * 8); // Analytics: 240s (كان 120s)
  }

  // Start batch mode for efficient polling (Optimized MORE - تم التحسين أكثر)
  private startBatchMode() {
    // ✅ تحسين أكثر: زيادة Interval لتقليل الضغط على API بشكل كبير
    const baseInterval = Math.max((this.settings.refreshInterval || 30), 30) * 1000; // 30s minimum (كان 20s)
    
    // Batch all data types in one request
    this.startBatch(['orders', 'stats', 'coupons', 'analytics'], baseInterval);
  }

  // Start batch polling
  private startBatch(dataTypes: string[], intervalMs: number) {
    const batchKey = dataTypes.join('-');
    this.stop(batchKey);

    const pollFunction = () => {
      this.fetchBatchData(dataTypes);
    };

    const timeoutId = setTimeout(pollFunction, intervalMs);
    this.intervals.set(batchKey, timeoutId as any);
    
    // Initial fetch
    this.fetchBatchData(dataTypes);
  }

  // Fetch batch data
  private async fetchBatchData(dataTypes: string[]) {
    try {
      const batchRequest: BatchDataRequest = {
        dataTypes: dataTypes as ('orders' | 'stats' | 'coupons' | 'analytics')[]
      };

      const response = await getBatchData(batchRequest);
      
      // Process each data type
      dataTypes.forEach(dataType => {
        const data = response[dataType as keyof typeof response];
        if (data) {
          this.handleDataUpdate(dataType, data);
        }
      });

    } catch (error) {
      console.error('Batch fetch failed:', error);
    }
  }

  // Stop all polling
  stopAll() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
  }

  // Restart all polling
  restartAll() {
    this.stopAll();
    this.startAll();
  }

  // Fetch data and trigger callbacks
  private async fetchData(dataType: string) {
    try {
      // Check cache first
      const cached = this.getCache(dataType);
      if (cached && !this.settings.smartPolling) {
        const callback = this.callbacks.get(dataType);
        if (callback) {
          callback(cached.data, false);
        }
        return;
      }

      let data: any;

      switch (dataType) {
        case 'orders':
          const ordersRes = await getOrders();
          data = ordersRes.data.orders;
          break;

        case 'stats':
          const statsRes = await getTodayStats();
          data = statsRes;
          break;

        case 'coupons':
          const couponsRes = await getCoupons();
          data = couponsRes.data;
          break;

        case 'analytics':
          const analyticsRes = await getDashboardAnalytics();
          data = analyticsRes;
          break;

        default:
          return;
      }

      this.handleDataUpdate(dataType, data);

    } catch (error) {
      console.error(`Failed to fetch ${dataType}:`, error);
    }
  }

  // Handle data updates
  private handleDataUpdate(dataType: string, data: any) {
    // Check if data changed
    const lastData = this.lastData.get(dataType);
    const hasChanged = JSON.stringify(data) !== JSON.stringify(lastData);

    if (hasChanged || !lastData) {
      this.lastData.set(dataType, data);
      
      // Update cache
      this.updateCache(dataType, data, 5000); // 5 seconds TTL
      
      // Update smart polling activity
      if (this.settings.smartPolling) {
        smartPolling.updateActivity(dataType, hasChanged);
      }
      
      // Trigger callback
      const callback = this.callbacks.get(dataType);
      if (callback) {
        callback(data, hasChanged);
      }

      // Show notification for important changes
      if (hasChanged && this.settings.orderNotifications) {
        this.showNotification(dataType, data);
      }

      // Adjust polling interval if smart polling enabled
      if (this.settings.smartPolling && hasChanged) {
        this.adjustPollingInterval(dataType);
      }
    }
  }

  // Adjust polling interval based on activity
  private adjustPollingInterval(dataType: string) {
    const newInterval = smartPolling.calculateInterval(dataType);
    const currentTimeoutId = this.intervals.get(dataType);
    
    if (currentTimeoutId) {
      this.stop(dataType);
      this.start(dataType, newInterval);
    }
  }

  // Show browser notification
  private showNotification(dataType: string, data: any) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      let title = '';
      let body = '';

      switch (dataType) {
        case 'orders':
          title = '📦 Orders Updated';
          body = `${data?.length || 0} orders in system`;
          break;

        case 'stats':
          title = '📊 Dashboard Stats Updated';
          body = `Today: ${data.todayOrders} orders, ${data.todayRevenue} SAR revenue`;
          break;
        case 'coupons':
          title = '🎫 Coupons Updated';
          body = `${data.length} coupons in system`;
          break;
        case 'analytics':
          title = '📈 Analytics Updated';
          body = 'New analytics data available';
          break;
      }

      if (title) {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: dataType
        });

        // Play sound if enabled
        if (this.settings.soundNotifications) {
          this.playNotificationSound();
        }
      }
    }
  }

  // Play notification sound
  private playNotificationSound() {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OmkUgwOT6Xh8LNoHwU7k9jyz3ovBSV1xe/blkILElyx6OyrWBYLRJzg8r5sIQUuhM/y2Yk2CBdju+zpplQMDU+o4/C2Yx8FOpPY8s56LAUpd8bv25dDDBFasOjrq1kXC0Oa3/K/bSEFL4XP8tmJNggXYrvs6aVTDA1PqeT');
    audio.play().catch(() => {
      // Ignore errors
    });
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  // Get current settings
  getSettings() {
    return this.settings;
  }

  // Cleanup
  destroy() {
    this.stopAll();
    this.callbacks.clear();
    this.lastData.clear();
  }
}

// Lazy-loaded global instance
let adminRealtimeInstance: AdminRealtimeManager | null = null;

export function getAdminRealtime(): AdminRealtimeManager {
  if (!adminRealtimeInstance) {
    adminRealtimeInstance = new AdminRealtimeManager();
  }
  return adminRealtimeInstance;
}

// Export a getter function to avoid SSR instantiation
export const adminRealtime = () => getAdminRealtime();
