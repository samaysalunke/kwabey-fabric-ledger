const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function verifyDataFlow() {
  console.log('🔍 Verifying Data Flow in All Supabase Tables...\n');

  try {
    // 1. Check fabric_entries table
    console.log('📋 Checking fabric_entries table...');
    const { data: fabricEntries, error: fabricError } = await supabase
      .from('fabric_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (fabricError) {
      console.log('❌ Error fetching fabric entries:', fabricError.message);
    } else {
      console.log(`✅ Found ${fabricEntries?.length || 0} fabric entries`);
      if (fabricEntries && fabricEntries.length > 0) {
        console.log('   Latest entry:', {
          id: fabricEntries[0].id,
          seller: fabricEntries[0].seller_name,
          status: fabricEntries[0].status,
          date: fabricEntries[0].date_inwarded
        });
      }
    }

    // 2. Check fabric_rolls table
    console.log('\n🎯 Checking fabric_rolls table...');
    const { data: fabricRolls, error: rollsError } = await supabase
      .from('fabric_rolls')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (rollsError) {
      console.log('❌ Error fetching fabric rolls:', rollsError.message);
    } else {
      console.log(`✅ Found ${fabricRolls?.length || 0} fabric rolls`);
      if (fabricRolls && fabricRolls.length > 0) {
        console.log('   Latest roll:', {
          id: fabricRolls[0].id,
          fabric_entry_id: fabricRolls[0].fabric_entry_id,
          batch_number: fabricRolls[0].batch_number,
          value: `${fabricRolls[0].roll_value} ${fabricRolls[0].roll_unit}`
        });
      }
    }

    // 3. Check rib_details table
    console.log('\n🔧 Checking rib_details table...');
    const { data: ribDetails, error: ribError } = await supabase
      .from('rib_details')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (ribError) {
      console.log('❌ Error fetching rib details:', ribError.message);
    } else {
      console.log(`✅ Found ${ribDetails?.length || 0} rib details`);
      if (ribDetails && ribDetails.length > 0) {
        console.log('   Latest rib detail:', {
          id: ribDetails[0].id,
          fabric_entry_id: ribDetails[0].fabric_entry_id,
          total_weight: ribDetails[0].total_weight,
          total_rolls: ribDetails[0].total_rolls
        });
      }
    }

    // 4. Check quality_parameters table
    console.log('\n🔬 Checking quality_parameters table...');
    const { data: qualityParams, error: qualityError } = await supabase
      .from('quality_parameters')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (qualityError) {
      console.log('❌ Error fetching quality parameters:', qualityError.message);
    } else {
      console.log(`✅ Found ${qualityParams?.length || 0} quality parameters`);
      if (qualityParams && qualityParams.length > 0) {
        console.log('   Latest quality check:', {
          id: qualityParams[0].id,
          fabric_entry_id: qualityParams[0].fabric_entry_id,
          gsm: qualityParams[0].gsm_value,
          width: qualityParams[0].width_dia_inches,
          shrinkage: qualityParams[0].shrinkage_percent,
          color_fastness: qualityParams[0].color_fastness,
          checked_by: qualityParams[0].checked_by
        });
      }
    }

    // 5. Check quantity_approvals table
    console.log('\n✅ Checking quantity_approvals table...');
    const { data: approvals, error: approvalsError } = await supabase
      .from('quantity_approvals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (approvalsError) {
      console.log('❌ Error fetching quantity approvals:', approvalsError.message);
    } else {
      console.log(`✅ Found ${approvals?.length || 0} quantity approvals`);
      if (approvals && approvals.length > 0) {
        console.log('   Latest approval:', {
          id: approvals[0].id,
          fabric_entry_id: approvals[0].fabric_entry_id,
          status: approvals[0].approval_status,
          hold_reason: approvals[0].hold_reason,
          approved_by: approvals[0].approved_by
        });
      }
    }

    // 6. Check complete workflow data
    console.log('\n🔄 Checking Complete Workflow Data...');
    const { data: completeEntries, error: completeError } = await supabase
      .from('fabric_entries')
      .select(`
        *,
        fabric_rolls (*),
        rib_details (*),
        quality_parameters (*),
        quantity_approvals (*)
      `)
      .order('created_at', { ascending: false })
      .limit(3);

    if (completeError) {
      console.log('❌ Error fetching complete workflow data:', completeError.message);
    } else {
      console.log(`✅ Found ${completeEntries?.length || 0} entries with related data`);
      
      if (completeEntries && completeEntries.length > 0) {
        completeEntries.forEach((entry, index) => {
          console.log(`\n   Entry ${index + 1}:`);
          console.log(`   - ID: ${entry.id}`);
          console.log(`   - Seller: ${entry.seller_name}`);
          console.log(`   - Status: ${entry.status}`);
          console.log(`   - Rolls: ${entry.fabric_rolls?.length || 0}`);
          console.log(`   - Rib Details: ${entry.rib_details?.length || 0}`);
          console.log(`   - Quality Params: ${entry.quality_parameters?.length || 0}`);
          console.log(`   - Approvals: ${entry.quantity_approvals?.length || 0}`);
        });
      }
    }

    // 7. Check storage bucket
    console.log('\n📁 Checking Storage Bucket...');
    const { data: files, error: storageError } = await supabase.storage
      .from('ftp-documents')
      .list('', { limit: 5 });

    if (storageError) {
      console.log('❌ Error accessing storage bucket:', storageError.message);
    } else {
      console.log(`✅ Found ${files?.length || 0} files in storage`);
      if (files && files.length > 0) {
        console.log('   Recent files:', files.map(f => f.name).slice(0, 3));
      }
    }

    // 8. Summary
    console.log('\n📊 SUMMARY:');
    console.log('='.repeat(50));
    console.log(`Fabric Entries: ${fabricEntries?.length || 0}`);
    console.log(`Fabric Rolls: ${fabricRolls?.length || 0}`);
    console.log(`Rib Details: ${ribDetails?.length || 0}`);
    console.log(`Quality Parameters: ${qualityParams?.length || 0}`);
    console.log(`Quantity Approvals: ${approvals?.length || 0}`);
    console.log(`Storage Files: ${files?.length || 0}`);

    // Status distribution
    if (fabricEntries && fabricEntries.length > 0) {
      const statusCounts = fabricEntries.reduce((acc, entry) => {
        acc[entry.status] = (acc[entry.status] || 0) + 1;
        return acc;
      }, {});
      console.log('\nStatus Distribution:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
    }

    console.log('\n✅ Data flow verification completed!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

// Run verification
verifyDataFlow(); 