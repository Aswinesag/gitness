import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
    try {
        const { cartItems, userId } = await request.json();

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        if (!userId) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        // Build Stripe line items from cart data
        const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = cartItems.map(
            (item: any) => {
                const product = item.products;
                let unitAmount = Math.round(product.price * 100); // Stripe uses cents

                // Apply discount if on deal
                if (product.is_on_deal && product.discount_percent) {
                    unitAmount = Math.round(
                        product.price * (1 - product.discount_percent / 100) * 100
                    );
                }

                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: product.name,
                            ...(product.image ? { images: [product.image] } : {}),
                        },
                        unit_amount: unitAmount,
                    },
                    quantity: item.quantity,
                };
            }
        );

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.nextUrl.origin}/checkout`,
            metadata: {
                userId,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe session error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
