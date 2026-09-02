import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CheckCircle2, Shield, UserCheck } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Panel', href: '/BV/dashboard' },
  { icon: Users, label: 'Red Global', href: '/BV/red' },
  { icon: CheckCircle2, label: 'Validar', href: '/BV/validar' },
  { icon: Shield, label: 'Admin', href: '/BV/comisiones' },
  { icon: UserCheck, label: 'Perfil', href: '/BV/perfil' }, 
];

export function AdminNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#07130E]/95 backdrop-blur-xl border-t border-emerald-500/20 shadow-2xl">
      <ul className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <li key={item.label} className="flex-1">
              <Link
                to={item.href}
                className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-lg transition-all ${isActive ? 'bg-emerald-500/20 text-emerald-300' : ''}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
