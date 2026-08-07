'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  Users,
  Scissors,
  Wrench,
  Calendar,
  Megaphone,
  Package,
  Target,
  Settings,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/overview', label: 'Overview', icon: TrendingUp },
  { href: '/finance', label: 'Finanțe', icon: DollarSign },
  { href: '/clients', label: 'Clientele', icon: Users },
  { href: '/services', label: 'Servicii', icon: Scissors },
  { href: '/equipment', label: 'Aparatură', icon: Wrench },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/marketing', label: 'Marketing', icon: Megaphone },
  { href: '/inventory', label: 'Inventar', icon: Package },
  { href: '/targets', label: 'Targete', icon: Target },
  { href: '/settings', label: 'Setări', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full w-full">
      {/* Logo */}
      <div className="flex flex-col items-center justify-center py-8 px-4 border-b border-white/10">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-3 text-xl font-bold"
          style={{
            background: 'var(--gold)',
            color: 'var(--taupe)',
            fontFamily: 'var(--font-cormorant)',
          }}
        >
          RI
        </div>
        <p
          className="text-white/90 text-sm font-medium leading-tight text-center"
          style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1rem' }}
        >
          Roxana Ica
        </p>
        <p className="text-white/40 text-xs mt-0.5">CEO Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all duration-150 group"
              style={{
                background: isActive
                  ? 'rgba(198,167,105,0.15)'
                  : 'transparent',
                color: isActive ? 'var(--gold)' : 'rgba(255,255,255,0.6)',
                borderLeft: isActive
                  ? '2px solid var(--gold)'
                  : '2px solid transparent',
              }}
            >
              <Icon
                size={16}
                className="shrink-0 transition-colors"
                style={{ color: isActive ? 'var(--gold)' : 'rgba(255,255,255,0.5)' }}
              />
              <span className="text-xs font-medium tracking-wide">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-white/25 text-xs text-center">
          beauty-ceo v1.0
        </p>
      </div>
    </div>
  );
}
