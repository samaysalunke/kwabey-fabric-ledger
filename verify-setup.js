// Verification script for Supabase setup
// Run with: node verify-setup.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('Required variables:');
  console.log('- REACT_APP_SUPABASE_URL');
  console.log('- REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySetup() {
  console.log('🔍 Verifying Supabase Setup...\n');

  // Test 1: Connection
  console.log('1. Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('fabric_entries').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Supabase connection successful');
  } catch (error) {
    console.log('❌ Supabase connection failed:', error.message);
    return;
  }

  // Test 2: Tables exist
  console.log('\n2. Checking database tables...');
  const tables = ['fabric_entries', 'fabric_rolls', 'rib_details', 'quality_parameters', 'quantity_approvals'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) throw error;
      console.log(`✅ Table '${table}' exists and accessible`);
    } catch (error) {
      console.log(`❌ Table '${table}' error:`, error.message);
    }
  }

  // Test 3: Storage bucket
  console.log('\n3. Checking storage bucket...');
  try {
    const { data, error } = await supabase.storage.from('ftp-documents').list('', { limit: 1 });
    if (error) throw error;
    console.log('✅ Storage bucket "ftp-documents" accessible');
  } catch (error) {
    console.log('❌ Storage bucket error:', error.message);
  }

  // Test 4: Role configuration
  console.log('\n4. Checking role configuration...');
  const roles = {
    'INWARD_CLERK': process.env.REACT_APP_INWARD_CLERK_EMAILS,
    'QUALITY_CHECKER': process.env.REACT_APP_QUALITY_CHECKER_EMAILS,
    'APPROVER': process.env.REACT_APP_APPROVER_EMAILS,
    'SUPERADMIN': process.env.REACT_APP_SUPERADMIN_EMAILS
  };

  for (const [role, emails] of Object.entries(roles)) {
    if (emails) {
      console.log(`✅ ${role}: ${emails}`);
    } else {
      console.log(`❌ ${role}: Not configured`);
    }
  }

  // Test 5: Sample data insertion (optional)
  console.log('\n5. Testing data insertion...');
  try {
    const testEntry = {
      seller_name: 'Test Verification Supplier',
      quantity_value: 100,
      quantity_unit: 'KG',
      color: 'Test Blue',
      fabric_type: 'KNITTED',
      po_number: 'VERIFY-001',
      fabric_composition: '100% Test Cotton',
      inwarded_by: 'verification@test.com',
      uat_value: 95,
      uat_unit: 'KG',
      status: 'PENDING_QUALITY'
    };

    const { data, error } = await supabase.from('fabric_entries').insert([testEntry]).select();
    if (error) throw error;
    
    console.log('✅ Test data insertion successful');
    console.log('📝 Created fabric entry with ID:', data[0].id);

    // Clean up test data
    await supabase.from('fabric_entries').delete().eq('id', data[0].id);
    console.log('🧹 Test data cleaned up');
    
  } catch (error) {
    console.log('❌ Data insertion test failed:', error.message);
  }

  console.log('\n🎉 Verification complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Open http://localhost:3000 in your browser');
  console.log('2. Login with one of your test users');
  console.log('3. Test the Fabric Inward form');
  console.log('4. Check the VERIFICATION_CHECKLIST.md for detailed testing');
}

verifySetup().catch(console.error); 