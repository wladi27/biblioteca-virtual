import { Link } from 'react-router-dom';
import { Home, Users, CheckCircle, User, Edit } from 'lucide-react'; // Importa el icono CheckCircle

const navItems = [
  { icon: Home, label: 'Home', href: '/BV/dashboard' },
  { icon: Users, label: 'Red', href: '/BV/red' },
  { icon: CheckCircle, label: 'Validar', href: '/BV/validar' }, // Ítem de validación agregado
  { icon: Edit, label: 'Publicar', href: '/BV/post' },
  { icon: User, label: 'Perfil', href: '/BV/perfil' }, 
];

export function AdminNav() {
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
      </ul>
    </nav>
  );
}
