import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "María González",
    role: "Emprendedora",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "La Biblioteca Virtual ha transformado mi negocio. Los recursos y la comunidad son invaluables."
  },
  {
    name: "Carlos Ruiz",
    role: "Profesional IT",
    image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "La mejor inversión en mi desarrollo profesional. El sistema multinivel realmente funciona."
  },
  {
    name: "Ana Martínez",
    role: "Consultora",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "Increíble plataforma para crecer profesionalmente y construir una red de contactos valiosa."
  }
];

export const Testimonials = () => {
  return (
    <div className="py-16">
      <h2 className="text-3xl font-bold text-center mb-12">Lo que dicen nuestros usuarios</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div 
            key={index}
            className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/50 transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              ))}
            </div>
            <p className="text-gray-300 mb-6">{testimonial.content}</p>
            <div className="flex items-center">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="h-10 w-10 rounded-full mr-3"
              />
              <div>
                <h4 className="font-semibold">{testimonial.name}</h4>
                <p className="text-sm text-gray-400">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};