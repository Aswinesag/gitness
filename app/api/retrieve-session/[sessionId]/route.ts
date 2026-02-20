import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params;

    if (!sessionId) {
        return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items', 'payment_intent'],
        });

        return NextResponse.json({
            session,
            customer_details: session.customer_details,
            amount_total: session.amount_total,
            currency: session.currency,
            status: session.payment_status,
            metadata: session.metadata,
        });
    } catch (error: any) {
        console.error('Error retrieving session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
