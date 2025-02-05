
import { Background } from '../components/Background';
import { Navbar } from '../components/Navbar';

export const Terminos = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Background />
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold mb-8">Términos y Condiciones</h1>
        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Introducción</h2>
          <p className="text-gray-400 mb-6">
            La Corporación "Biblioteca Virtual" (la "Empresa") te invita a leer y aceptar estos Términos y Condiciones antes de utilizar nuestra plataforma.
          </p>
          <p className="text-gray-400 mb-6">
            1.1. Estos Términos y Condiciones (los "Términos") rigen el acceso y uso de la plataforma de la Biblioteca Virtual y los servicios ofrecidos por la Empresa.
          </p>
          <p className="text-gray-400 mb-6">
            1.2. Al acceder y utilizar la plataforma, aceptas estos Términos y Condiciones.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Uso de la Plataforma</h2>
          <p className="text-gray-400 mb-6">
            2.1. La plataforma está disponible para uso personal y no comercial.
          </p>
          <p className="text-gray-400 mb-6">
            2.2. No se permite la reproducción, distribución o utilización comercial de contenido sin autorización explícita.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Datos Personales</h2>
          <p className="text-gray-400 mb-6">
            3.1. La Empresa recopila y utiliza datos personales para:
          </p>
          <ul className="list-disc list-inside text-gray-400 mb-6">
            <li>Proporcionar servicios y contenido.</li>
            <li>Personalizar la experiencia del usuario.</li>
            <li>Enviar comunicaciones y promociones.</li>
          </ul>
          <p className="text-gray-400 mb-6">
            3.2. La recopilación y uso de datos personales se rigen por la Política de Privacidad (anexa).
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Política de Privacidad</h2>
          <p className="text-gray-400 mb-6">
            4.1. La Política de Privacidad se encuentra disponible en [enlace].
          </p>
          <p className="text-gray-400 mb-6">
            4.2. La Política de Privacidad describe cómo se recopilan, utilizan y protegen los datos personales.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Responsabilidad</h2>
          <p className="text-gray-400 mb-6">
            5.1. La Empresa no se hace responsable de:
          </p>
          <ul className="list-disc list-inside text-gray-400 mb-6">
            <li>Daños causados por uso inadecuado de la plataforma.</li>
            <li>Contenido inexacto o incompleto.</li>
            <li>Interrupciones o fallas en el servicio.</li>
          </ul>
          <p className="text-gray-400 mb-6">
            5.2. La Empresa se reserva el derecho de modificar o suspender la plataforma sin previo aviso.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Propiedad Intelectual</h2>
          <p className="text-gray-400 mb-6">
            6.1. Todos los derechos de propiedad intelectual están reservados por la Empresa.
          </p>
          <p className="text-gray-400 mb-6">
            6.2. No se permite la reproducción, distribución o utilización comercial de contenido sin autorización.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Jurisdicción y Ley Aplicable</h2>
          <p className="text-gray-400 mb-6">
            7.1. Estos Términos se rigen por las leyes de [país/estado].
          </p>
          <p className="text-gray-400 mb-6">
            7.2. Cualquier disputa se resolverá mediante arbitraje.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Cambios y Actualizaciones</h2>
          <p className="text-gray-400 mb-6">
            8.1. La Empresa se reserva el derecho de modificar estos Términos sin previo aviso.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Anexos</h2>
          <ul className="list-disc list-inside text-gray-400 mb-6">
            <li>Política de Privacidad</li>
            <li>Aviso de Cookies (si aplica)</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4">Aceptación</h2>
          <p className="text-gray-400 mb-6">
            Al acceder y utilizar la plataforma, aceptas estos Términos y Condiciones.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Política de Aportes</h2>
          <p className="text-gray-400 mb-6">
            Los aportes dados a los miembros de la comunidad deben hacerse a la cuenta suministrada por el corporativo. Es obligatorio proporcionar la cuenta para realizar la transferencia o consignación. Los datos solo deben ser transmitidos por el medio que el corporativo disponga.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Notas Importantes</h2>
          <ul className="list-disc list-inside text-gray-400 mb-6">
            <li>No se pide información personal como documentos de identificación o claves personales.</li>
            <li>El ingreso a la plataforma es voluntario y autónomo de cada individuo.</li>
            <li>Cualquier duda o inquietud debe ser requerida directamente a soporte del corporativo.</li>
            <li>El proyecto está presupuestado para 18 meses desde el registro.</li>
          </ul>
        </div>
      </main>

      <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-400">
            <div>
              <h3 className="font-semibold mb-4">Biblioteca Virtual</h3>
              <p className="text-sm">Transformando el aprendizaje y el networking profesional.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <p className="text-sm">soporte@bibliotecavirtual.com</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <p className="text-sm">Términos y Condiciones</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>Biblioteca Virtual v0.1 © 2024</p>
          </div>
        </div>
      </footer>
    </div>
  );
};