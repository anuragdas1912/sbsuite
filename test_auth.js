const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'anuragdas@sbsuite.in',
    password: 'Qwerty@252'
  });
  console.log('Error:', error);
  console.log('Data:', data.user ? data.user.id : null);
}

test();
