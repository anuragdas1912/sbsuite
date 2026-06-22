import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    // Only set VAPID details if keys are present (bypasses static build crash on Vercel)
    if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@sbsuite.app',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
    } else {
        console.warn('Push keys missing, skipping notification');
    }
    const { target_role, target_user_id, title, body, url } = await req.json();

    let query = supabase.from('push_subscriptions').select('subscription');

    if (target_user_id) {
      query = query.eq('user_id', target_user_id);
    } else if (target_role) {
      query = query.eq('role', target_role);
    }

    const { data: subs, error } = await query;

    if (error || !subs || subs.length === 0) {
      return NextResponse.json({ success: false, message: 'No subscriptions found' });
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/'
    });

    const promises = subs.map(sub => 
      webpush.sendNotification(sub.subscription, payload).catch(err => {
        console.error('Push error:', err);
        // Optionally delete expired subscriptions here
      })
    );

    await Promise.all(promises);

    return NextResponse.json({ success: true, count: subs.length });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
