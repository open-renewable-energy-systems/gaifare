import React, { useState, useEffect } from 'react';
import { Settings, Brain, Wifi, Zap, Battery, Home, Sun, Wind, Car, TrendingUp } from 'lucide-react';

interface NegotiationDetails {
  title: string;
  scenario: string;
  agents: { name: string; role: string; concern: string; }[];
  negotiation: string[];
  outcome: string;
  impact: string;
}

interface Negotiation {
  id: number;
  message: string;
  timestamp: Date;
  participants: number;
  details: NegotiationDetails;
}

interface AIDecision {
  id: number;
  decision: string;
  timestamp: Date;
  impact: string;
}

const GAIFAREDemo = () => {
  const [time, setTime] = useState(new Date());
  const [cumulativeStats, setCumulativeStats] = useState({
    totalSavings: 0,
    energyOptimized: 0,
    co2Reduced: 0,
    socialCostSaved: 0,
    gridStabilityContributions: 0
  });
  const [energyData, setEnergyData] = useState({
    solarGeneration: 4.2,
    windGeneration: 2.8,
    batteryLevel: 75,
    homeConsumption: 3.5,
    evCharging: 7.2,
    gridExport: 0,
    weatherCondition: 'sunny',
    gridPrice: 0.12
  });

  const [agents] = useState([
    { id: 'home', name: 'Smart Home Agent', status: 'active', priority: 'comfort', consumption: 3.5 },
    { id: 'ev', name: 'EV Charging Agent', status: 'negotiating', priority: 'efficiency', consumption: 7.2 },
    { id: 'battery', name: 'Battery Storage Agent', status: 'optimizing', priority: 'grid-support', level: 75 },
    { id: 'solar', name: 'Solar Generation Agent', status: 'active', generation: 4.2 },
    { id: 'wind', name: 'Wind Generation Agent', status: 'active', generation: 2.8 }
  ]);

  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [aiDecisions, setAiDecisions] = useState<AIDecision[]>([]);
  const [selectedNegotiation, setSelectedNegotiation] = useState<Negotiation | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const totalGeneration = energyData.solarGeneration + energyData.windGeneration;
  const totalConsumption = energyData.homeConsumption + energyData.evCharging;
  const netFlow = totalGeneration - totalConsumption;

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
      
      // Simulate dynamic energy conditions
      setEnergyData(prev => {
        const hour = new Date().getHours();
        const minute = new Date().getMinutes();
        
        // Solar generation based on time of day
        const solarMultiplier = hour >= 6 && hour <= 18 ? 
          Math.sin((hour - 6) * Math.PI / 12) * 0.8 + 0.2 : 0;
        
        // Realistic grid pricing - updates every 15 minutes with TOU patterns
        let newGridPrice = prev.gridPrice;
        if (minute % 15 === 0) { // Update every 15 minutes like real markets
          // Time-of-use pricing pattern
          if (hour >= 16 && hour <= 21) { // Peak hours (4-9 PM)
            newGridPrice = 0.18 + Math.random() * 0.08; // $0.18-0.26/kWh
          } else if (hour >= 6 && hour <= 16) { // Mid-peak (6 AM-4 PM)  
            newGridPrice = 0.12 + Math.random() * 0.04; // $0.12-0.16/kWh
          } else { // Off-peak (9 PM-6 AM)
            newGridPrice = 0.06 + Math.random() * 0.04; // $0.06-0.10/kWh
          }
        }
        
        return {
          ...prev,
          solarGeneration: Math.max(0, 8 * solarMultiplier + Math.random() * 0.5 - 0.25),
          windGeneration: Math.max(0, 3 + Math.random() * 2 - 1),
          homeConsumption: 2.5 + Math.random() * 2,
          batteryLevel: Math.max(10, Math.min(95, prev.batteryLevel + (Math.random() - 0.5) * 2)),
          gridPrice: newGridPrice
        };
      });

      // Calculate cumulative savings vs non-AI system (accelerated for demo)
      setCumulativeStats(prev => {
        const currentHour = new Date().getHours();
        const demoAccelerator = 15; // Accelerate accumulation for demo visibility
        const intervalMinutes = (2 / 60) * demoAccelerator; // Simulate 30 seconds = 7.5 minutes of real operation
        
        // Baseline "dumb" system behavior (what happens without GAIFARE)
        const baselineConsumption = 4.5; // kWh - constant consumption, no optimization
        const baselineGridUse = Math.max(0, baselineConsumption - (energyData.solarGeneration + energyData.windGeneration) * 0.65); // 65% efficiency without AI
        const baselineWaste = Math.max(0, (energyData.solarGeneration + energyData.windGeneration) * 0.65 - baselineConsumption); // Unused renewable energy
        
        // AI-optimized system (current GAIFARE performance)
        const aiConsumption = energyData.homeConsumption + energyData.evCharging;
        const aiGridUse = Math.max(0, aiConsumption - (energyData.solarGeneration + energyData.windGeneration) * 0.95); // 95% AI efficiency
        const aiWaste = Math.max(0, (energyData.solarGeneration + energyData.windGeneration) * 0.05); // Minimal waste with AI
        
        // Calculate savings per interval
        const energySaved = Math.max(0.1, (baselineGridUse - aiGridUse + baselineWaste - aiWaste) * intervalMinutes);
        const costSaved = energySaved * energyData.gridPrice;
        
        // CO2 and Social Cost of Carbon calculations
        const co2SavedLbs = energySaved * 0.85; // lbs CO2 per kWh (US grid average)
        const co2SavedTons = co2SavedLbs / 2000; // Convert to tons
        const socialCostPerTon = 185; // EPA's 2023 Social Cost of Carbon: $185/ton CO2
        const socialCostSaved = co2SavedTons * socialCostPerTon;
        
        // Grid stability contribution with higher demo impact
        const gridContribution = (currentHour >= 16 && currentHour <= 21 && netFlow > 0) ? 
          Math.abs(netFlow) * intervalMinutes * 1.2 : // Higher multiplier for demo visibility
          Math.abs(netFlow) * intervalMinutes * 0.3;
        
        // Add some variability for realistic demo behavior
        const efficiencyBonus = Math.random() * 0.5 + 0.8; // 0.8-1.3x multiplier
        
        return {
          totalSavings: prev.totalSavings + Math.max(0.05, costSaved * efficiencyBonus),
          energyOptimized: prev.energyOptimized + Math.max(0.1, energySaved * efficiencyBonus),
          co2Reduced: prev.co2Reduced + Math.max(0.1, co2SavedLbs * efficiencyBonus),
          socialCostSaved: (prev.socialCostSaved || 0) + Math.max(0.01, socialCostSaved * efficiencyBonus),
          gridStabilityContributions: prev.gridStabilityContributions + Math.max(0, gridContribution)
        };
      });

      // Simulate AI negotiations
      if (Math.random() < 0.3) {
        const negotiationTypes = [
          { 
            message: 'EV negotiating charge delay with Battery and Grid agents', 
            participants: 3,
            details: {
              title: 'EV Charging Optimization Negotiation',
              scenario: 'The EV needs to charge but wants to minimize cost and grid impact.',
              agents: [
                { name: 'EV Agent', role: 'Requestor', concern: 'Complete charging by 7 AM for commute, minimize cost' },
                { name: 'Battery Agent', role: 'Mediator', concern: 'Balance home energy needs with EV charging' },
                { name: 'Grid Agent', role: 'Provider', concern: 'Avoid peak demand, offer time-of-use pricing' }
              ],
              negotiation: [
                'EV Agent: "I need 40 kWh by 7 AM, current grid price is $0.15/kWh"',
                'Grid Agent: "Peak period until 9 PM ($0.18/kWh), off-peak starts at 11 PM ($0.08/kWh)"',
                'Battery Agent: "I can provide 15 kWh now, then EV can use cheap grid power after 11 PM"',
                'EV Agent: "Agreed. Start with battery power, then switch to grid at 11 PM"'
              ],
              outcome: 'Charging delayed to off-peak hours, saving $4.00 and reducing grid strain',
              impact: 'Cost: -47% | Grid load: -23% | Completion: On-time'
            }
          },
          { 
            message: 'Battery proposing grid export during peak to Home and Grid agents', 
            participants: 3,
            details: {
              title: 'Peak-Time Grid Export Strategy',
              scenario: 'Battery detects high grid prices and proposes selling stored energy back to the grid.',
              agents: [
                { name: 'Battery Agent', role: 'Proposer', concern: 'Maximize revenue during peak pricing window' },
                { name: 'Home Agent', role: 'Stakeholder', concern: 'Ensure adequate power for evening activities' },
                { name: 'Grid Agent', role: 'Buyer', concern: 'Need additional power to meet peak demand' }
              ],
              negotiation: [
                'Battery Agent: "Grid price hit $0.22/kWh. I propose exporting 8 kWh for $1.76 revenue"',
                'Home Agent: "Evening cooking starts in 1 hour, need at least 5 kWh reserved"',
                'Grid Agent: "Will pay premium rate for immediate 6 kWh, standard rate after 7 PM"',
                'Battery Agent: "Compromise: Export 6 kWh now at premium, keep 7 kWh for home use"'
              ],
              outcome: 'Export 6 kWh to grid during peak, earning $1.32 while maintaining home energy security',
              impact: 'Revenue: +$1.32 | Home security: 100% | Grid support: +6 kWh'
            }
          }
        ];
        
        const selectedNegotiation = negotiationTypes[Math.floor(Math.random() * negotiationTypes.length)];
        const newNegotiation = {
          id: Date.now(),
          message: selectedNegotiation.message,
          timestamp: new Date(),
          participants: selectedNegotiation.participants,
          details: selectedNegotiation.details
        };
        
        setNegotiations(prev => [newNegotiation, ...prev.slice(0, 4)]);
      }

      // Simulate AI decisions
      if (Math.random() < 0.4) {
        const decisions = [
          'Optimized solar panel orientation for 12% efficiency gain',
          'Scheduled EV charging during low-cost period (2-6 AM)',
          'Battery discharge authorized for peak grid support',
          'Home HVAC adjusted based on occupancy prediction',
          'Wind turbine maintenance scheduled during low-wind forecast',
          'Microgrid formed with 3 neighboring homes'
        ];
        
        const newDecision = {
          id: Date.now(),
          decision: decisions[Math.floor(Math.random() * decisions.length)],
          timestamp: new Date(),
          impact: '+' + (Math.random() * 15 + 5).toFixed(1) + '% efficiency'
        };
        
        setAiDecisions(prev => [newDecision, ...prev.slice(0, 4)]);
      }
    }, 2000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            <Brain className="inline-block mr-3 text-green-600" size={40} />
            GAIFARE Demo
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Generative AI For Autonomous Renewable Energy Systems
          </p>
          <div className="bg-white rounded-lg p-4 shadow-md inline-block">
            <p className="text-sm text-gray-500">
              System Time: {time.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })} {time.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
              })}
            </p>
            <p className="text-sm text-gray-500">
              Grid Price: ${energyData.gridPrice.toFixed(3)}/kWh 
              <span className="ml-2 text-xs">
                {new Date().getHours() >= 16 && new Date().getHours() <= 21 ? '(Peak)' :
                 new Date().getHours() >= 6 && new Date().getHours() <= 16 ? '(Mid-Peak)' : '(Off-Peak)'}
              </span>
            </p>
            
            <div className="border-t border-gray-200 pt-3">
              <div 
                className="text-sm font-semibold text-gray-700 mb-2 cursor-pointer hover:text-blue-600 transition-colors flex flex-col items-center text-center"
                onClick={() => setSelectedMetric('systemPerformance')}
              >
                <div><strong>GAIFARE System Performance:</strong></div>
                <span className="text-xs text-gray-500 mt-1 flex items-center">
                  Click for detailed analysis → <TrendingUp size={14} className="ml-1" />
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                <div>
                  <strong>💰 Cost Savings:</strong> ${cumulativeStats.totalSavings.toFixed(2)}
                </div>
                <div>
                  <strong>⚡ Energy Optimized:</strong> {cumulativeStats.energyOptimized.toFixed(1)} kWh
                </div>
                <div>
                  <strong>💚 Social Cost of Carbon Saved:</strong> ${(cumulativeStats.socialCostSaved || 0).toFixed(2)}
                </div>
                <div>
                  <strong>🏘️ Grid Contributions:</strong> {cumulativeStats.gridStabilityContributions.toFixed(1)} kWh
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Energy Flow Network */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Zap className="mr-2 text-blue-600" />
            Live Energy Flow Network
          </h2>
          
          {/* Energy Flow Visualization */}
          <div className="relative h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 overflow-hidden">
            
            {/* Grid Connection - Top Center */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gray-600 text-white p-3 rounded-lg text-center shadow-lg min-w-24">
                <div className="font-bold text-sm">⚡ GRID</div>
                <div className="text-xs">${energyData.gridPrice.toFixed(3)}/kWh</div>
                <div className="text-xs font-semibold">
                  {netFlow < 0 ? (
                    <span className="text-red-200">Import {Math.abs(netFlow).toFixed(1)}kW</span>
                  ) : (
                    <span className="text-green-200">Export {netFlow.toFixed(1)}kW</span>
                  )}
                </div>
              </div>
            </div>

            {/* Solar Panel - Top Right */}
            <div className="absolute top-4 right-4">
              <div className="bg-yellow-500 text-white p-3 rounded-lg text-center shadow-lg min-w-20">
                <Sun size={20} className="mx-auto mb-1" />
                <div className="font-bold text-sm">SOLAR</div>
                <div className="text-xs">{energyData.solarGeneration.toFixed(1)} kW</div>
                <div className="text-xs opacity-80">
                  {energyData.solarGeneration > 5 ? "Peak" : energyData.solarGeneration > 2 ? "Good" : "Low"}
                </div>
              </div>
            </div>

            {/* Wind Turbine - Top Left */}
            <div className="absolute top-4 left-4">
              <div className="bg-blue-500 text-white p-3 rounded-lg text-center shadow-lg min-w-20">
                <Wind size={20} className="mx-auto mb-1" />
                <div className="font-bold text-sm">WIND</div>
                <div className="text-xs">{energyData.windGeneration.toFixed(1)} kW</div>
                <div className="text-xs opacity-80">
                  {energyData.windGeneration > 4 ? "Strong" : energyData.windGeneration > 2 ? "Steady" : "Light"}
                </div>
              </div>
            </div>

            {/* Battery Storage - Center Hub */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className={`p-4 rounded-lg text-center shadow-lg text-white min-w-24 ${
                energyData.batteryLevel > 60 ? 'bg-green-500' : 
                energyData.batteryLevel > 30 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                <Battery size={24} className="mx-auto mb-1" />
                <div className="font-bold text-sm">BATTERY</div>
                <div className="text-xs">{energyData.batteryLevel.toFixed(0)}%</div>
                <div className="text-xs opacity-80">
                  {netFlow > 0 && energyData.batteryLevel < 90 ? 'Charging' : 
                   netFlow < 0 && energyData.batteryLevel > 20 ? 'Discharging' : 'Standby'}
                </div>
              </div>
            </div>

            {/* Home - Bottom Left */}
            <div className="absolute bottom-4 left-4">
              <div className="bg-purple-600 text-white p-3 rounded-lg text-center shadow-lg min-w-20">
                <Home size={20} className="mx-auto mb-1" />
                <div className="font-bold text-sm">HOME</div>
                <div className="text-xs">{energyData.homeConsumption.toFixed(1)} kW</div>
                <div className="text-xs opacity-80">
                  {energyData.homeConsumption > 4 ? "High" : energyData.homeConsumption > 2.5 ? "Normal" : "Low"}
                </div>
              </div>
            </div>

            {/* EV Charger - Bottom Right */}
            <div className="absolute bottom-4 right-4">
              <div className="bg-green-600 text-white p-3 rounded-lg text-center shadow-lg min-w-20">
                <Car size={20} className="mx-auto mb-1" />
                <div className="font-bold text-sm">EV</div>
                <div className="text-xs">{energyData.evCharging.toFixed(1)} kW</div>
                <div className="text-xs opacity-80">
                  {energyData.evCharging > 6 ? "Fast" : energyData.evCharging > 3 ? "Normal" : "Slow"}
                </div>
              </div>
            </div>

            {/* Energy Flow Lines with SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              <defs>
                {/* Small arrow markers that don't overwhelm the flow lines */}
                <marker id="arrow-solar" markerWidth="4" markerHeight="4" refX="3" refY="1.5" orient="auto">
                  <path d="M0,0 L0,3 L3,1.5 z" fill="#eab308" />
                </marker>
                <marker id="arrow-wind" markerWidth="4" markerHeight="4" refX="3" refY="1.5" orient="auto">
                  <path d="M0,0 L0,3 L3,1.5 z" fill="#3b82f6" />
                </marker>
                <marker id="arrow-battery" markerWidth="4" markerHeight="4" refX="3" refY="1.5" orient="auto">
                  <path d="M0,0 L0,3 L3,1.5 z" fill="#10b981" />
                </marker>
                <marker id="arrow-grid" markerWidth="4" markerHeight="4" refX="3" refY="1.5" orient="auto">
                  <path d="M0,0 L0,3 L3,1.5 z" fill="#6b7280" />
                </marker>
              </defs>

              {/* Solar to Battery flow */}
              {energyData.solarGeneration > 0.5 && (
                <>
                  <line 
                    x1="85%" y1="25%" x2="60%" y2="45%" 
                    stroke="#eab308" 
                    strokeWidth="4"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                    markerEnd="url(#arrow-solar)"
                    opacity="0.8"
                  />
                  <text x="72%" y="32%" fill="#eab308" fontSize="10" className="font-bold">
                    {energyData.solarGeneration.toFixed(1)}kW
                  </text>
                </>
              )}

              {/* Wind to Battery flow */}
              {energyData.windGeneration > 0.5 && (
                <>
                  <line 
                    x1="15%" y1="25%" x2="40%" y2="45%" 
                    stroke="#3b82f6" 
                    strokeWidth="4"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                    markerEnd="url(#arrow-wind)"
                    opacity="0.8"
                  />
                  <text x="20%" y="32%" fill="#3b82f6" fontSize="10" className="font-bold">
                    {energyData.windGeneration.toFixed(1)}kW
                  </text>
                </>
              )}

              {/* Battery to Home flow */}
              <line 
                x1="40%" y1="55%" x2="20%" y2="75%" 
                stroke="#9333ea" 
                strokeWidth="4"
                strokeDasharray="4,4"
                className="animate-pulse"
                markerEnd="url(#arrow-battery)"
                opacity="0.7"
              />
              <text x="25%" y="68%" fill="#9333ea" fontSize="10" className="font-bold">
                {energyData.homeConsumption.toFixed(1)}kW
              </text>

              {/* Battery to EV flow */}
              {energyData.evCharging > 1 && (
                <>
                  <line 
                    x1="60%" y1="55%" x2="80%" y2="75%" 
                    stroke="#16a34a" 
                    strokeWidth="4"
                    strokeDasharray="4,4"
                    className="animate-pulse"
                    markerEnd="url(#arrow-battery)"
                    opacity="0.7"
                  />
                  <text x="72%" y="68%" fill="#16a34a" fontSize="10" className="font-bold">
                    {energyData.evCharging.toFixed(1)}kW
                  </text>
                </>
              )}

              {/* Grid connection flow */}
              <line 
                x1="50%" y1="25%" x2="50%" y2="35%" 
                stroke={netFlow < 0 ? "#ef4444" : "#10b981"} 
                strokeWidth="5"
                strokeDasharray="6,6"
                className="animate-pulse"
                markerEnd="url(#arrow-grid)"
                opacity="0.8"
              />
              {Math.abs(netFlow) > 0.5 && (
                <text x="52%" y="32%" fill={netFlow < 0 ? "#ef4444" : "#10b981"} fontSize="11" className="font-bold">
                  {netFlow < 0 ? 'Import' : 'Export'} {Math.abs(netFlow).toFixed(1)}kW
                </text>
              )}

              {/* Animated energy particles */}
              {energyData.solarGeneration > 1 && (
                <circle r="3" fill="#fbbf24" opacity="0.6">
                  <animateMotion dur="2s" repeatCount="indefinite">
                    <path d="M 85% 25% L 60% 45%" />
                  </animateMotion>
                </circle>
              )}
              
              {energyData.windGeneration > 1 && (
                <circle r="3" fill="#60a5fa" opacity="0.6">
                  <animateMotion dur="1.8s" repeatCount="indefinite">
                    <path d="M 15% 25% L 40% 45%" />
                  </animateMotion>
                </circle>
              )}
            </svg>

            {/* GAIFARE AI Coordination Indicator - Positioned below the battery */}
            <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2" style={{ zIndex: 2 }}>
              <div className="bg-white bg-opacity-95 p-3 rounded-full shadow-lg border-2 border-blue-400">
                <Brain size={20} className="text-blue-600 animate-pulse" />
              </div>
              <div className="text-center mt-1">
                <div className="text-xs font-bold text-blue-700">GAIFARE AI</div>
                <div className="text-xs text-gray-600">Coordinating</div>
              </div>
            </div>

            {/* Real-time stats overlay */}
            <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded p-2 text-xs" style={{ zIndex: 2 }}>
              <div><strong>Total Gen:</strong> {totalGeneration.toFixed(1)}kW</div>
              <div><strong>Total Use:</strong> {totalConsumption.toFixed(1)}kW</div>
              <div><strong>Net Flow:</strong> <span className={netFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                {netFlow >= 0 ? '+' : ''}{netFlow.toFixed(1)}kW
              </span></div>
            </div>
          </div>
        </div>

        {/* AI Agents and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Settings className="mr-2 text-purple-600" />
              Active AI Agents
            </h2>
            
            <div className="space-y-3">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-gray-600 capitalize">
                      Priority: {agent.priority} | Status: {agent.status}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      agent.status === 'active' ? 'bg-green-500' :
                      agent.status === 'negotiating' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    <Wifi size={16} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Brain className="mr-2 text-indigo-600" />
              Recent AI Decisions
            </h2>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {aiDecisions.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent AI decisions</p>
              ) : (
                aiDecisions.map((decision) => (
                  <div key={decision.id} className="p-3 bg-indigo-50 rounded-lg">
                    <div className="text-sm font-medium">{decision.decision}</div>
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>{decision.timestamp.toLocaleTimeString()}</span>
                      <span className="font-medium text-green-600">{decision.impact}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Agent Negotiations */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Wifi className="mr-2 text-orange-600" />
            Recent Agent Negotiations
          </h2>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {negotiations.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent negotiations</p>
            ) : (
              negotiations.map((neg) => (
                <div 
                  key={neg.id} 
                  className="p-3 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors border-l-4 border-orange-400"
                  onClick={() => setSelectedNegotiation(neg)}
                >
                  <div className="text-sm font-medium">{neg.message}</div>
                  <div className="text-xs text-gray-600 mt-1 flex justify-between">
                    <span>{neg.timestamp.toLocaleTimeString()} | {neg.participants} participating agents</span>
                    <span className="text-blue-600 font-medium">Click for details →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 text-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">About GAIFARE</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Key Features</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Autonomous agent negotiation</li>
                <li>• Predictive energy optimization</li>
                <li>• Real-time grid interaction</li>
                <li>• Federated learning across homes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">AI Technologies</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Large Language Models (LLMs)</li>
                <li>• Generative adversarial networks</li>
                <li>• Multi-agent reinforcement learning</li>
                <li>• Explainable AI decisions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Project Status</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Part of LF Energy ORES</li>
                <li>• Open source development</li>
                <li>• Early incubation phase</li>
                <li>• Community contributions welcome</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {selectedNegotiation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[70vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{selectedNegotiation.details.title}</h2>
                <button 
                  onClick={() => setSelectedNegotiation(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 mb-4">{selectedNegotiation.details.scenario}</p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Agents Involved:</h3>
                  {selectedNegotiation.details.agents.map((agent, idx) => (
                    <div key={idx} className="text-sm bg-gray-50 p-2 rounded mb-2">
                      <strong>{agent.name}</strong> ({agent.role}): {agent.concern}
                    </div>
                  ))}
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Negotiation:</h3>
                  {selectedNegotiation.details.negotiation.map((step, idx) => (
                    <div key={idx} className="text-sm mb-2 p-2 bg-blue-50 rounded">
                      {step}
                    </div>
                  ))}
                </div>
                
                <div className="bg-green-50 p-3 rounded">
                  <h3 className="font-semibold text-green-800">Outcome:</h3>
                  <p className="text-sm text-green-700">{selectedNegotiation.details.outcome}</p>
                  <p className="text-xs text-green-600 font-mono mt-1">{selectedNegotiation.details.impact}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Analysis Modal */}
      {selectedMetric === 'systemPerformance' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <TrendingUp className="mr-2 text-green-600" size={28} />
                  GAIFARE Performance Analysis
                </h2>
                <button 
                  onClick={() => setSelectedMetric(null)}
                  className="text-gray-500 hover:text-white hover:bg-red-500 w-8 h-8 flex items-center justify-center rounded-full text-xl font-bold transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Current Performance Summary */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h3 className="font-bold text-lg text-gray-800 mb-3">📊 Current System Performance</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">${cumulativeStats.totalSavings.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Cost Savings</div>
                      <div className="text-xs text-gray-500">Since system start</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{cumulativeStats.energyOptimized.toFixed(1)} kWh</div>
                      <div className="text-sm text-gray-600">Energy Optimized</div>
                      <div className="text-xs text-gray-500">Waste eliminated</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{cumulativeStats.co2Reduced.toFixed(1)} lbs</div>
                      <div className="text-sm text-gray-600">CO₂ Reduced</div>
                      <div className="text-xs text-gray-500">Environmental impact</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">${(cumulativeStats.socialCostSaved || 0).toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Social Cost Saved</div>
                      <div className="text-xs text-gray-500">EPA carbon valuation</div>
                    </div>
                  </div>
                </div>

                {/* System Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                    <h4 className="font-bold text-red-800 mb-3 flex items-center">
                      ❌ Traditional "Dumb" Energy System
                    </h4>
                    <ul className="text-sm text-red-700 space-y-2">
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <div>
                          <strong>65% renewable efficiency</strong>
                          <div className="text-xs text-red-600">Poor solar/wind utilization due to lack of coordination</div>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <div>
                          <strong>35% energy waste</strong>
                          <div className="text-xs text-red-600">Excess renewable energy unused or wasted</div>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <div>
                          <strong>Fixed consumption patterns</strong>
                          <div className="text-xs text-red-600">No market awareness or time-of-use optimization</div>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                    <h4 className="font-bold text-green-800 mb-3 flex items-center">
                      ✅ GAIFARE AI-Powered System
                    </h4>
                    <ul className="text-sm text-green-700 space-y-2">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <div>
                          <strong>95% renewable efficiency</strong>
                          <div className="text-xs text-green-600">AI-optimized utilization with predictive management</div>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <div>
                          <strong>5% energy waste</strong>
                          <div className="text-xs text-green-600">Intelligent storage and load management</div>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <div>
                          <strong>Real-time market optimization</strong>
                          <div className="text-xs text-green-600">Dynamic pricing awareness and time-shifting</div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Key Performance Improvements */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-3">🚀 Key Performance Improvements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center bg-white p-3 rounded">
                      <div className="text-3xl font-bold text-green-600">+46%</div>
                      <div className="text-sm font-medium text-blue-700">Efficiency Gain</div>
                      <div className="text-xs text-gray-600">65% → 95% renewable utilization</div>
                    </div>
                    <div className="text-center bg-white p-3 rounded">
                      <div className="text-3xl font-bold text-green-600">-85%</div>
                      <div className="text-sm font-medium text-blue-700">Energy Waste Reduction</div>
                      <div className="text-xs text-gray-600">35% → 5% waste elimination</div>
                    </div>
                    <div className="text-center bg-white p-3 rounded">
                      <div className="text-3xl font-bold text-green-600">-30%</div>
                      <div className="text-sm font-medium text-blue-700">Grid Dependency</div>
                      <div className="text-xs text-gray-600">Smart load scheduling and storage</div>
                    </div>
                  </div>
                </div>

                {/* How Calculations Work */}
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <h4 className="font-bold text-yellow-800 mb-3">🧮 How Performance Metrics Are Calculated</h4>
                  <div className="space-y-4 text-sm">
                    <div>
                      <strong className="text-yellow-800">Cost Savings Calculation:</strong>
                      <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-xs">
                        <div>Traditional System Grid Use = max(0, 4.5 kWh - (Generation × 65%))</div>
                        <div>GAIFARE System Grid Use = max(0, Actual Use - (Generation × 95%))</div>
                        <div>Savings = (Traditional Use - GAIFARE Use) × Grid Price</div>
                      </div>
                    </div>
                    <div>
                      <strong className="text-yellow-800">CO₂ Reduction:</strong>
                      <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-xs">
                        <div>Energy Saved × 0.85 lbs CO₂/kWh (US grid average)</div>
                        <div>Source: EPA eGRID 2022 national emissions factor</div>
                      </div>
                    </div>
                    <div>
                      <strong className="text-yellow-800">Social Cost of Carbon:</strong>
                      <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-xs">
                        <div>(CO₂ Reduced ÷ 2000 lbs/ton) × $185/ton CO₂</div>
                        <div>Based on EPA's 2023 Social Cost of Carbon estimate</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time System Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-3">⚡ Current Energy System Status</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="bg-white p-2 rounded text-center">
                      <div className="font-bold text-yellow-600">Solar</div>
                      <div>{energyData.solarGeneration.toFixed(1)} kW</div>
                      <div className="text-gray-500">
                        {energyData.solarGeneration > 5 ? "Peak" : energyData.solarGeneration > 2 ? "Good" : "Low"}
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded text-center">
                      <div className="font-bold text-blue-600">Wind</div>
                      <div>{energyData.windGeneration.toFixed(1)} kW</div>
                      <div className="text-gray-500">
                        {energyData.windGeneration > 4 ? "Strong" : energyData.windGeneration > 2 ? "Steady" : "Light"}
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded text-center">
                      <div className="font-bold text-green-600">Battery</div>
                      <div>{energyData.batteryLevel.toFixed(0)}%</div>
                      <div className="text-gray-500">
                        {energyData.batteryLevel > 60 ? "Good" : energyData.batteryLevel > 30 ? "Fair" : "Low"}
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded text-center">
                      <div className="font-bold text-gray-600">Grid</div>
                      <div>${energyData.gridPrice.toFixed(3)}/kWh</div>
                      <div className="text-gray-500">
                        {new Date().getHours() >= 16 && new Date().getHours() <= 21 ? "Peak" : 
                         new Date().getHours() >= 6 && new Date().getHours() <= 16 ? "Mid" : "Off-Peak"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GAIFAREDemo;