"use client";
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { usePathname } from 'next/navigation';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const hideFooter = pathname?.startsWith('/messages');
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
            {!hideFooter && <Footer />}
        </div>
    );
}
