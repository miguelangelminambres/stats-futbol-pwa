import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useLicense } from '@/contexts/LicenseContext';
import { exportSeasonReport } from '@/utils/pdfExports';
import { 
  BarChart3, 
  Users, 
  Target, 
  Clock,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Download
} from 'lucide-react';

const StatsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentLicense } = useLicense();
  
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teamStats, setTeamStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('es');
  const [sortConfig, setSortConfig] = useState({ key: 'total_goals', direction: 'desc' });

  const translations = {
    es: {
      title: 'Estadísticas del Equipo',
      teamSummary: 'Resumen del Equipo',
      playerStats: 'Estadísticas de Jugadores',
      matchesPlayed: 'Partidos',
      wins: 'Victorias',
      draws: 'Empates',
      losses: 'Derrotas',
      goalsFor: 'Goles a Favor',
      goalsAgainst: 'Goles en Contra',
      goalDiff: 'Diferencia',
      points: 'Puntos',
      winRate: '% Victoria',
      number: 'Nº',
      player: 'Jugador',
      position: 'Pos.',
      matches: 'PJ',
      starter: 'TIT',
      substitute: 'SUP',
      minutes: 'MIN',
      goals: 'GOL',
      assists: 'ASI',
      goalAssist: 'G+A',
      yellowCards: 'TA',
      redCards: 'TR',
      avgMinutes: 'MIN/PJ',
      avgGoals: 'GOL/PJ',
      exportPDF: 'Exportar PDF',
      noData: 'No hay datos disponibles',
      totals: 'TOTALES',
      season: 'Temporada',
    },
    en: {
      title: 'Team Statistics',
      teamSummary: 'Team Summary',
      playerStats: 'Player Statistics',
      matchesPlayed: 'Matches',
      wins: 'Wins',
      draws: 'Draws',
      losses: 'Losses',
      goalsFor: 'Goals For',
      goalsAgainst: 'Goals Against',
      goalDiff: 'Difference',
      points: 'Points',
      winRate: 'Win %',
      number: 'No.',
      player: 'Player',
      position: 'Pos.',
      matches: 'MP',
      starter: 'STA',
      substitute: 'SUB',
      minutes: 'MIN',
      goals: 'GLS',
      assists: 'AST',
      goalAssist: 'G+A',
      yellowCards: 'YC',
      redCards: 'RC',
      avgMinutes: 'MIN/MP',
      avgGoals: 'GLS/MP',
      exportPDF: 'Export PDF',
      noData: 'No data available',
      totals: 'TOTALS',
      season: 'Season',
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (currentLicense) {
      fetchAllData();
    }
  }, [currentLicense]);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Obtener todos los jugadores activos
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('license_id', currentLicense.id)
        .eq('status', 'active');

      if (playersError) throw playersError;

      // Obtener estadísticas de temporada
      const { data: statsData, error: statsError } = await supabase
        .from('player_season_stats')
        .select('*')
        .eq('license_id', currentLicense.id);

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Stats error:', statsError);
      }

      // Combinar jugadores con sus estadísticas
      const activePlayers = (playersData || []).map(player => {
        const stats = (statsData || []).find(s => s.player_id === player.id) || {};
        return {
          ...stats,
          player_id: player.id,
          name: player.name,
          shirt_number: player.shirt_number,
          position: player.position,
          matches_played: stats.matches_played || 0,
          matches_started: stats.matches_started || 0,
          total_minutes: stats.total_minutes || 0,
          total_goals: stats.total_goals || 0,
          total_assists: stats.total_assists || 0,
          total_yellow_cards: stats.total_yellow_cards || 0,
          total_red_cards: stats.total_red_cards || 0,
          goal_assist: (stats.total_goals || 0) + (stats.total_assists || 0),
          avg_minutes: stats.matches_played > 0 
            ? Math.round((stats.total_minutes || 0) / stats.matches_played) 
            : 0,
          avg_goals: stats.matches_played > 0 
            ? ((stats.total_goals || 0) / stats.matches_played).toFixed(2) 
            : '0.00',
        };
      });

      setPlayers(activePlayers);

      // Obtener todos los partidos
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .eq('license_id', currentLicense.id)
        .order('match_date', { ascending: false });

      if (matchesError) throw matchesError;
      setMatches(matchesData || []);

      // Calcular estadísticas del equipo
      if (matchesData && matchesData.length > 0) {
        const stats = calculateTeamStats(matchesData);
        setTeamStats(stats);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTeamStats = (matchesData) => {
    const stats = {
      played: matchesData.length,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
    };

    matchesData.forEach(match => {
      stats.goalsFor += match.team_goals || 0;
      stats.goalsAgainst += match.opponent_goals || 0;
      
      if (match.result === 'win') stats.wins++;
      else if (match.result === 'draw') stats.draws++;
      else if (match.result === 'loss') stats.losses++;
    });

    stats.goalDiff = stats.goalsFor - stats.goalsAgainst;
    stats.points = (stats.wins * 3) + stats.draws;
    stats.winRate = stats.played > 0 
      ? Math.round((stats.wins / stats.played) * 100) 
      : 0;

    return stats;
  };

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const aValue = a[sortConfig.key] || 0;
    const bValue = b[sortConfig.key] || 0;
    
    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const calculateTotals = () => {
    return players.reduce((acc, p) => ({
      matches_played: acc.matches_played + (p.matches_played || 0),
      matches_started: acc.matches_started + (p.matches_started || 0),
      matches_substitute: acc.matches_substitute + (p.matches_substitute || 0),
      total_minutes: acc.total_minutes + (p.total_minutes || 0),
      total_goals: acc.total_goals + (p.total_goals || 0),
      total_assists: acc.total_assists + (p.total_assists || 0),
      goal_assist: acc.goal_assist + (p.goal_assist || 0),
      total_yellow_cards: acc.total_yellow_cards + (p.total_yellow_cards || 0),
      total_red_cards: acc.total_red_cards + (p.total_red_cards || 0),
    }), {
      matches_played: 0,
      matches_started: 0,
      matches_substitute: 0,
      total_minutes: 0,
      total_goals: 0,
      total_assists: 0,
      goal_assist: 0,
      total_yellow_cards: 0,
      total_red_cards: 0,
    });
  };

  const handleExportPDF = () => {
    if (players.length > 0 && teamStats) {
      exportSeasonReport(
        sortedPlayers,
        matches,
        teamStats,
        currentLicense?.name || 'Mi Equipo',
        language
      );
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'desc' ? '↓' : '↑';
  };

  const totals = calculateTotals();

  if (loading) {
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
        <div className="flex items-center gap-4">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-gray-500 mt-1">{currentLicense?.name} - {t.season} 2024/25</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Botón Exportar PDF */}
          <button
            onClick={handleExportPDF}
            disabled={players.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            {t.exportPDF}
          </button>
          
          {/* Botón Idioma */}
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {language === 'es' ? '🇪🇸 ES' : '🇬🇧 EN'}
          </button>
        </div>
      </div>

      {/* Team Summary Cards */}
      {teamStats && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            {t.teamSummary}
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {/* Partidos */}
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{teamStats.played}</p>
              <p className="text-xs text-gray-500 mt-1">{t.matchesPlayed}</p>
            </div>
            
            {/* Victorias */}
            <div className="bg-green-50 rounded-lg shadow p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-2xl font-bold text-green-600">{teamStats.wins}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">{t.wins}</p>
            </div>
            
            {/* Empates */}
            <div className="bg-yellow-50 rounded-lg shadow p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <Minus className="h-4 w-4 text-yellow-600" />
                <p className="text-2xl font-bold text-yellow-600">{teamStats.draws}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">{t.draws}</p>
            </div>
            
            {/* Derrotas */}
            <div className="bg-red-50 rounded-lg shadow p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <p className="text-2xl font-bold text-red-600">{teamStats.losses}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">{t.losses}</p>
            </div>
            
            {/* Goles a Favor */}
            <div className="bg-blue-50 rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{teamStats.goalsFor}</p>
              <p className="text-xs text-gray-500 mt-1">{t.goalsFor}</p>
            </div>
            
            {/* Goles en Contra */}
            <div className="bg-orange-50 rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{teamStats.goalsAgainst}</p>
              <p className="text-xs text-gray-500 mt-1">{t.goalsAgainst}</p>
            </div>
            
            {/* Diferencia */}
            <div className={`rounded-lg shadow p-4 text-center ${teamStats.goalDiff >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`text-2xl font-bold ${teamStats.goalDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {teamStats.goalDiff > 0 ? '+' : ''}{teamStats.goalDiff}
              </p>
              <p className="text-xs text-gray-500 mt-1">{t.goalDiff}</p>
            </div>
            
            {/* % Victoria */}
            <div className="bg-purple-50 rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{teamStats.winRate}%</p>
              <p className="text-xs text-gray-500 mt-1">{t.winRate}</p>
            </div>
          </div>
        </div>
      )}

      {/* Players Stats Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t.playerStats}
          </h2>
        </div>

        {players.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {t.noData}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-2 py-3 text-center text-xs font-bold uppercase w-10">{t.number}</th>
                  <th className="px-3 py-3 text-left text-xs font-bold uppercase">{t.player}</th>
                  <th className="px-2 py-3 text-center text-xs font-bold uppercase">{t.position}</th>
                  <th 
                    className="px-2 py-3 text-center text-xs font-bold uppercase cursor-pointer hover:bg-blue-700"
                    onClick={() => handleSort('matches_played')}
                  >
                    {t.matches} {getSortIcon('matches_played')}
                  </th>
                  <th 
                    className="px-2 py-3 text-center text-xs font-bold uppercase cursor-pointer hover:bg-blue-700"
                    onClick={() => handleSort('matches_started')}
                  >
                    {t.starter} {getSortIcon('matches_started')}
                  </th>
                  <th 
                    className="px-2 py-3 text-center text-xs font-bold uppercase cursor-pointer hover:bg-blue-700"
                    onClick={() => handleSort('total_minutes')}
                  >
                    {t.minutes} {getSortIcon('total_minutes')}
                  </th>
                  <th 
                    className="px-2 py-3 text-center text-xs font-bold uppercase cursor-pointer hover:bg-blue-700 bg-green-700"
                    onClick={() => handleSort('total_goals')}
                  >
                    {t.goals} {getSortIcon('total_goals')}
                  </th>
                  <th 
                    className="px-2 py-3 text-center text-xs font-bold uppercase cursor-pointer hover:bg-blue-700 bg-blue-700"
                    onClick={() => handleSort('total_assists')}
                  >
                    {t.assists} {getSortIcon('total_assists')}
                  </th>
                  <th 
                    className="px-2 py-3 text-center text-xs font-bold uppercase cursor-pointer hover:bg-blue-700 bg-purple-700"
                    onClick={() => handleSort('goal_assist')}
                  >
                    {t.goalAssist} {getSortIcon('goal_assist')}
                  </th>
                  <th 
                    className="px-2 py-3 text-center text-xs font-bold uppercase cursor-pointer hover:bg-blue-700 bg-yellow-600"
                    onClick={() => handleSort('total_yellow_cards')}
                  >
                    {t.yellowCards} {getSortIcon('total_yellow_cards')}
                  </th>
                  <th 
                    className="px-2 py-3 text-center text-xs font-bold uppercase cursor-pointer hover:bg-blue-700 bg-red-600"
                    onClick={() => handleSort('total_red_cards')}
                  >
                    {t.redCards} {getSortIcon('total_red_cards')}
                  </th>
                  <th 
                    className="px-2 py-3 text-center text-xs font-bold uppercase cursor-pointer hover:bg-blue-700"
                    onClick={() => handleSort('avg_minutes')}
                  >
                    {t.avgMinutes} {getSortIcon('avg_minutes')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPlayers.map((player, index) => (
                  <tr 
                    key={player.player_id} 
                    className={`hover:bg-blue-50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    onClick={() => navigate(`/players/${player.player_id}/stats`)}
                  >
                    <td className="px-2 py-2 text-center font-bold text-gray-900">
                      {player.shirt_number}
                    </td>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">
                      {player.name}
                    </td>
                    <td className="px-2 py-2 text-center text-xs text-gray-600">
                      {player.position}
                    </td>
                    <td className="px-2 py-2 text-center text-sm font-semibold text-gray-900">
                      {player.matches_played || 0}
                    </td>
                    <td className="px-2 py-2 text-center text-sm text-gray-600">
                      {player.matches_started || 0}
                    </td>
                    <td className="px-2 py-2 text-center text-sm font-semibold text-blue-600">
                      {player.total_minutes || 0}
                    </td>
                    <td className="px-2 py-2 text-center text-sm font-bold text-green-600 bg-green-50">
                      {player.total_goals || 0}
                    </td>
                    <td className="px-2 py-2 text-center text-sm font-bold text-blue-600 bg-blue-50">
                      {player.total_assists || 0}
                    </td>
                    <td className="px-2 py-2 text-center text-sm font-bold text-purple-600 bg-purple-50">
                      {player.goal_assist || 0}
                    </td>
                    <td className="px-2 py-2 text-center text-sm font-semibold text-yellow-600 bg-yellow-50">
                      {player.total_yellow_cards || 0}
                    </td>
                    <td className="px-2 py-2 text-center text-sm font-semibold text-red-600 bg-red-50">
                      {player.total_red_cards || 0}
                    </td>
                    <td className="px-2 py-2 text-center text-xs text-gray-500">
                      {player.avg_minutes}
                    </td>
                  </tr>
                ))}
                
                {/* Fila de Totales */}
                <tr className="bg-gray-800 text-white font-bold">
                  <td className="px-2 py-3 text-center" colSpan={2}>
                    {t.totals}
                  </td>
                  <td className="px-2 py-3 text-center text-xs">
                    {players.length} jug.
                  </td>
                  <td className="px-2 py-3 text-center text-sm">
                    {totals.matches_played}
                  </td>
                  <td className="px-2 py-3 text-center text-sm">
                    {totals.matches_started}
                  </td>
                  <td className="px-2 py-3 text-center text-sm text-blue-300">
                    {totals.total_minutes}
                  </td>
                  <td className="px-2 py-3 text-center text-sm text-green-300 bg-green-900">
                    {totals.total_goals}
                  </td>
                  <td className="px-2 py-3 text-center text-sm text-blue-300 bg-blue-900">
                    {totals.total_assists}
                  </td>
                  <td className="px-2 py-3 text-center text-sm text-purple-300 bg-purple-900">
                    {totals.goal_assist}
                  </td>
                  <td className="px-2 py-3 text-center text-sm text-yellow-300 bg-yellow-900">
                    {totals.total_yellow_cards}
                  </td>
                  <td className="px-2 py-3 text-center text-sm text-red-300 bg-red-900">
                    {totals.total_red_cards}
                  </td>
                  <td className="px-2 py-3 text-center text-xs">
                    -
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
        <p className="font-semibold mb-2">Leyenda:</p>
        <div className="flex flex-wrap gap-4">
          <span><strong>PJ</strong> = Partidos Jugados</span>
          <span><strong>TIT</strong> = Como Titular</span>
          <span><strong>MIN</strong> = Minutos</span>
          <span><strong>GOL</strong> = Goles</span>
          <span><strong>ASI</strong> = Asistencias</span>
          <span><strong>G+A</strong> = Goles + Asistencias</span>
          <span><strong>TA</strong> = Tarjetas Amarillas</span>
          <span><strong>TR</strong> = Tarjetas Rojas</span>
          <span><strong>MIN/PJ</strong> = Minutos por Partido</span>
        </div>
        <p className="mt-2 text-gray-400">* Haz clic en las cabeceras para ordenar. Haz clic en un jugador para ver su ficha completa.</p>
      </div>
    </div>
  );
};

export default StatsPage;