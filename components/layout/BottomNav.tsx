'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BarChart2,
  MoreHorizontal,
  PlusCircle,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/finance', label: 'Finanțe', icon: BarChart2 },
  { href: '/treatments/new', label: 'Adaugă', icon: PlusCircle, highlight: true },
  { href: '/clients', label: 'Clientele', icon: Users },
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
      {navItems.map(({ href, label, icon: Icon, highlight }) => {
        const isActive =
          href === '/' ? pathname === '/' : pathname.startsWith(href);
        if (highlight) {
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-1">
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: -14, boxShadow: '0 4px 12px rgba(198,167,105,0.4)' }}>
                <Icon size={22} color="white" />
              </div>
              <span className="text-[10px] font-semibold" style={{ color: 'var(--gold)' }}>{label}</span>
            </Link>
          );
        }
        return (
          <Link key={href} href={href}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2">
            <Icon size={20} style={{ color: isActive ? 'var(--gold)' : 'var(--taupe-light)' }} />
            <span className="text-[10px] font-medium" style={{ color: isActive ? 'var(--gold)' : 'var(--taupe-light)' }}>{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
