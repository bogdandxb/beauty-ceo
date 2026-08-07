'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Scissors,
  Users,
  BarChart2,
  MoreHorizontal,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/finance', label: 'Finanțe', icon: BarChart2 },
  { href: '/clients', label: 'Clientele', icon: Users },
  { href: '/services', label: 'Servicii', icon: Scissors },
  { href: '/settings', label: 'Mai mult', icon: MoreHorizontal },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div
      className="flex items-center justify-around h-full px-2 border-t"
      style={{
        background: 'var(--ivory)',
        borderColor: 'var(--beige)',
      }}
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2"
          >
            <Icon
              size={20}
              style={{
                color: isActive ? 'var(--gold)' : 'var(--taupe-light)',
              }}
            />
            <span
              className="text-[10px] font-medium"
              style={{
                color: isActive ? 'var(--gold)' : 'var(--taupe-light)',
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
