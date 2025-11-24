import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevenir que el mini-infobar aparezca automáticamente
      e.preventDefault();
      // Guardar el evento para que se pueda disparar después
      setDeferredPrompt(e);
      // Mostrar nuestro banner de instalación
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Mostrar el prompt de instalación
    deferredPrompt.prompt();

    // Esperar a que el usuario responda
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);

    // Limpiar el prompt
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleClose = () => {
    setShowInstallBanner(false);
  };

  if (!showInstallBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-2xl p-4 z-50 animate-slide-up">
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="bg-white/20 p-2 rounded-lg">
          <Download className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">Instalar MatchStats Pro</h3>
          <p className="text-sm text-white/90 mb-3">
            Instala la app en tu dispositivo para acceso rápido y uso sin conexión
          </p>
          
          <button
            onClick={handleInstallClick}
            className="w-full bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Instalar ahora
          </button>
        </div>
      </div>
    </div>
  );
}
