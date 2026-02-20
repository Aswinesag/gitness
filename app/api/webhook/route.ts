import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Disable body parsing — Stripe needs the raw body for signature verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    // If no webhook secret is configured, skip signature verification
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
        if (webhookSecret && signature) {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } else {
            event = JSON.parse(body) as Stripe.Event;
        }
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (userId) {
            try {
                // Import InsForge dynamically for server-side
                const { createClient } = await import('@insforge/sdk');
                const insforge = createClient({
                    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
                    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
                });

                // Create order
                await insforge.database.from('orders').insert({
                    user_id: userId,
                    total_amount: (session.amount_total || 0) / 100,
                    status: 'confirmed',
                });

                // Clear cart
                await insforge.database
                    .from('cart_items')
                    .delete()
                    .eq('user_id', userId);

                console.log(`Order created for user ${userId}`);
            } catch (dbError) {
                console.error('Database error in webhook:', dbError);
            }
        }
    }

    return NextResponse.json({ received: true });
}
