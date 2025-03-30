import { Link } from 'react-router-dom';
import { Home, Users, DollarSign, User, Wallet } from 'lucide-react'; // Importar el icono de billetera

const navItems = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: Users, label: 'Red', href: '/red' },
  { icon: DollarSign, label: 'Comisiones', href: '/comisiones' },
];

export function MobileNav({ billeteraActiva }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
      <ul className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <li key={item.label}>
            <Link to={item.href} className="flex flex-col items-center p-2 text-gray-400 hover:text-white">
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          </li>
        ))}
        
        <li>
          <Link to="/billetera" className="flex flex-col items-center p-2 text-gray-400 hover:text-white">
            <Wallet className="h-6 w-6" />
            <span className="text-xs mt-1">Wallet</span>
          </Link>
        </li>
        <li>
          <Link to="/perfil" className="flex flex-col items-center p-2 text-gray-400 hover:text-white">
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Perfil</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
