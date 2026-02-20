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
        return false;
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const isAdmin = await checkAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, description, price, image, category, is_on_deal, discount_percent } = body;

        const { data, error } = await insforge.database
            .from('products')
            .update({
                name,
                description,
                price: price !== undefined ? Number(price) : undefined,
                image,
                category,
                is_on_deal: is_on_deal !== undefined ? !!is_on_deal : undefined,
                discount_percent: discount_percent !== undefined ? Number(discount_percent) : undefined,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const isAdmin = await checkAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { error } = await insforge.database
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
