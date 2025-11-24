import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';  // ← Corregido
import { useLicense } from '@/contexts/LicenseContext';

const MatchesPage = () => {
 const { user } = useAuth();
const { currentLicense } = useLicense();
  
  // Estados principales
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [language, setLanguage] = useState('es'); // español por defecto
  const [filterCompetition, setFilterCompetition] = useState('all');
  const [filterResult, setFilterResult] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc'); // ordenar por fecha descendente

  // Traducciones
  const translations = {
    es: {
      title: 'Gestión de Partidos',
      addMatch: 'Añadir Partido',
      search: 'Buscar por rival...',
      filterCompetition: 'Filtrar por competición',
      filterResult: 'Filtrar por resultado',
      allCompetitions: 'Todas las competiciones',
      allResults: 'Todos los resultados',
      sortBy: 'Ordenar por',
      dateDesc: 'Fecha (más reciente)',
      dateAsc: 'Fecha (más antigua)',
      noMatches: 'No hay partidos registrados',
      noMatchesFound: 'No se encontraron partidos',
      addFirstMatch: 'Añade tu primer partido',
      // Tabla
      opponent: 'Rival',
      date: 'Fecha',
      time: 'Hora',
      round: 'Jornada',
      competition: 'Competición',
      location: 'Ubicación',
      result: 'Resultado',
      actions: 'Acciones',
      home: 'Local',
      away: 'Visitante',
      win: 'Victoria',
      draw: 'Empate',
      loss: 'Derrota',
      // Formulario
      matchDetails: 'Detalles del Partido',
      editMatch: 'Editar Partido',
      newMatch: 'Nuevo Partido',
      opponentName: 'Nombre del Rival',
      opponentPlaceholder: 'Ej: Real Madrid CF',
      matchDate: 'Fecha del Partido',
      kickOffTime: 'Hora de Inicio',
      roundNumber: 'Número de Jornada',
      roundPlaceholder: 'Ej: 15',
      competitionName: 'Nombre de la Competición',
      competitionPlaceholder: 'Ej: La Liga, Copa del Rey',
      stadium: 'Estadio',
      stadiumPlaceholder: 'Ej: Santiago Bernabéu',
      homeAway: 'Local / Visitante',
      selectLocation: 'Selecciona ubicación',
      teamGoals: 'Goles a favor',
      opponentGoals: 'Goles en contra',
      matchResult: 'Resultado',
      selectResult: 'Selecciona resultado',
      notes: 'Notas',
      notesPlaceholder: 'Observaciones sobre el partido...',
      cancel: 'Cancelar',
      save: 'Guardar',
      saving: 'Guardando...',
      // Eliminar
      confirmDelete: 'Confirmar Eliminación',
      deleteMessage: '¿Estás seguro de que quieres eliminar este partido?',
      deleteWarning: 'Esta acción no se puede deshacer. Se eliminarán también todas las estadísticas asociadas.',
      delete: 'Eliminar',
      deleting: 'Eliminando...',
      // Errores y éxitos
      errorLoading: 'Error al cargar los partidos',
      errorSaving: 'Error al guardar el partido',
      errorDeleting: 'Error al eliminar el partido',
      successSaved: 'Partido guardado correctamente',
      successDeleted: 'Partido eliminado correctamente',
      requiredFields: 'Por favor completa todos los campos requeridos',
    },
    en: {
      title: 'Match Management',
      addMatch: 'Add Match',
      search: 'Search by opponent...',
      filterCompetition: 'Filter by competition',
      filterResult: 'Filter by result',
      allCompetitions: 'All competitions',
      allResults: 'All results',
      sortBy: 'Sort by',
      dateDesc: 'Date (newest)',
      dateAsc: 'Date (oldest)',
      noMatches: 'No matches registered',
      noMatchesFound: 'No matches found',
      addFirstMatch: 'Add your first match',
      // Table
      opponent: 'Opponent',
      date: 'Date',
      time: 'Time',
      round: 'Round',
      competition: 'Competition',
      location: 'Location',
      result: 'Result',
      actions: 'Actions',
      home: 'Home',
      away: 'Away',
      win: 'Win',
      draw: 'Draw',
      loss: 'Loss',
      // Form
      matchDetails: 'Match Details',
      editMatch: 'Edit Match',
      newMatch: 'New Match',
      opponentName: 'Opponent Name',
      opponentPlaceholder: 'Ex: Real Madrid CF',
      matchDate: 'Match Date',
      kickOffTime: 'Kick-off Time',
      roundNumber: 'Round Number',
      roundPlaceholder: 'Ex: 15',
      competitionName: 'Competition Name',
      competitionPlaceholder: 'Ex: La Liga, Copa del Rey',
      stadium: 'Stadium',
      stadiumPlaceholder: 'Ex: Santiago Bernabéu',
      homeAway: 'Home / Away',
      selectLocation: 'Select location',
      teamGoals: 'Goals for',
      opponentGoals: 'Goals against',
      matchResult: 'Result',
      selectResult: 'Select result',
      notes: 'Notes',
      notesPlaceholder: 'Match observations...',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving...',
      // Delete
      confirmDelete: 'Confirm Deletion',
      deleteMessage: 'Are you sure you want to delete this match?',
      deleteWarning: 'This action cannot be undone. All associated statistics will also be deleted.',
      delete: 'Delete',
      deleting: 'Deleting...',
      // Errors and success
      errorLoading: 'Error loading matches',
      errorSaving: 'Error saving match',
      errorDeleting: 'Error deleting match',
      successSaved: 'Match saved successfully',
      successDeleted: 'Match deleted successfully',
      requiredFields: 'Please fill in all required fields',
    }
  };

  const t = translations[language];

  // Cargar partidos
  useEffect(() => {
    if (currentLicense) {
      fetchMatches();
    }
  }, [currentLicense]);

  // Filtrar y ordenar partidos
  useEffect(() => {
    let filtered = [...matches];

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(match =>
        match.opponent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.competition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.stadium?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por competición
    if (filterCompetition !== 'all') {
      filtered = filtered.filter(match => match.competition === filterCompetition);
    }

    // Filtro por resultado
    if (filterResult !== 'all') {
      filtered = filtered.filter(match => match.result === filterResult);
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.match_date) - new Date(a.match_date);
      } else if (sortBy === 'date_asc') {
        return new Date(a.match_date) - new Date(b.match_date);
      }
      return 0;
    });

    setFilteredMatches(filtered);
  }, [matches, searchTerm, filterCompetition, filterResult, sortBy]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('license_id', currentLicense.id)
        .order('match_date', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      alert(t.errorLoading);
    } finally {
      setLoading(false);
    }
  };

  // Obtener competiciones únicas para el filtro
  const uniqueCompetitions = [...new Set(matches.map(m => m.competition).filter(Boolean))];

  // Abrir modal para crear
  const handleCreate = () => {
    setCurrentMatch({
      opponent: '',
      match_date: '',
      kick_off_time: '',
      home_away: 'home',
      stadium: '',
      round: '',
      competition: '',
      team_goals: 0,
      opponent_goals: 0,
      result: 'draw',
      notes: ''
    });
    setShowModal(true);
  };

  // Abrir modal para editar
  const handleEdit = (match) => {
    setCurrentMatch(match);
    setShowModal(true);
  };

  // Guardar partido (crear o actualizar)
  const handleSave = async () => {
    if (!currentMatch.opponent || !currentMatch.match_date) {
      alert(t.requiredFields);
      return;
    }

    try {
      setLoading(true);

      const matchData = {
        ...currentMatch,
        license_id: currentLicense.id,
      };

      if (currentMatch.id) {
        // Actualizar
        const { error } = await supabase
          .from('matches')
          .update(matchData)
          .eq('id', currentMatch.id);

        if (error) throw error;
      } else {
        // Crear
        const { error } = await supabase
          .from('matches')
          .insert([matchData]);

        if (error) throw error;
      }

      alert(t.successSaved);
      setShowModal(false);
      setCurrentMatch(null);
      fetchMatches();
    } catch (error) {
      console.error('Error saving match:', error);
      alert(t.errorSaving);
    } finally {
      setLoading(false);
    }
  };

  // Confirmar eliminación
  const handleDeleteConfirm = (match) => {
    setSelectedMatch(match);
    setShowDeleteModal(true);
  };

  // Eliminar partido
  const handleDelete = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', selectedMatch.id);

      if (error) throw error;

      alert(t.successDeleted);
      setShowDeleteModal(false);
      setSelectedMatch(null);
      fetchMatches();
    } catch (error) {
      console.error('Error deleting match:', error);
      alert(t.errorDeleting);
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obtener estilo según resultado
  const getResultBadge = (result) => {
    const styles = {
      win: 'bg-green-100 text-green-800',
      draw: 'bg-yellow-100 text-yellow-800',
      loss: 'bg-red-100 text-red-800'
    };
    return styles[result] || 'bg-gray-100 text-gray-800';
  };

  if (loading && matches.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        
        <div className="flex gap-2">
          {/* Selector de idioma */}
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {language === 'es' ? '🇪🇸 ES' : '🇬🇧 EN'}
          </button>
          
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            + {t.addMatch}
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div>
            <input
              type="text"
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro por competición */}
          <div>
            <select
              value={filterCompetition}
              onChange={(e) => setFilterCompetition(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t.allCompetitions}</option>
              {uniqueCompetitions.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>

          {/* Filtro por resultado */}
          <div>
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t.allResults}</option>
              <option value="win">{t.win}</option>
              <option value="draw">{t.draw}</option>
              <option value="loss">{t.loss}</option>
            </select>
          </div>

          {/* Ordenar */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date_desc">{t.dateDesc}</option>
              <option value="date_asc">{t.dateAsc}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de partidos */}
      {filteredMatches.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm || filterCompetition !== 'all' || filterResult !== 'all'
              ? t.noMatchesFound
              : t.noMatches}
          </h3>
          {!searchTerm && filterCompetition === 'all' && filterResult === 'all' && (
            <p className="mt-1 text-sm text-gray-500">{t.addFirstMatch}</p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Vista de escritorio */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.opponent}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.date}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.round}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.competition}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.location}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.result}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMatches.map((match) => (
                  <tr key={match.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {match.opponent}
                          </div>
                          {match.stadium && (
                            <div className="text-sm text-gray-500">
                              {match.stadium}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(match.match_date)}</div>
                      {match.kick_off_time && (
                        <div className="text-sm text-gray-500">{match.kick_off_time}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {match.round || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {match.competition || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        match.home_away === 'home'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {match.home_away === 'home' ? t.home : t.away}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {match.team_goals} - {match.opponent_goals}
                        </span>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getResultBadge(match.result)}`}>
                          {t[match.result]}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
  <Link
    to={`/matches/${match.id}`}
    className="text-green-600 hover:text-green-900 mr-4"
    title="Ver estadísticas"
  >
    📊
  </Link>
  <button
    onClick={() => handleEdit(match)}
    className="text-blue-600 hover:text-blue-900 mr-4"
  >
    ✏️
  </button>
  <button
    onClick={() => handleDeleteConfirm(match)}
    className="text-red-600 hover:text-red-900"
  >
    🗑️
  </button>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista móvil */}
          <div className="md:hidden">
            {filteredMatches.map((match) => (
              <div key={match.id} className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{match.opponent}</h3>
                    <p className="text-sm text-gray-500">{formatDate(match.match_date)}</p>
                  </div>
                  <div className="flex gap-2">
  <Link
    to={`/matches/${match.id}`}
    className="text-green-600 hover:text-green-900"
  >
    📊
  </Link>
  <button
    onClick={() => handleEdit(match)}
    className="text-blue-600 hover:text-blue-900"
  >
    ✏️
  </button>
  <button
    onClick={() => handleDeleteConfirm(match)}
    className="text-red-600 hover:text-red-900"
  >
    🗑️
  </button>
</div>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.result}:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{match.team_goals} - {match.opponent_goals}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getResultBadge(match.result)}`}>
                        {t[match.result]}
                      </span>
                    </div>
                  </div>
                  
                  {match.competition && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t.competition}:</span>
                      <span className="font-medium">{match.competition}</span>
                    </div>
                  )}
                  
                  {match.round && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t.round}:</span>
                      <span className="font-medium">{match.round}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.location}:</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      match.home_away === 'home'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {match.home_away === 'home' ? t.home : t.away}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {currentMatch.id ? t.editMatch : t.newMatch}
              </h2>

              <div className="space-y-4">
                {/* Rival */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.opponentName} *
                  </label>
                  <input
                    type="text"
                    value={currentMatch.opponent}
                    onChange={(e) => setCurrentMatch({ ...currentMatch, opponent: e.target.value })}
                    placeholder={t.opponentPlaceholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Fecha y Hora */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.matchDate} *
                    </label>
                    <input
                      type="date"
                      value={currentMatch.match_date}
                      onChange={(e) => setCurrentMatch({ ...currentMatch, match_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.kickOffTime}
                    </label>
                    <input
                      type="time"
                      value={currentMatch.kick_off_time}
                      onChange={(e) => setCurrentMatch({ ...currentMatch, kick_off_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Jornada y Competición */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.roundNumber}
                    </label>
                    <input
                      type="text"
                      value={currentMatch.round}
                      onChange={(e) => setCurrentMatch({ ...currentMatch, round: e.target.value })}
                      placeholder={t.roundPlaceholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.competitionName}
                    </label>
                    <input
                      type="text"
                      value={currentMatch.competition}
                      onChange={(e) => setCurrentMatch({ ...currentMatch, competition: e.target.value })}
                      placeholder={t.competitionPlaceholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Estadio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.stadium}
                  </label>
                  <input
                    type="text"
                    value={currentMatch.stadium}
                    onChange={(e) => setCurrentMatch({ ...currentMatch, stadium: e.target.value })}
                    placeholder={t.stadiumPlaceholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Local/Visitante */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.homeAway}
                  </label>
                  <select
                    value={currentMatch.home_away}
                    onChange={(e) => setCurrentMatch({ ...currentMatch, home_away: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="home">{t.home}</option>
                    <option value="away">{t.away}</option>
                  </select>
                </div>

                {/* Goles */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.teamGoals}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={currentMatch.team_goals}
                      onChange={(e) => setCurrentMatch({ ...currentMatch, team_goals: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.opponentGoals}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={currentMatch.opponent_goals}
                      onChange={(e) => setCurrentMatch({ ...currentMatch, opponent_goals: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Resultado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.matchResult}
                  </label>
                  <select
                    value={currentMatch.result}
                    onChange={(e) => setCurrentMatch({ ...currentMatch, result: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="win">{t.win}</option>
                    <option value="draw">{t.draw}</option>
                    <option value="loss">{t.loss}</option>
                  </select>
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.notes}
                  </label>
                  <textarea
                    value={currentMatch.notes}
                    onChange={(e) => setCurrentMatch({ ...currentMatch, notes: e.target.value })}
                    placeholder={t.notesPlaceholder}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setCurrentMatch(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50"
                >
                  {loading ? t.saving : t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t.confirmDelete}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {t.deleteMessage}
            </p>
            <p className="text-sm text-gray-600 mb-6">
              <strong>{selectedMatch?.opponent}</strong> - {selectedMatch && formatDate(selectedMatch.match_date)}
            </p>
            <p className="text-sm text-red-600 mb-6">
              {t.deleteWarning}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedMatch(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium disabled:opacity-50"
              >
                {loading ? t.deleting : t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchesPage;