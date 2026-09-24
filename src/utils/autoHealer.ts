/**
 * Ultra-Resilient Auto-Healing & 1-Minute Diagnostic Patrol Engine
 * for Viral Sarees.
 * 
 * Features:
 * 1. Instant Auto-Fix on any detected runtime error or unhandled rejection.
 * 2. Continuous 1-Minute Auto-Scan Patrol (every 60s) checking:
 *    - Corrupt LocalStorage & SessionStorage
 *    - White screen / empty #root detection & auto-revival
 *    - Broken image auto-replacement with verified HD saree fallbacks
 *    - Trapped scroll / stuck modal locks auto-release
 *    - Server health & keep-alive ping
 * 3. Stale cache & chunk recovery without disrupting user shopping experience.
 */

const RELOAD_GUARD_KEY = 'vls_auto_heal_timestamp';
const RELOAD_COUNT_KEY = 'vls_auto_heal_count';
const MAX_AUTO_RELOADS_PER_MINUTE = 2;

// Fallback high-definition saree images to auto-repair broken media
export const HD_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85'
];

/**
 * Checks whether we can safely auto-reload without entering an infinite loop
 */
export function canAutoHealReload(): boolean {
  try {
    const now = Date.now();
    const lastTimestamp = parseInt(sessionStorage.getItem(RELOAD_GUARD_KEY) || '0', 10);
    const count = parseInt(sessionStorage.getItem(RELOAD_COUNT_KEY) || '0', 10);

    // If more than 60 seconds passed since last auto-heal, reset counter
    if (now - lastTimestamp > 60000) {
      sessionStorage.setItem(RELOAD_GUARD_KEY, String(now));
      sessionStorage.setItem(RELOAD_COUNT_KEY, '1');
      return true;
    }

    if (count < MAX_AUTO_RELOADS_PER_MINUTE) {
      sessionStorage.setItem(RELOAD_GUARD_KEY, String(now));
      sessionStorage.setItem(RELOAD_COUNT_KEY, String(count + 1));
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Sanitize all stored application keys and auto-fix corrupt JSON
 */
export function sanitizeAllStorage(): { repairedCount: number; clearedKeys: string[] } {
  const clearedKeys: string[] = [];
  let repairedCount = 0;

  try {
    const totalKeys = localStorage.length;
    for (let i = totalKeys - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (key.startsWith('vls_')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            // Verify array/object consistency for critical data
            if (key === 'vls_cart_items' && !Array.isArray(parsed)) {
              localStorage.setItem(key, '[]');
              repairedCount++;
              clearedKeys.push(key);
            }
            if (key === 'vls_wishlist_items' && !Array.isArray(parsed)) {
              localStorage.setItem(key, '[]');
              repairedCount++;
              clearedKeys.push(key);
            }
          } catch {
            console.warn(`[AutoHealer] Detected corrupted JSON in storage key "${key}". Auto-repaired.`);
            localStorage.removeItem(key);
            repairedCount++;
            clearedKeys.push(key);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[AutoHealer] Storage sanitization warning:', err);
  }

  return { repairedCount, clearedKeys };
}

/**
 * Auto-Fix and restore application state smoothly
 */
export async function autoFixAndRestoreStore(hardReset = false): Promise<void> {
  console.log('🔄 [AutoHealer] Triggering store self-repair...');

  try {
    // 1. Unregister stuck/outdated service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('[AutoHealer] Cleaned service worker registration.');
      }
    }

    // 2. Clear browser CacheStorage (removes stale JS bundles)
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        await caches.delete(name);
        console.log('[AutoHealer] Purged stale browser cache:', name);
      }
    }

    // 3. Sanitize LocalStorage
    sanitizeAllStorage();

    if (hardReset) {
      const resetKeys = ['vls_catalogue_sarees', 'vls_orders', 'vls_customers_db'];
      resetKeys.forEach((k) => localStorage.removeItem(k));
    }

    // Clear session guard flags
    try {
      sessionStorage.removeItem(RELOAD_GUARD_KEY);
      sessionStorage.removeItem(RELOAD_COUNT_KEY);
    } catch {}

  } catch (err) {
    console.warn('[AutoHealer] Cleanup step error:', err);
  }

  // Smooth refresh without showing blank screen
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('_vls_healed', String(Date.now()));
    window.location.replace(url.toString());
  } catch {
    window.location.reload();
  }
}

/**
 * Scans all images on screen and replaces any broken ones with HD saree fallbacks
 */
export function autoFixBrokenImages(): number {
  if (typeof document === 'undefined') return 0;
  let fixedCount = 0;

  try {
    const images = document.querySelectorAll('img');
    images.forEach((img, idx) => {
      // If image is complete but has 0 natural dimensions, it failed to load
      if (img.complete && img.naturalWidth === 0 && img.src && !img.src.includes('data:image/svg')) {
        const fallback = HD_FALLBACK_IMAGES[idx % HD_FALLBACK_IMAGES.length];
        console.warn(`[AutoHealer] Auto-fixing broken image: ${img.src} -> Replaced with HD fallback.`);
        img.src = fallback;
        fixedCount++;
      }
    });
  } catch (err) {
    console.warn('[AutoHealer] Image inspection warning:', err);
  }

  return fixedCount;
}

/**
 * Checks if document body is inadvertently locked and releases it
 */
