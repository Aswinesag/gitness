'use client';

import { useAuth, useUser } from '@insforge/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ADMIN_EMAIL = 'aswineye10@gmail.com';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoaded: userLoaded } = useUser();
    const { isSignedIn, isLoaded: authLoaded } = useAuth();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (authLoaded && userLoaded) {
            const userEmail = (user as any)?.email;
            if (!isSignedIn || userEmail !== ADMIN_EMAIL) {
                // Not authorized - redirect to home
                router.push('/');
            } else {
                setAuthorized(true);
            }
        }
    }, [isSignedIn, authLoaded, userLoaded, user, router]);

    if (!authLoaded || !userLoaded) {
        return (
            <div className="min-h-screen bg-[#050509] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!authorized) {
        return null;
    }

    return <>{children}</>;
}
