import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://odrvyjagkutvemoroieq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_hzQ1pHS-9TAhZADAlAFtAA_CV6EB4xW';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Uploads a meter proof photo to Supabase Storage bucket ('meter-proofs').
 * If remote upload fails, returns a local persistent object URL or data URL as safe fallback.
 */
export async function uploadMeterPhoto(file: File, unitNumber: string): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${unitNumber}_${Date.now()}.${fileExt}`;
    const filePath = `meters/${fileName}`;

    const { data, error } = await supabase.storage
      .from('meter-proofs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.warn('Supabase storage upload returned error, using local fallback:', error);
      return await fileToDataUrl(file);
    }

    const { data: publicData } = supabase.storage
      .from('meter-proofs')
      .getPublicUrl(filePath);

    return publicData.publicUrl || (await fileToDataUrl(file));
  } catch (err) {
    console.warn('Network error uploading meter proof, using fallback:', err);
    return await fileToDataUrl(file);
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve(URL.createObjectURL(file));
    reader.readAsDataURL(file);
  });
}
