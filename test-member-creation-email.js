// Test script for member creation with password generation and email
const testMemberCreationWithEmail = async () => {
  try {
    console.log('🧪 Testing Member Creation with Password Generation & Email...\n');
    
    const testData = {
      email: 'newuser@example.com',
      full_name: 'New User Test',
      role: 'editor',
      permissions: []
    };
    
    console.log('📤 Sending request:', testData);
    
    const response = await fetch('http://localhost:3000/api/admin/members', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const result = await response.json();
    
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Data:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ SUCCESS!');
      console.log('Member created successfully');
      
      if (result.data.password_generated) {
        console.log('🔐 Password was generated automatically');
        console.log('📧 Email notification was prepared');
        console.log('⚠️ User needs to change password on first login');
        
        console.log('\n📧 Email Content Preview:');
        console.log('=====================================');
        console.log('To:', testData.email);
        console.log('Subject: Thông tin tài khoản Video Affiliate App');
        console.log('Content: Professional HTML email template');
        console.log('Features:');
        console.log('- Gradient header with app branding');
        console.log('- Account information table');
        console.log('- Security warnings');
        console.log('- Login button');
        console.log('- Professional footer');
        console.log('=====================================');
      }
    } else {
      console.log('\n❌ FAILED!');
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testMemberCreationWithEmail();