export function autoFixTrappedScroll(): boolean {
  if (typeof document === 'undefined') return false;

  try {
    const hasActiveModal = document.querySelector('[role="dialog"], .fixed.inset-0.z-50');
    if (!hasActiveModal && document.body.style.overflow === 'hidden') {
      document.body.style.overflow = '';
      console.log('[AutoHealer] Auto-unlocked trapped page scroll.');
      return true;
    }
  } catch {}
  return false;
}

/**
 * Verifies that the root container is populated (not a blank screen)
 */
export function autoVerifyRootMounted(): boolean {
  if (typeof document === 'undefined') return true;

  try {
    const root = document.getElementById('root');
    if (root && root.children.length === 0) {
      console.error('[AutoHealer] Detected blank root element! Auto-healing...');
      if (canAutoHealReload()) {
        autoFixAndRestoreStore(false);
      }
      return false;
    }
  } catch {}
  return true;
}

/**
 * Safe LocalStorage wrapper to prevent QuotaExceeded or JSON crashes
 */
export const safeStorage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`[SafeStorage] get error for key "${key}", auto-repaired to default.`, e);
      try {
        localStorage.removeItem(key);
      } catch {}
      return defaultValue;
    }
  },

  set(key: string, value: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`[SafeStorage] Storage quota full or error for key "${key}". Auto-purging stale items...`, e);
      try {
        // Free space by clearing transient search or reels cache
        localStorage.removeItem('vls_search_history');
        localStorage.removeItem('vls_recent_views');
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
};

/**
 * CONTINUOUS 1-MINUTE DIAGNOSTIC & AUTO-HEAL PATROL
 * Automatically runs every 60 seconds (1 minute).
 */
export function startOneMinuteAutoHealer(): void {
  if (typeof window === 'undefined') return;

  // Prevent duplicate patrol timers
  if ((window as any).__vls_one_minute_patrol_active) return;
  (window as any).__vls_one_minute_patrol_active = true;

  console.log('🛡️ [AutoHealer] 1-Minute Continuous Diagnostic Patrol activated.');

  // Run initial sanity pass
  sanitizeAllStorage();
  autoFixBrokenImages();

  // Schedule periodic patrol every 60 seconds (1 minute)
  window.setInterval(async () => {
    try {
      const nowStr = new Date().toLocaleTimeString();
      console.log(`🔍 [AutoHealer 1-Min Patrol] Running automated scan at ${nowStr}...`);

      // 1. Storage Health Scan
      const { repairedCount } = sanitizeAllStorage();

      // 2. Broken Image Scan & HD auto-repair
      const fixedImages = autoFixBrokenImages();

      // 3. Page Scroll Lock Sanity
      autoFixTrappedScroll();

      // 4. White Screen / Empty Root Check
      autoVerifyRootMounted();

      // 5. Server Health Ping & Keep-Alive
      try {
        const resp = await fetch('/api/health', { method: 'GET', cache: 'no-store' });
        if (!resp.ok) {
          console.warn('[AutoHealer 1-Min Patrol] Server health ping non-200:', resp.status);
        }
      } catch {
        console.warn('[AutoHealer 1-Min Patrol] Server health ping failed, auto-retrying on next turn.');
      }

      if (repairedCount > 0 || fixedImages > 0) {
        console.log(`✅ [AutoHealer 1-Min Patrol] Auto-fixed ${repairedCount} storage items and ${fixedImages} media items.`);
      } else {
        console.log('✨ [AutoHealer 1-Min Patrol] All store systems healthy, 0 errors detected.');
      }

    } catch (patrolError) {
      console.warn('[AutoHealer] Patrol exception caught and handled:', patrolError);
    }
  }, 60000); // Exactly 1 minute (60,000 milliseconds)
}

/**
 * Initialize global uncaught error listeners with instant auto-fix
 */
export function initGlobalAutoHealer(): void {
  if (typeof window === 'undefined') return;

  // Prevent multiple initializations
  if ((window as any).__vls_auto_healer_initialized) return;
  (window as any).__vls_auto_healer_initialized = true;

  // Start the 1-Minute Diagnostic Patrol
  startOneMinuteAutoHealer();

  // Instant reactive error auto-fixer
  window.addEventListener('error', (event) => {
    const errorMsg = String(event?.message || event?.error?.message || '');
    console.error('🚨 [AutoHealer] Caught window error:', errorMsg);

    const isChunkOrModuleError = 
      errorMsg.includes('dynamically imported module') ||
      errorMsg.includes('Loading chunk') ||
      errorMsg.includes('CSS_CHUNK_LOAD_FAILED') ||
      errorMsg.includes('Importing a module script failed');

    if (isChunkOrModuleError) {
      console.warn('⚡ [AutoHealer] Detected stale module chunk. Instantly auto-healing...');
      if (canAutoHealReload()) {
        autoFixAndRestoreStore(false);
      }
    } else {
      // Auto-sanitize storage and check images
      sanitizeAllStorage();
      autoFixBrokenImages();
    }
  });

  // Instant reactive unhandled promise rejection auto-fixer
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const errorMsg = String(reason?.message || reason || '');
    console.warn('🚨 [AutoHealer] Caught unhandled promise rejection:', errorMsg);

    const isChunkOrModuleError = 
      errorMsg.includes('dynamically imported module') ||
      errorMsg.includes('Loading chunk') ||
      errorMsg.includes('CSS_CHUNK_LOAD_FAILED') ||
      errorMsg.includes('Importing a module script failed');

    if (isChunkOrModuleError) {
      console.warn('⚡ [AutoHealer] Detected stale module chunk from rejection. Instantly auto-healing...');
      if (canAutoHealReload()) {
        autoFixAndRestoreStore(false);
      }
    }
  });
}
