import { insforge } from '@/lib/insforge';
import { auth } from '@insforge/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_EMAIL = 'aswineye10@gmail.com';

async function checkAdmin() {
    try {
        const { user } = await auth();
        const email = (user as any)?.email;
        return email === ADMIN_EMAIL;
    } catch (error) {
        console.error('Admin check error:', error);
        return false;
    }
}

export async function GET() {
    try {
        // We allow GET for local testing easily, but can be protected if desired.
        // For admin dash, let's protect it.
        const isAdmin = await checkAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await insforge.database
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const isAdmin = await checkAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, price, image, category, is_on_deal, discount_percent } = body;

        if (!name || !price || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await insforge.database
            .from('products')
            .insert({
                name,
                description,
                price: Number(price),
                image,
                category,
                is_on_deal: !!is_on_deal,
                discount_percent: Number(discount_percent || 0),
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
