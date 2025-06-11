import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

export const uploadImageToSupabase = async (imageBlob: Blob, owner: string, repo: string): Promise<string | null> => {
  try {
    const timestamp = Date.now();
    const fileName = `${owner}/${repo}-${timestamp}.png`;
    const filePath = `graphs/${fileName}`;

    // Upload the file
    const { error } = await supabase.storage
      .from('contribution-graphs')
      .upload(filePath, imageBlob, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      console.error('Error uploading image to Supabase Storage:', error);
      return null;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('contribution-graphs')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadImageToSupabase:', error);
    return null;
  }
}; 