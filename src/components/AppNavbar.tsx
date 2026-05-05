
"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ShieldCheck, ScanLine, UserPlus, Search, Home } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/register', label: 'Registro', icon: UserPlus },
  { href: '/status', label: 'Consultar', icon: Search },
  { href: '/admin', label: 'Admin', icon: ShieldCheck },
  { href: '/ops', label: 'Operaciones', icon: ScanLine },
];

export function AppNavbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-primary text-white backdrop-blur supports-[backdrop-filter]:bg-primary/95">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold tracking-tighter text-white">COCORO</span>
          <span className="hidden sm:inline-block text-sm font-medium opacity-80 border-l pl-2 border-white/20">Distrito Ávila</span>
        </Link>
        
        <div className="flex items-center space-x-1 md:space-x-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-white text-primary" 
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
