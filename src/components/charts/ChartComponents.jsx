import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell
} from 'recharts';

// =====================================================
// 1. GRÁFICO DE LÍNEA - Evolución de Resultados
// =====================================================
export const ResultsLineChart = ({ data, language = 'es' }) => {
  const t = {
    es: {
      title: 'Evolución de Resultados',
      wins: 'Victorias',
      draws: 'Empates',
      losses: 'Derrotas',
      round: 'Jornada'
    },
    en: {
      title: 'Results Evolution',
      wins: 'Wins',
      draws: 'Draws',
      losses: 'Losses',
      round: 'Round'
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{t[language].title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="round" 
            label={{ value: t[language].round, position: 'insideBottom', offset: -5 }}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="wins" 
            stroke="#16a34a" 
            strokeWidth={2}
            name={t[language].wins}
          />
          <Line 
            type="monotone" 
            dataKey="draws" 
            stroke="#eab308" 
            strokeWidth={2}
            name={t[language].draws}
          />
          <Line 
            type="monotone" 
            dataKey="losses" 
            stroke="#dc2626" 
            strokeWidth={2}
            name={t[language].losses}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// =====================================================
// 2. GRÁFICO DE BARRAS - Goles A Favor vs En Contra
// =====================================================
export const GoalsBarChart = ({ data, language = 'es' }) => {
  const t = {
    es: {
      title: 'Goles por Partido',
      goalsFor: 'Goles a Favor',
      goalsAgainst: 'Goles en Contra',
      opponent: 'Rival'
    },
    en: {
      title: 'Goals per Match',
      goalsFor: 'Goals For',
      goalsAgainst: 'Goals Against',
      opponent: 'Opponent'
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{t[language].title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="opponent" angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="goalsFor" 
            fill="#3b82f6" 
            name={t[language].goalsFor}
          />
          <Bar 
            dataKey="goalsAgainst" 
            fill="#ef4444" 
            name={t[language].goalsAgainst}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// =====================================================
// 3. GRÁFICO DE BARRAS HORIZONTALES - Top Goleadores
// =====================================================
export const TopScorersChart = ({ data, language = 'es' }) => {
  const t = {
    es: {
      title: 'Top 10 Goleadores',
      goals: 'Goles'
    },
    en: {
      title: 'Top 10 Scorers',
      goals: 'Goals'
    }
  };

  // Colores para las barras
  const COLORS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
    '#06b6d4', '#6366f1', '#a855f7', '#f43f5e', '#84cc16'
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{t[language].title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={120} />
          <Tooltip />
          <Bar dataKey="goals" name={t[language].goals}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// =====================================================
// 4. GRÁFICO DE BARRAS HORIZONTALES - Top Asistentes
// =====================================================
export const TopAssistersChart = ({ data, language = 'es' }) => {
  const t = {
    es: {
      title: 'Top 10 Asistentes',
      assists: 'Asistencias'
    },
    en: {
      title: 'Top 10 Assisters',
      assists: 'Assists'
    }
  };

  const COLORS = [
    '#16a34a', '#0891b2', '#7c3aed', '#db2777', '#ea580c',
    '#0284c7', '#9333ea', '#dc2626', '#059669', '#4f46e5'
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{t[language].title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={120} />
          <Tooltip />
          <Bar dataKey="assists" name={t[language].assists}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// =====================================================
// 5. GRÁFICO DE RADAR - Rendimiento del Jugador
// =====================================================
export const PlayerRadarChart = ({ data, language = 'es' }) => {
  const t = {
    es: {
      title: 'Perfil del Jugador',
      stats: 'Estadísticas'
    },
    en: {
      title: 'Player Profile',
      stats: 'Statistics'
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{t[language].title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar
            name={t[language].stats}
            dataKey="value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

// =====================================================
// 6. GRÁFICO DE LÍNEA - Evolución de Goles del Jugador
// =====================================================
export const PlayerGoalsEvolutionChart = ({ data, language = 'es' }) => {
  const t = {
    es: {
      title: 'Evolución de Goles',
      goals: 'Goles',
      match: 'Partido'
    },
    en: {
      title: 'Goals Evolution',
      goals: 'Goals',
      match: 'Match'
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{t[language].title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="matchNumber" 
            label={{ value: t[language].match, position: 'insideBottom', offset: -5 }}
          />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="goals" 
            stroke="#16a34a" 
            strokeWidth={3}
            name={t[language].goals}
            dot={{ fill: '#16a34a', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// =====================================================
// 7. GRÁFICO DE BARRAS - Minutos por Partido
// =====================================================
export const PlayerMinutesChart = ({ data, language = 'es' }) => {
  const t = {
    es: {
      title: 'Minutos por Partido',
      minutes: 'Minutos',
      opponent: 'Rival'
    },
    en: {
      title: 'Minutes per Match',
      minutes: 'Minutes',
      opponent: 'Opponent'
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{t[language].title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="opponent" angle={-45} textAnchor="end" height={80} />
          <YAxis domain={[0, 90]} />
          <Tooltip />
          <Bar 
            dataKey="minutes" 
            fill="#2563eb" 
            name={t[language].minutes}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// =====================================================
// 8. GRÁFICO DE BARRAS HORIZONTALES - Top Minutos
// =====================================================
export const TopMinutesChart = ({ data, language = 'es' }) => {
  const t = {
    es: {
      title: 'Top 10 Minutos Jugados',
      minutes: 'Minutos'
    },
    en: {
      title: 'Top 10 Minutes Played',
      minutes: 'Minutes'
    }
  };

  const COLORS = [
    '#0891b2', '#06b6d4', '#14b8a6', '#10b981', '#22c55e',
    '#84cc16', '#a3e635', '#bef264', '#d9f99d', '#ecfccb'
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{t[language].title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={120} />
          <Tooltip />
          <Bar dataKey="minutes" name={t[language].minutes}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// =====================================================
// 9. GRÁFICO CIRCULAR - Distribución de Resultados
// =====================================================
export const ResultsPieChart = ({ wins, draws, losses, language = 'es' }) => {
  const t = {
    es: {
      title: 'Distribución de Resultados',
      wins: 'Victorias',
      draws: 'Empates',
      losses: 'Derrotas'
    },
    en: {
      title: 'Results Distribution',
      wins: 'Wins',
      draws: 'Draws',
      losses: 'Losses'
    }
  };

  const total = wins + draws + losses;
  const winsPercent = total > 0 ? Math.round((wins / total) * 100) : 0;
  const drawsPercent = total > 0 ? Math.round((draws / total) * 100) : 0;
  const lossesPercent = total > 0 ? Math.round((losses / total) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{t[language].title}</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{winsPercent}%</div>
          <div className="text-sm text-gray-500">{t[language].wins}</div>
          <div className="text-lg font-semibold text-gray-700">{wins}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600">{drawsPercent}%</div>
          <div className="text-sm text-gray-500">{t[language].draws}</div>
          <div className="text-lg font-semibold text-gray-700">{draws}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-600">{lossesPercent}%</div>
          <div className="text-sm text-gray-500">{t[language].losses}</div>
          <div className="text-lg font-semibold text-gray-700">{losses}</div>
        </div>
      </div>
      
      {/* Barra de progreso visual */}
      <div className="mt-4 h-8 flex rounded-lg overflow-hidden">
        {wins > 0 && (
          <div 
            className="bg-green-500 flex items-center justify-center text-white text-xs font-bold"
            style={{ width: `${winsPercent}%` }}
          >
            {winsPercent > 10 && `${winsPercent}%`}
          </div>
        )}
        {draws > 0 && (
          <div 
            className="bg-yellow-500 flex items-center justify-center text-white text-xs font-bold"
            style={{ width: `${drawsPercent}%` }}
          >
            {drawsPercent > 10 && `${drawsPercent}%`}
          </div>
        )}
        {losses > 0 && (
          <div 
            className="bg-red-500 flex items-center justify-center text-white text-xs font-bold"
            style={{ width: `${lossesPercent}%` }}
          >
            {lossesPercent > 10 && `${lossesPercent}%`}
          </div>
        )}
      </div>
    </div>
  );
};