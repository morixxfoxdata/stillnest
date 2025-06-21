// Quick test script to check user search
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserSearch() {
  console.log('Testing user search...');
  
  // First, get all users to see what's in the database
  const { data: allUsers, error: allError } = await supabase
    .from('users')
    .select('id, username, display_name')
    .limit(10);
  
  if (allError) {
    console.error('Error fetching all users:', allError);
    return;
  }
  
  console.log('All users in database:');
  allUsers.forEach(user => {
    console.log(`- ${user.username} (${user.display_name || 'No display name'})`);
  });
  
  // Test search for user2
  console.log('\nTesting search for "user2":');
  const { data: searchResults, error: searchError } = await supabase
    .from('users')
    .select('id, username, display_name')
    .or('username.ilike.%user2%,display_name.ilike.%user2%,bio.ilike.%user2%');
  
  if (searchError) {
    console.error('Search error:', searchError);
    return;
  }
  
  console.log('Search results:', searchResults);
  
  // Test exact username search
  console.log('\nTesting exact search for "user2":');
  const { data: exactResults, error: exactError } = await supabase
    .from('users')
    .select('id, username, display_name')
    .eq('username', 'user2');
  
  if (exactError) {
    console.error('Exact search error:', exactError);
    return;
  }
  
  console.log('Exact search results:', exactResults);
}

testUserSearch().catch(console.error);