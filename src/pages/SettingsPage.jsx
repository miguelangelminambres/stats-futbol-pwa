import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useLicense } from '@/contexts/LicenseContext';
import { 
  Settings,
  User,
  Shield,
  Globe,
  LogOut,
  Save,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  Trophy,
  Mail,
  Building,
  Clock,
  CreditCard,
  ChevronRight,
  Moon,
  Sun,
  Download,
  Trash2
} from 'lucide-react';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentLicense, licenses } = useLicense();
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [language, setLanguage] = useState('es');
  const [userData, setUserData] = useState({
    name: '',
    email: '',
  });
  const [teamData, setTeamData] = useState({
    name: '',
    season: '2025/26',
  });
  const [stats, setStats] = useState({
    players: 0,
    matches: 0,
  });

  const translations = {
    es: {
      title: 'Configuración',
      subtitle: 'Gestiona tu cuenta y preferencias',
      // Secciones
      teamInfo: 'Información del Equipo',
      teamName: 'Nombre del Equipo',
      season: 'Temporada',
      players: 'Jugadores',
      matches: 'Partidos',
      // Usuario
      userInfo: 'Información del Usuario',
      userName: 'Nombre',
      userEmail: 'Email',
      userRole: 'Rol',
      coach: 'Entrenador',
      // Licencia
      licenseInfo: 'Información de Licencia',
      licenseStatus: 'Estado',
      licenseType: 'Tipo',
      expiresAt: 'Expira',
      activatedAt: 'Activada',
      active: 'Activa',
      expired: 'Expirada',
      pending: 'Pendiente',
      // Preferencias
      preferences: 'Preferencias',
      languagePref: 'Idioma',
      spanish: 'Español',
      english: 'Inglés',
      theme: 'Tema',
      lightTheme: 'Claro',
      darkTheme: 'Oscuro',
      comingSoon: 'Próximamente',
      // Acciones
      actions: 'Acciones',
      exportData: 'Exportar Datos',
      exportDesc: 'Descarga todos tus datos en formato CSV',
      logout: 'Cerrar Sesión',
      logoutDesc: 'Salir de tu cuenta',
      save: 'Guardar Cambios',
      saved: '¡Guardado!',
      // Otros
      noLicense: 'Sin licencia asignada',
      unlimited: 'Ilimitada',
    },
    en: {
      title: 'Settings',
      subtitle: 'Manage your account and preferences',
      // Sections
      teamInfo: 'Team Information',
      teamName: 'Team Name',
      season: 'Season',
      players: 'Players',
      matches: 'Matches',
      // User
      userInfo: 'User Information',
      userName: 'Name',
      userEmail: 'Email',
      userRole: 'Role',
      coach: 'Coach',
      // License
      licenseInfo: 'License Information',
      licenseStatus: 'Status',
      licenseType: 'Type',
      expiresAt: 'Expires',
      activatedAt: 'Activated',
      active: 'Active',
      expired: 'Expired',
      pending: 'Pending',
      // Preferences
      preferences: 'Preferences',
      languagePref: 'Language',
      spanish: 'Spanish',
      english: 'English',
      theme: 'Theme',
      lightTheme: 'Light',
      darkTheme: 'Dark',
      comingSoon: 'Coming Soon',
      // Actions
      actions: 'Actions',
      exportData: 'Export Data',
      exportDesc: 'Download all your data in CSV format',
      logout: 'Log Out',
      logoutDesc: 'Sign out of your account',
      save: 'Save Changes',
      saved: 'Saved!',
      // Other
      noLicense: 'No license assigned',
      unlimited: 'Unlimited',
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.user_metadata?.name || user.email?.split('@')[0] || '',
        email: user.email || '',
      });
    }
    if (currentLicense) {
      setTeamData({
        name: currentLicense.name || '',
        season: '2025/26',
      });
      fetchStats();
    }
  }, [user, currentLicense]);

  const fetchStats = async () => {
    try {
      // Contar jugadores
      const { count: playersCount } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('license_id', currentLicense.id)
        .eq('status', 'active');

      // Contar partidos
      const { count: matchesCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('license_id', currentLicense.id);

      setStats({
        players: playersCount || 0,
        matches: matchesCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Aquí podrías guardar preferencias en la base de datos
      // Por ahora solo simulamos el guardado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleExportData = () => {
    // Funcionalidad futura
    alert(language === 'es' 
      ? 'Función de exportación en desarrollo' 
      : 'Export function in development');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(
      language === 'es' ? 'es-ES' : 'en-GB',
      { day: '2-digit', month: '2-digit', year: 'numeric' }
    );
  };

  const getLicenseStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    const labels = {
      active: t.active,
      expired: t.expired,
      pending: t.pending,
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Settings className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-gray-500 mt-1">{t.subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Indicador de guardado */}
          {saved && (
            <span className="flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              {t.saved}
            </span>
          )}
          
          {/* Botón Idioma */}
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {language === 'es' ? '🇪🇸 ES' : '🇬🇧 EN'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Información del Equipo */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              {t.teamInfo}
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {t.teamName}
                </label>
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-gray-400" />
                  <p className="text-lg font-semibold text-gray-900">
                    {currentLicense?.name || t.noLicense}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {t.season}
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <p className="text-lg font-semibold text-gray-900">2025/26</p>
                </div>
              </div>
            </div>
            
            {/* Stats del equipo */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{stats.players}</p>
                  <p className="text-sm text-gray-500">{t.players}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{stats.matches}</p>
                  <p className="text-sm text-gray-500">{t.matches}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información del Usuario */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-600" />
              {t.userInfo}
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {t.userName}
                </label>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <p className="text-lg font-semibold text-gray-900">{userData.name}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {t.userEmail}
                </label>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <p className="text-lg text-gray-900">{userData.email}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {t.userRole}
                </label>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                    {t.coach}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información de Licencia */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-600" />
              {t.licenseInfo}
            </h2>
          </div>
          <div className="p-6">
            {currentLicense ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    {t.licenseStatus}
                  </label>
                  {getLicenseStatusBadge(currentLicense.status)}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    {t.licenseType}
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentLicense.license_type?.name || 'Standard'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    {t.activatedAt}
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <p className="text-gray-900">{formatDate(currentLicense.activated_at)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    {t.expiresAt}
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <p className="text-gray-900">
                      {currentLicense.expires_at 
                        ? formatDate(currentLicense.expires_at) 
                        : t.unlimited}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>{t.noLicense}</p>
              </div>
            )}
          </div>
        </div>

        {/* Preferencias */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Globe className="h-5 w-5 text-gray-600" />
              {t.preferences}
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Idioma */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{t.languagePref}</p>
                  <p className="text-sm text-gray-500">
                    {language === 'es' ? t.spanish : t.english}
                  </p>
                </div>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="es">🇪🇸 Español</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>
            
            {/* Tema (deshabilitado por ahora) */}
            <div className="flex items-center justify-between py-3 opacity-50">
              <div className="flex items-center gap-3">
                <Sun className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{t.theme}</p>
                  <p className="text-sm text-gray-500">{t.lightTheme}</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                {t.comingSoon}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">{t.actions}</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {/* Exportar datos */}
            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Download className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{t.exportData}</p>
                  <p className="text-sm text-gray-500">{t.exportDesc}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
            
            {/* Cerrar sesión */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <LogOut className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-red-600">{t.logout}</p>
                  <p className="text-sm text-gray-500">{t.logoutDesc}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-red-400" />
            </button>
          </div>
        </div>

        {/* Footer con versión */}
        <div className="text-center py-6 text-gray-400 text-sm">
          <p>Stats Fútbol v1.0</p>
          <p className="mt-1">© 2024 - Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;