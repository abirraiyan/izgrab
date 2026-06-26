import { supabaseAdmin } from './src/integrations/supabase/client.server.js';

async function test() {
  console.log('Testing Supabase connection...');
  const { data, error } = await supabaseAdmin.from('cms_products').select('*').limit(1);
  if (error) {
    console.error('Error fetching cms_products:', error);
  } else {
    console.log('cms_products works, data:', data);
  }
}

test();
