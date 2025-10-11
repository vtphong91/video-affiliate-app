// Clear Supabase cache and cookies
function clearSupabaseCache() {
  // Clear localStorage
  if (typeof window !== 'undefined') {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('supabase') || key.includes('sb-')) {
        localStorage.removeItem(key);
        console.log('🗑️ Cleared localStorage key:', key);
      }
    });
    
    // Clear sessionStorage
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.includes('supabase') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
        console.log('🗑️ Cleared sessionStorage key:', key);
      }
    });
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log('✅ Cleared all Supabase cache and cookies');
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).clearSupabaseCache = clearSupabaseCache;
}

export { clearSupabaseCache };
