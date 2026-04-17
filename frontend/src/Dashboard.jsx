import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Fan, Server, Thermometer, Wind, History, Moon, Sun, Lock, User, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import logoSrc from './assets/logo.svg';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const formatVal = (val, dec = 1) => val != null && !isNaN(val) ? Number(val).toFixed(dec) : '--';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/telemetry');
        if (response.ok) {
          const result = await response.json();
          // Transform for Recharts (reverse to get chronological order)
          const chartData = [...result].reverse().map(item => ({
            time: new Date(item.created_at).toLocaleTimeString(),
            temp: item.tmp,
            vib: item.vib,
            device_id: item.device_id,
            hum: item.hum,
            status: item.status,
            id: item.id,
            confirmed_by: item.confirmed_by,
            confirmed_at: item.confirmed_at,
            responsible_operator: item.responsible_operator
          }));
          setData(chartData);

          // Get latest values for each node
          const latestNodes = result.reduce((acc, curr) => {
            if (!acc[curr.device_id]) {
              acc[curr.device_id] = curr;
            }
            return acc;
          }, {});

          // Sort node IDs and format them
          const sortedNodes = Object.values(latestNodes).sort((a, b) =>
            a.device_id.localeCompare(b.device_id)
          );
          setNodes(sortedNodes);
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        console.error("Failed to fetch telemetry data", error);
        setIsConnected(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatNodeName = (nodeId) => {
    return nodeId.replace('VentilationNode_0', 'Zone ');
  };

  const getFilteredChartData = () => {
    if (selectedZone === 'ALL') {
      const grouped = data.reduce((acc, curr) => {
        if (!acc[curr.time]) {
          acc[curr.time] = { time: curr.time, tempSum: 0, vibSum: 0, count: 0 };
        }
        acc[curr.time].tempSum += curr.temp;
        acc[curr.time].vibSum += curr.vib;
        acc[curr.time].count += 1;
        return acc;
      }, {});
      return Object.values(grouped).map(item => ({
        time: item.time,
        temp: item.tempSum / item.count,
        vib: item.vibSum / item.count
      }));
    }
    return data.filter(d => d.device_id === selectedZone);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    try {
      const resp = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (resp.ok) {
        const user = await resp.json();
        setCurrentUser(user);
        setLoginError('');
      } else {
        setLoginError('Identifiants incorrects');
      }
    } catch (err) {
      setLoginError('Erreur de connexion au serveur');
    }
  };

  const acknowledgeAlert = async (telemetry_id) => {
    try {
      await fetch('http://localhost:5000/api/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telemetry_id, user_id: currentUser.id })
      });
      // Will be refreshed in next poll automatically
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    if (currentUser?.session_id) {
      try {
        await fetch('http://localhost:5000/api/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: currentUser.session_id })
        });
      } catch (err) {
        console.error(err);
      }
    }
    setCurrentUser(null);
  };

  const chartDataToDisplay = getFilteredChartData();
  const tableDataToDisplay = selectedZone === 'ALL' ? [...data].reverse() : [...data].filter(d => d.device_id === selectedZone).reverse();

  if (!currentUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'dark bg-zinc-950' : 'bg-slate-50'}`}>
        <div className="absolute top-8 right-8">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-white border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-500 transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        <Card className="w-full max-w-md p-8 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl">
          <div className="flex flex-col items-center mb-8">
            <img src={logoSrc} alt="Logo" className="w-70 h-auto mb-6 object-contain drop-shadow-lg" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Portail de Supervision</h1>
            <p className="text-slate-500 dark:text-zinc-400 mt-2 text-center text-sm">Veuillez vous authentifier pour accéder au dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Identifiant</label>
              <input name="username" type="text" className="w-full p-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Mot de passe</label>
              <input name="password" type="password" className="w-full p-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" required />
            </div>
            {loginError && <p className="text-red-500 text-sm mt-2 font-medium">{loginError}</p>}
            <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors mt-6 shadow-md shadow-amber-500/20">
              Connexion
            </button>
          </form>
          <div className="mt-8 text-center text-xs text-slate-400 dark:text-zinc-500">
            Accès restreint au personnel habilité
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-zinc-950' : 'bg-slate-50'}`}>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <img src={logoSrc} alt="Logo" className="w-40 h-auto object-contain drop-shadow-sm" />
            <div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-white border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-500 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-full">
              <User className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-slate-600 dark:text-zinc-300 uppercase">{currentUser.username} <span className="text-xs opacity-60">({currentUser.role})</span></span>
            </div>
            <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-400 bg-red-500/10 px-3 py-2 rounded-full font-medium transition-colors">Déconnexion</button>

            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-full ml-2">
              <Server className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-zinc-300">Serveur</span>
              <div className={`w-2.5 h-2.5 rounded-full ml-2 ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <Card className="w-full">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-500" />
              Évolution Globale (Température & Vibration)
            </CardTitle>
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800/50 rounded-lg shadow-inner overflow-x-auto">
              <button
                onClick={() => setSelectedZone('ALL')}
                className={`whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-md transition-all ${selectedZone === 'ALL'
                  ? 'bg-white text-amber-600 dark:text-amber-500 shadow-sm border border-amber-500/30 dark:bg-zinc-800/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 dark:text-zinc-500 dark:hover:text-amber-400/80 dark:hover:bg-zinc-800/30 border border-transparent'
                  }`}
              >
                Tous
              </button>
              {nodes.map(node => (
                <button
                  key={node.device_id}
                  onClick={() => setSelectedZone(node.device_id)}
                  className={`whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-md transition-all ${selectedZone === node.device_id
                    ? 'bg-white text-amber-600 dark:text-amber-500 shadow-sm border border-amber-500/30 dark:bg-zinc-800/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 dark:text-zinc-500 dark:hover:text-amber-400/80 dark:hover:bg-zinc-800/30 border border-transparent'
                    }`}
                >
                  {formatNodeName(node.device_id)}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {/* Hauteur FIXE définie pour éviter le bug Recharts */}
            <div className="h-[300px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={chartDataToDisplay} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#27272a" : "#e2e8f0"} vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="#71717a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#71717a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}°C`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#71717a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value} mm/s`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: isDarkMode ? '#18181b' : '#ffffff', border: isDarkMode ? '1px solid #27272a' : '1px solid #e2e8f0', borderRadius: '8px' }}
                    itemStyle={{ color: isDarkMode ? '#e4e4e7' : '#0f172a' }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temp"
                    name="Température"
                    stroke={isDarkMode ? '#fbbf24' : '#d97706'}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: isDarkMode ? '#fbbf24' : '#d97706' }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="vib"
                    name="Vibration"
                    stroke={isDarkMode ? '#e4e4e7' : '#334155'}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: isDarkMode ? '#e4e4e7' : '#334155' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {nodes.map((node) => (
            <Card key={node.device_id} className="relative overflow-hidden group hover:border-amber-500/50 transition-colors duration-300">
              <div className={`absolute top-0 left-0 w-1 h-full ${node.status === 'SAFE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base text-slate-800 dark:text-zinc-100">{formatNodeName(node.device_id)}</CardTitle>
                <Badge variant={node.status === 'SAFE' ? 'success' : 'destructive'} className="uppercase">
                  {node.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-slate-500 dark:text-zinc-400 text-xs gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Temp
                    </div>
                    <div className="text-xl font-semibold text-slate-800 dark:text-zinc-100">{formatVal(node.tmp, 1)}°C</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-slate-500 dark:text-zinc-400 text-xs gap-1">
                      <Wind className="w-3.5 h-3.5" /> Humidité
                    </div>
                    <div className="text-xl font-semibold text-slate-800 dark:text-zinc-100">{formatVal(node.hum, 1)}%</div>
                  </div>
                  <div className="space-y-1 col-span-2 pt-2 border-t border-slate-200 dark:border-zinc-800/50">
                    <div className="flex items-center text-slate-500 dark:text-zinc-400 text-xs gap-1">
                      <Activity className="w-3.5 h-3.5" /> Vibration
                    </div>
                    <div className="text-lg font-medium text-slate-700 dark:text-zinc-300">{formatVal(node.vib, 2)} <span className="text-xs text-slate-500 dark:text-zinc-500">mm/s</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {nodes.length === 0 && (
            <div className="col-span-full py-12 text-center text-zinc-500">
              En attente de données du serveur...
            </div>
          )}
        </div>

        {/* Historique Table */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-amber-500" />
              Historique des Relevés et Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] overflow-auto rounded-md border border-slate-200 dark:border-zinc-800">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-slate-100 text-slate-500 border-b border-slate-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 shadow-sm z-10">
                  <tr>
                    <th className="px-4 py-3 font-medium">Heure</th>
                    <th className="px-4 py-3 font-medium">Zone</th>
                    <th className="px-4 py-3 font-medium">Temp (°C)</th>
                    <th className="px-4 py-3 font-medium">Hum (%)</th>
                    <th className="px-4 py-3 font-medium">Vib (mm/s)</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    {currentUser.role === 'MANAGER' && <th className="px-4 py-3 font-medium">Audit Log</th>}
                    {currentUser.role === 'OPERATOR' && <th className="px-4 py-3 font-medium text-center">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white dark:divide-zinc-800/50 dark:bg-zinc-950/50">
                  {tableDataToDisplay.map((row, idx) => {
                    const isDanger = row.status === 'DANGER';
                    const isAck = !!row.confirmed_by;
                    return (
                      <tr
                        key={row.id || idx}
                        className={`hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors ${isDanger && !isAck ? 'bg-red-50 dark:bg-red-950/30' : ''}`}
                      >
                        <td className="px-4 py-3 text-slate-700 dark:text-zinc-300">{row.time}</td>
                        <td className="px-4 py-3 text-slate-800 dark:text-zinc-300 font-medium">{formatNodeName(row.device_id)}</td>
                        <td className={`px-4 py-3 ${isDanger ? 'text-red-500 dark:text-red-400 font-semibold' : 'text-slate-700 dark:text-zinc-300'}`}>{formatVal(row.temp, 1)}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-zinc-300">{formatVal(row.hum, 1)}</td>
                        <td className={`px-4 py-3 ${isDanger ? 'text-red-500 dark:text-red-400 font-semibold' : 'text-slate-700 dark:text-zinc-300'}`}>{formatVal(row.vib, 2)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={row.status === 'SAFE' ? 'success' : 'destructive'} className="uppercase">
                            {row.status}
                          </Badge>
                        </td>
                        {currentUser.role === 'MANAGER' && (
                          <td className="px-4 py-3">
                            {isAck ? (
                              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                                <CheckCircle className="w-3.5 h-3.5" /> Vu par {row.confirmed_by} à {new Date(row.confirmed_at).toLocaleTimeString()}
                              </span>
                            ) : isDanger ? (
                              <span className="flex flex-col gap-1 text-xs">
                                <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium animate-pulse">
                                  <AlertTriangle className="w-3.5 h-3.5" /> 🔴 En attente
                                </span>
                                <span className="text-slate-500 dark:text-zinc-500 mt-0.5">
                                  Responsable en poste : <strong className="text-red-600 dark:text-red-500 uppercase">{row.responsible_operator || 'AUCUN'}</strong>
                                </span>
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-zinc-600 text-xs">--</span>
                            )}
                          </td>
                        )}
                        {currentUser.role === 'OPERATOR' && (
                          <td className="px-4 py-3 text-center">
                            {isDanger && !isAck ? (
                              <button onClick={() => acknowledgeAlert(row.id)} className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold rounded-md transition-colors text-xs whitespace-nowrap shadow-sm">
                                Acquitter l'Alerte
                              </button>
                            ) : isAck ? (
                              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                                Traitée
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-zinc-600 text-xs">--</span>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {tableDataToDisplay.length === 0 && (
                <div className="py-12 text-center text-zinc-500">
                  Aucune donnée disponible.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
