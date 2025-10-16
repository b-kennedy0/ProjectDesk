index.tsx
```tsx
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl w-full space-y-6 text-center">
        <h1 className="text-3xl font-bold">ProjectDesk</h1>
        <p className="text-gray-600">Research project management for supervisors, students, and collaborators.</p>
        {!session ? (
          <button
            onClick={() => signIn()}
            className="px-4 py-2 bg-black text-white rounded-md"
          >
            Sign in
          </button>
        ) : (
          <div className="space-y-3">
            <p>Signed in as <strong>{session.user?.email}</strong></p>
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard" className="px-4 py-2 bg-black text-white rounded-md">Go to Dashboard</Link>
              <button onClick={() => signOut()} className="px-4 py-2 border rounded-md">Sign out</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
```
