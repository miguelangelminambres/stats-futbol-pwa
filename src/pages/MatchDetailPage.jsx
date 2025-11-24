import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useLicense } from '@/contexts/LicenseContext';
import { ArrowLeft, Save, Calendar, Trophy, MapPin } from 'lucide-react';
import { exportMatchReport } from '@/utils/pdfExports';

const MatchDetailPage = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentLicense } = useLicense();
  
  const [match, setMatch] = useState(null);
  const [playerStats, setPlayerStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [language, setLanguage] = useState('es');

  // Traducciones
  const translations = {
    es: {
      title: 'Estadísticas del Partido',
      backToMatches: 'Volver a Partidos',
      matchInfo: 'Información del Partido',
      opponent: 'Rival',
      date: 'Fecha',
      competition: 'Competición',
      stadium: 'Estadio',
      result: 'Resultado',
      round: 'Jornada',
      home: 'Local',
      away: 'Visitante',
      win: 'Victoria',
      draw: 'Empate',
      loss: 'Derrota',
      playerStats: 'Estadísticas de Jugadores',
      saveAll: 'Guardar Todo',
      saving: 'Guardando...',
      // Tabla
      player: 'Jugador',
      number: 'Nº',
      position: 'Pos',
      lineup: 'Alineación',
      availability: 'Disponibilidad',
      minuteIn: 'Min. Entrada',
      minuteOut: 'Min. Salida',
      minutesPlayed: 'Min. Jugados',
      goals: 'Goles',
      assists: 'Asist.',
      yellowCards: 'TA',
      redCards: 'TR',
      notes: 'Notas',
      // Opciones de lineup
      starter: 'Titular',
      substitute: 'Suplente',
      not_called: 'No convocado',
      // Opciones de disponibilidad
      available: 'Disponible',
      injured: 'Lesionado',
      suspended: 'Sancionado',
      other_absence: 'Otra ausencia',
      // Resumen
      summary: 'Resumen del Equipo',
      totalGoals: 'Goles totales',
      totalAssists: 'Asistencias totales',
      yellowCardsTotal: 'Tarjetas amarillas',
      redCardsTotal: 'Tarjetas rojas',
      playersUsed: 'Jugadores utilizados',
      starters: 'Titulares',
      substitutes: 'Suplentes',
      // Mensajes
      errorLoading: 'Error al cargar las estadísticas',
      errorSaving: 'Error al guardar las estadísticas',
      successSaved: 'Estadísticas guardadas correctamente',
      noPlayers: 'No hay jugadores en la plantilla',
    },
    en: {
      title: 'Match Statistics',
      backToMatches: 'Back to Matches',
      matchInfo: 'Match Information',
      opponent: 'Opponent',
      date: 'Date',
      competition: 'Competition',
      stadium: 'Stadium',
      result: 'Result',
      round: 'Round',
      home: 'Home',
      away: 'Away',
      win: 'Win',
      draw: 'Draw',
      loss: 'Loss',
      playerStats: 'Player Statistics',
      saveAll: 'Save All',
      saving: 'Saving...',
      // Table
      player: 'Player',
      number: 'No.',
      position: 'Pos',
      lineup: 'Lineup',
      availability: 'Availability',
      minuteIn: 'Min. In',
      minuteOut: 'Min. Out',
      minutesPlayed: 'Min. Played',
      goals: 'Goals',
      assists: 'Assists',
      yellowCards: 'YC',
      redCards: 'RC',
      notes: 'Notes',
      // Lineup options
      starter: 'Starter',
      substitute: 'Substitute',
      not_called: 'Not Called',
      // Availability options
      available: 'Available',
      injured: 'Injured',
      suspended: 'Suspended',
      other_absence: 'Other Absence',
      // Summary
      summary: 'Team Summary',
      totalGoals: 'Total goals',
      totalAssists: 'Total assists',
      yellowCardsTotal: 'Yellow cards',
      redCardsTotal: 'Red cards',
      playersUsed: 'Players used',
      starters: 'Starters',
      substitutes: 'Substitutes',
      // Messages
      errorLoading: 'Error loading statistics',
      errorSaving: 'Error saving statistics',
      successSaved: 'Statistics saved successfully',
      noPlayers: 'No players in squad',
    }
  };

  const t = translations[language];
const handleExportPDF = () => {
  if (match && playerStats.length > 0) {
    exportMatchReport(
      match,
      playerStats,
      currentLicense?.name || 'Mi Equipo',
      language
    );
  }
};
  useEffect(() => {
    if (matchId && currentLicense) {
      fetchMatchAndStats();
    }
  }, [matchId, currentLicense]);

  const fetchMatchAndStats = async () => {
    try {
      setLoading(true);

      // Cargar información del partido
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;
      setMatch(matchData);

      // Cargar estadísticas de jugadores con información de jugador
      const { data: statsData, error: statsError } = await supabase
        .from('match_player_stats')
        .select(`
          *,
          players (
            id,
            name,
            shirt_number,
            position
          )
        `)
        .eq('match_id', matchId)
        .order('players(shirt_number)', { ascending: true });

      if (statsError) throw statsError;
      setPlayerStats(statsData || []);
    } catch (error) {
      console.error('Error fetching match and stats:', error);
      alert(t.errorLoading);
    } finally {
      setLoading(false);
    }
  };
  

  const handleStatChange = (statId, field, value) => {
    setPlayerStats(prevStats =>
      prevStats.map(stat =>
        stat.id === statId ? { ...stat, [field]: value } : stat
      )
    );
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);

      // Preparar datos para actualización masiva
      const updates = playerStats.map(stat => ({
        id: stat.id,
        lineup_status: stat.lineup_status,
        availability_status: stat.availability_status,
        minute_in: stat.minute_in,
        minute_out: stat.minute_out,
        minutes_played: stat.minutes_played,
        goals: stat.goals,
        assists: stat.assists,
        yellow_cards: stat.yellow_cards,
        red_cards: stat.red_cards,
        notes: stat.notes
      }));

      // Actualizar uno por uno (Supabase no permite bulk update directo)
      for (const update of updates) {
        const { error } = await supabase
          .from('match_player_stats')
          .update(update)
          .eq('id', update.id);

        if (error) throw error;
      }

      alert(t.successSaved);
      fetchMatchAndStats(); // Recargar para ver cálculos actualizados
    } catch (error) {
      console.error('Error saving stats:', error);
      alert(t.errorSaving);
    } finally {
      setSaving(false);
    }
  };

  // Calcular resumen
  const calculateSummary = () => {
    const summary = {
      totalGoals: playerStats.reduce((sum, stat) => sum + (stat.goals || 0), 0),
      totalAssists: playerStats.reduce((sum, stat) => sum + (stat.assists || 0), 0),
      yellowCards: playerStats.reduce((sum, stat) => sum + (stat.yellow_cards || 0), 0),
      redCards: playerStats.reduce((sum, stat) => sum + (stat.red_cards || 0), 0),
      starters: playerStats.filter(stat => stat.lineup_status === 'starter').length,
      substitutes: playerStats.filter(stat => stat.lineup_status === 'substitute').length,
      playersUsed: playerStats.filter(stat => 
        stat.lineup_status === 'starter' || stat.lineup_status === 'substitute'
      ).length
    };
    return summary;
  };

  const summary = calculateSummary();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getResultBadge = (result) => {
    const styles = {
      win: 'bg-green-100 text-green-800',
      draw: 'bg-yellow-100 text-yellow-800',
      loss: 'bg-red-100 text-red-800'
    };
    return styles[result] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">Partido no encontrado</p>
          <Link to="/matches" className="text-blue-600 hover:underline mt-4 inline-block">
            {t.backToMatches}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/matches')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        </div>
        
    <div className="flex gap-2">
  <button
    onClick={handleExportPDF}
    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 flex items-center gap-2"
  >
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    {language === 'es' ? 'Exportar PDF' : 'Export PDF'}
  </button>
  
  <button
    onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
  >
    {language === 'es' ? '🇪🇸 ES' : '🇬🇧 EN'}
  </button>
  
  <button
    onClick={handleSaveAll}
    disabled={saving}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
  >
    <Save className="h-4 w-4" />
    {saving ? t.saving : t.saveAll}
  </button>
</div>
      </div>

      {/* Match Info Card */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t.matchInfo}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">{t.opponent}</div>
            <div className="text-lg font-semibold text-gray-900">{match.opponent}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 mb-1">{t.date}</div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{formatDate(match.match_date)}</span>
            </div>
          </div>
          
          {match.competition && (
            <div>
              <div className="text-sm text-gray-500 mb-1">{t.competition}</div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{match.competition}</span>
              </div>
            </div>
          )}
          
          {match.stadium && (
            <div>
              <div className="text-sm text-gray-500 mb-1">{t.stadium}</div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{match.stadium}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4">
          <div>
            <span className="text-sm text-gray-500">{t.result}: </span>
            <span className="text-lg font-bold text-gray-900">
              {match.team_goals} - {match.opponent_goals}
            </span>
            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getResultBadge(match.result)}`}>
              {t[match.result]}
            </span>
          </div>
          
          {match.round && (
            <div>
              <span className="text-sm text-gray-500">{t.round}: </span>
              <span className="text-gray-900">{match.round}</span>
            </div>
          )}
          
          <div>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              match.home_away === 'home' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {match.home_away === 'home' ? t.home : t.away}
            </span>
          </div>
        </div>
      </div>

      {/* Team Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow mb-6 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t.summary}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.totalGoals}</div>
            <div className="text-xs text-gray-600">{t.totalGoals}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.totalAssists}</div>
            <div className="text-xs text-gray-600">{t.totalAssists}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{summary.yellowCards}</div>
            <div className="text-xs text-gray-600">{t.yellowCardsTotal}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{summary.redCards}</div>
            <div className="text-xs text-gray-600">{t.redCardsTotal}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{summary.playersUsed}</div>
            <div className="text-xs text-gray-600">{t.playersUsed}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{summary.starters}</div>
            <div className="text-xs text-gray-600">{t.starters}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600">{summary.substitutes}</div>
            <div className="text-xs text-gray-600">{t.substitutes}</div>
          </div>
        </div>
      </div>

      {/* Player Stats Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{t.playerStats}</h2>
        </div>
        
        {playerStats.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {t.noPlayers}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-10">
                    {t.number}
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-12 bg-gray-50 z-10">
                    {t.player}
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t.position}
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t.lineup}
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t.availability}
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {t.minuteIn}
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {t.minuteOut}
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {t.minutesPlayed}
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {t.goals}
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {t.assists}
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {t.yellowCards}
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {t.redCards}
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t.notes}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {playerStats.map((stat) => (
                  <tr key={stat.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                      {stat.players.shirt_number}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-12 bg-white">
                      {stat.players.name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {stat.players.position}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <select
                        value={stat.lineup_status}
                        onChange={(e) => handleStatChange(stat.id, 'lineup_status', e.target.value)}
                        className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="starter">{t.starter}</option>
                        <option value="substitute">{t.substitute}</option>
                        <option value="not_called">{t.not_called}</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <select
                        value={stat.availability_status}
                        onChange={(e) => handleStatChange(stat.id, 'availability_status', e.target.value)}
                        className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="available">{t.available}</option>
                        <option value="injured">{t.injured}</option>
                        <option value="suspended">{t.suspended}</option>
                        <option value="other_absence">{t.other_absence}</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={stat.minute_in || ''}
                        onChange={(e) => handleStatChange(stat.id, 'minute_in', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-16 text-sm text-center border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="-"
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={stat.minute_out || ''}
                        onChange={(e) => handleStatChange(stat.id, 'minute_out', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-16 text-sm text-center border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="-"
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {stat.minutes_played || 0}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        value={stat.goals || 0}
                        onChange={(e) => handleStatChange(stat.id, 'goals', parseInt(e.target.value) || 0)}
                        className="w-16 text-sm text-center border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        value={stat.assists || 0}
                        onChange={(e) => handleStatChange(stat.id, 'assists', parseInt(e.target.value) || 0)}
                        className="w-16 text-sm text-center border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="2"
                        value={stat.yellow_cards || 0}
                        onChange={(e) => handleStatChange(stat.id, 'yellow_cards', parseInt(e.target.value) || 0)}
                        className="w-16 text-sm text-center border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="1"
                        value={stat.red_cards || 0}
                        onChange={(e) => handleStatChange(stat.id, 'red_cards', parseInt(e.target.value) || 0)}
                        className="w-16 text-sm text-center border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={stat.notes || ''}
                        onChange={(e) => handleStatChange(stat.id, 'notes', e.target.value)}
                        className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t.notes}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Save Button (mobile) */}
      <div className="mt-6 flex justify-end md:hidden">
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          {saving ? t.saving : t.saveAll}
        </button>
      </div>
    </div>
  );
};

export default MatchDetailPage;