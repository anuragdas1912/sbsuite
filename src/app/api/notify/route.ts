import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenant_id, tenant_name, notification_type, message_content } = body;

    if (!tenant_id || !tenant_name || !notification_type || !message_content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert into notifications table
    const { error } = await supabase.from('notifications').insert({
      tenant_id,
      tenant_name,
      notification_type,
      message_content,
      status: 'Sent' // Mocking immediate successful send via WhatsApp/SMS API
    });

    if (error) {
      console.error('Error logging notification:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // In a real scenario with a paid service like Twilio or WhatsApp Business API,
    // we would call their endpoints here. For this app, we simulate it via logging.

    return NextResponse.json({ success: true, message: 'Notification simulated successfully' });
  } catch (error) {
    console.error('Notify API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
