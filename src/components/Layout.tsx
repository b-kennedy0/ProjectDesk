Layout.tsx
```tsx
import Head from 'next/head';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Layout({ title, children }: { title?: string; children: React.ReactNode }) {
  const { data: session } = useSession();
  return (
    <div>
      <Head>
        <title>{title ? `${title} • ProjectDesk` : 'ProjectDesk'}</title>
      </Head>
      <header className="border-b">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold">ProjectDesk</Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm">Dashboard</Link>
            {session && (
              <button onClick={() => signOut()} className="text-sm border px-3 py-1 rounded-md">Sign out</button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
```