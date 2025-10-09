// Test script để kiểm tra Homepage
// Chạy trong browser console khi đang ở trang chủ

function testHomepage() {
  console.log('🧪 Testing Homepage...');
  
  // Check if we're on the homepage
  if (window.location.pathname !== '/') {
    console.log('⚠️ Not on homepage, navigating...');
    window.location.href = '/';
    return;
  }
  
  // Wait for page to load
  setTimeout(() => {
    // Check if page loaded without errors
    const errorElements = document.querySelectorAll('[class*="error"]');
    if (errorElements.length > 0) {
      console.log('❌ Found error elements on page');
      errorElements.forEach((el, index) => {
        console.log(`Error ${index + 1}:`, el.textContent);
      });
      return;
    }
    
    console.log('✅ Homepage loaded without errors');
    
    // Check main sections
    const sections = [
      { selector: 'header', name: 'Header' },
      { selector: 'section', name: 'Hero Section' },
      { selector: '[class*="container"]', name: 'Main Content' },
      { selector: 'footer', name: 'Footer' },
    ];
    
    sections.forEach(section => {
      const element = document.querySelector(section.selector);
      if (element) {
        console.log(`✅ ${section.name} found`);
      } else {
        console.log(`❌ ${section.name} not found`);
      }
    });
    
    // Check if reviews are displayed
    const reviewsGrid = document.querySelector('[class*="space-y-8"]');
    if (reviewsGrid) {
      const reviewCards = reviewsGrid.querySelectorAll('[class*="card"]');
      console.log(`✅ Reviews grid found with ${reviewCards.length} review cards`);
      
      if (reviewCards.length > 0) {
        // Check first review card
        const firstReview = reviewCards[0];
        const title = firstReview.querySelector('h3');
        const thumbnail = firstReview.querySelector('img');
        const summary = firstReview.querySelector('p');
        
        if (title) console.log('✅ Review title:', title.textContent?.slice(0, 50) + '...');
        if (thumbnail) console.log('✅ Review thumbnail:', thumbnail.src);
        if (summary) console.log('✅ Review summary:', summary.textContent?.slice(0, 50) + '...');
      }
    } else {
      console.log('ℹ️ No reviews grid found (might be empty state)');
      
      // Check empty state
      const emptyState = document.querySelector('[class*="text-center py-20"]');
      if (emptyState) {
        console.log('✅ Empty state displayed');
        console.log('Empty state text:', emptyState.textContent);
      }
    }
    
    // Check category filters
    const categoryButtons = document.querySelectorAll('button[class*="rounded-full"]');
    console.log(`✅ Found ${categoryButtons.length} category filter buttons`);
    
    if (categoryButtons.length > 0) {
      categoryButtons.forEach((btn, index) => {
        if (index < 5) { // Show first 5 buttons
          console.log(`Category ${index + 1}:`, btn.textContent?.trim());
        }
      });
    }
    
    // Check sidebar
    const sidebar = document.querySelector('[class*="lg:col-span-1"]');
    if (sidebar) {
      console.log('✅ Sidebar found');
      
      const sidebarCards = sidebar.querySelectorAll('[class*="card"]');
      console.log(`✅ Found ${sidebarCards.length} sidebar cards`);
      
      // Check featured posts
      const featuredPosts = sidebar.querySelector('[class*="space-y-4"]');
      if (featuredPosts) {
        const featuredItems = featuredPosts.querySelectorAll('a');
        console.log(`✅ Found ${featuredItems.length} featured posts`);
      }
    }
    
    // Check loading state
    const loadingSpinner = document.querySelector('[class*="animate-spin"]');
    if (loadingSpinner) {
      console.log('⚠️ Page is still loading');
    } else {
      console.log('✅ Page finished loading');
    }
    
    console.log('🎉 Homepage test completed!');
  }, 2000);
}

function testHomepageAPI() {
  console.log('🌐 Testing Homepage APIs...');
  
  // Test reviews API
  fetch('/api/reviews?status=published')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('✅ Published reviews API working');
        console.log(`📊 Found ${data.data.length} published reviews`);
        
        if (data.data.length > 0) {
          console.log('First published review:', {
            id: data.data[0].id,
            title: data.data[0].video_title,
            status: data.data[0].status,
            views: data.data[0].views
          });
        }
      } else {
        console.error('❌ Published reviews API failed:', data.error);
      }
    })
    .catch(error => {
      console.error('❌ Published reviews API error:', error);
    });
  
  // Test categories API
  fetch('/api/categories')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('✅ Categories API working');
        console.log(`📊 Found ${data.categories.length} categories`);
        
        if (data.categories.length > 0) {
          console.log('First category:', {
            id: data.categories[0].id,
            name: data.categories[0].name,
            color: data.categories[0].color,
            icon: data.categories[0].icon
          });
        }
      } else {
        console.error('❌ Categories API failed:', data.error);
      }
    })
    .catch(error => {
      console.error('❌ Categories API error:', error);
    });
}

function testHomepageFiltering() {
  console.log('🔍 Testing Homepage Filtering...');
  
  // Get categories first
  fetch('/api/categories')
    .then(response => response.json())
    .then(categoriesData => {
      if (categoriesData.success && categoriesData.categories.length > 0) {
        const firstCategory = categoriesData.categories[0];
        console.log(`Testing filter with category: ${firstCategory.name}`);
        
        // Test filtering by category
        fetch(`/api/reviews?status=published&category=${firstCategory.id}`)
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              console.log(`✅ Category filtering working`);
              console.log(`📊 Found ${data.data.length} reviews in category "${firstCategory.name}"`);
            } else {
              console.error('❌ Category filtering failed:', data.error);
            }
          })
          .catch(error => {
            console.error('❌ Category filtering error:', error);
          });
      } else {
        console.log('❌ No categories found to test filtering');
      }
    })
    .catch(error => {
      console.error('❌ Error fetching categories:', error);
    });
}

function testHomepagePerformance() {
  console.log('⚡ Testing Homepage Performance...');
  
  const startTime = performance.now();
  
  // Test page load time
  window.addEventListener('load', () => {
    const loadTime = performance.now() - startTime;
    console.log(`✅ Page load time: ${loadTime.toFixed(2)}ms`);
    
    // Test image loading
    const images = document.querySelectorAll('img');
    console.log(`📸 Found ${images.length} images`);
    
    let loadedImages = 0;
    images.forEach(img => {
      if (img.complete) {
        loadedImages++;
      }
    });
    
    console.log(`✅ ${loadedImages}/${images.length} images loaded`);
    
    // Test responsive design
    const viewportWidth = window.innerWidth;
    console.log(`📱 Viewport width: ${viewportWidth}px`);
    
    if (viewportWidth < 768) {
      console.log('📱 Mobile view detected');
    } else if (viewportWidth < 1024) {
      console.log('💻 Tablet view detected');
    } else {
      console.log('🖥️ Desktop view detected');
    }
  });
}

// Export functions
window.homepageTests = {
  testHomepage,
  testHomepageAPI,
  testHomepageFiltering,
  testHomepagePerformance,
};

console.log('Homepage test functions loaded!');
console.log('Available functions:');
console.log('- homepageTests.testHomepage() - Test homepage UI and components');
console.log('- homepageTests.testHomepageAPI() - Test homepage APIs');
console.log('- homepageTests.testHomepageFiltering() - Test category filtering');
console.log('- homepageTests.testHomepagePerformance() - Test page performance');
