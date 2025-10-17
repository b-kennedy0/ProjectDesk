import Head from 'next/head';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import useSWR from "swr";
import { BellIcon } from "@heroicons/react/24/outline";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Layout({ title, children }: { title?: string; children: React.ReactNode }) {
  const { data: session } = useSession();

  const { data } = useSWR("/api/notifications/unread-count", fetcher, {
  refreshInterval: 10000, // refresh every 10s
});

const unreadCount = data?.unreadCount || 0;

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
  <Link href="/notifications" className="relative">
    <BellIcon className="h-5 w-5 text-gray-700 hover:text-blue-600 transition" />
    {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
      {unreadCount}
    </span>
    )}
  </Link>

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