'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Megaphone, Image as ImageIcon, Settings, Brain, BarChart3, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Brain', href: '/dashboard/brain', icon: Brain },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: Megaphone },
  { name: 'Media Gen', href: '/dashboard/media', icon: ImageIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen glass border-r border-white/10 flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Bot size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">AdsShree</h1>
      </div>

      <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-white/10 text-white shadow-sm border border-white/5" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={18} className={cn("transition-colors", isActive ? "text-purple-400" : "group-hover:text-purple-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <Link 
          href="/dashboard/settings" 
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings size={18} />
          Settings
        </Link>
      </div>
    </div>
  );
}
