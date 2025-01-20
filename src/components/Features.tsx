import React from 'react';
import { BookOpen, Users, Network, Award } from 'lucide-react';

const features = [
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Biblioteca Digital",
    description: "Accede a cientos de recursos educativos exclusivos y actualizados constantemente."
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Comunidad Activa",
    description: "Únete a una comunidad de aprendizaje colaborativo y networking profesional."
  },
  {
    icon: <Network className="h-6 w-6" />,
    title: "Sistema Multinivel",
    description: "Desarrolla tu red y crece profesionalmente con nuestro sistema de niveles."
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "Certificaciones",
    description: "Obtén certificaciones reconocidas a medida que avanzas en tu aprendizaje."
  }
];

export const Features = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
      {features.map((feature, index) => (
        <div 
          key={index}
          className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/50 transition-all duration-300"
        >
          <div className="bg-blue-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
            {feature.icon}
          </div>
          <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
          <p className="text-gray-400">{feature.description}</p>
        </div>
      ))}
    </div>
  );
};