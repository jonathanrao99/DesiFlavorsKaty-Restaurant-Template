import Link from 'next/link';

export default function NimdaNavbar() {
  return (
    <header className="shadow-none transition-colors duration-300 bg-transparent pt-4">
      <div className="container mx-auto px-4 py-2 flex items-center justify-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-samarkan text-3xl text-desi-orange">Desi</span>
          <span className="font-display text-2xl font-bold tracking-wide text-desi-black">Flavors Katy</span>
        </Link>
      </div>
    </header>
  );
} 