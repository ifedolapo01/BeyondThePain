import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-accent transition-colors hover:text-accent-hover">
          Beyond the Pain
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/stories" className="text-gray-600 hover:text-accent transition-colors">
            Stories
          </Link>
          <Link href="/resources" className="text-gray-600 hover:text-secondary transition-colors">
            Resources
          </Link>
          <Link href="/admin" className="text-gray-400 hover:text-red-400 transition-colors text-xs font-bold">
            Admin
          </Link>
          <Link
            href="/submit"
            className="px-4 py-2 rounded-full bg-accent text-white hover:bg-accent-hover transition-colors shadow-sm"
          >
            Share
          </Link>
        </nav>
      </div>
    </header>
  );
}
