import React, { useState, useEffect, useRef } from 'react';
import { Battery, Home, Sun, Wind, Zap, Car, Settings, TrendingUp, Brain, Wifi, AlertTriangle } from 'lucide-react';

const GAIFAREDemo = () => {
  const [time, setTime] = useState(new Date());
  const [systemStartTime] = useState(new Date());
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

  const [agents, setAgents] = useState([
    { id: 'home', name: 'Smart Home Agent', status: 'active', priority: 'comfort', consumption: 3.5 },
    { id: 'ev', name: 'EV Charging Agent', status: 'negotiating', priority: 'efficiency', consumption: 7.2 },
    { id: 'battery', name: 'Battery Storage Agent', status: 'optimizing', priority: 'grid-support', level: 75 },
    { id: 'solar', name: 'Solar Generation Agent', status: 'active', generation: 4.2 },
    { id: 'wind', name: 'Wind Generation Agent', status: 'active', generation: 2.8 }
  ]);

  const [negotiations, setNegotiations] = useState([]);
  const [aiDecisions, setAiDecisions] = useState([]);
  const [selectedNegotiation, setSelectedNegotiation] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);

  const totalGeneration = energyData.solarGeneration + energyData.windGeneration;
  const totalConsumption = energyData.homeConsumption + energyData.evCharging;
  const netFlow = totalGeneration - totalConsumption;

  // Current system efficiency metrics for calculations display
  const currentMetrics = {
    baselineEfficiency: 65,
    aiEfficiency: 95,
    baselineConsumption: 4.5,
    aiConsumption: totalConsumption,
    gridCO2Factor: 0.85, // lbs CO2 per kWh
    socialCostPerTon: 185, // EPA 2023 Social Cost of Carbon
    currentGridPrice: energyData.gridPrice
  };

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
          },
          { 
            message: 'Home requesting load shift from EV and Battery agents', 
            participants: 3,
            details: {
              title: 'Home Energy Priority Negotiation',
              scenario: 'Home systems detect high energy demand period and request load shifting from other agents.',
              agents: [
                { name: 'Home Agent', role: 'Coordinator', concern: 'Maintain comfort during dinner preparation and family time' },
                { name: 'EV Agent', role: 'Flexible load', concern: 'Continue charging but can adjust timing if needed' },
                { name: 'Battery Agent', role: 'Backup provider', concern: 'Support home needs while managing state of charge' }
              ],
              negotiation: [
                'Home Agent: "High demand detected: AC, oven, and lighting all active. Need load reduction"',
                'EV Agent: "Currently drawing 7.2 kWh. Can reduce to 3 kWh or pause for 2 hours"',
                'Battery Agent: "Can supplement 2 kWh to reduce grid draw, currently at 75% charge"',
                'Home Agent: "EV reduce to 3 kWh, Battery provide 2 kWh supplement for 90 minutes"'
              ],
              outcome: 'Load balanced without comfort impact, grid demand reduced by 4.2 kWh',
              impact: 'Comfort: Maintained | Grid load: -37% | Energy cost: -15%'
            }
          },
          { 
            message: 'Solar and Battery agents coordinating storage strategy', 
            participants: 2,
            details: {
              title: 'Solar-Battery Storage Coordination',
              scenario: 'Solar generation forecast shows high output period, coordinating optimal storage strategy.',
              agents: [
                { name: 'Solar Agent', role: 'Generator', concern: 'Maximize utilization of predicted high solar output' },
                { name: 'Battery Agent', role: 'Storage manager', concern: 'Optimize charging schedule based on demand forecasts' }
              ],
              negotiation: [
                'Solar Agent: "Weather forecast shows 6 hours of peak sun, expecting 8.5 kWh generation"',
                'Battery Agent: "Currently at 45% (6 kWh). Can store additional 7.5 kWh before full"',
                'Solar Agent: "Home using 3 kWh during day, 5.5 kWh available for storage"',
                'Battery Agent: "Perfect. Will charge to 85% (11.5 kWh total) for evening peak export"'
              ],
              outcome: 'Coordinated charging strategy maximizes solar utilization and prepares for evening revenue',
              impact: 'Solar utilization: 94% | Storage optimization: +$2.80 revenue potential'
            }
          },
          { 
            message: 'Multi-home microgrid formation negotiation', 
            participants: 4,
            details: {
              title: 'Neighborhood Microgrid Formation',
              scenario: 'Multiple homes coordinating to form temporary microgrid for mutual energy support.',
              agents: [
                { name: 'Home A Agent', role: 'Initiator', concern: 'High demand period, seeking energy support' },
                { name: 'Home B Agent', role: 'Contributor', concern: 'Excess solar generation, willing to share' },
                { name: 'Home C Agent', role: 'Storage provider', concern: 'Large battery, can provide grid stability' },
                { name: 'Home D Agent', role: 'Evaluator', concern: 'Moderate usage, considering participation benefits' }
              ],
              negotiation: [
                'Home A: "Experiencing 12 kWh demand spike, local grid strained"',
                'Home B: "Have 4 kWh excess solar, can share for next 3 hours"',
                'Home C: "20 kWh battery can provide 6 kWh and grid stabilization"',
                'Home D: "Will join if cost savings > 10% and we share maintenance benefits"'
              ],
              outcome: 'Temporary microgrid formed, sharing 10 kWh among 4 homes with 15% cost savings',
              impact: 'Cost savings: 15% | Grid independence: 3 hours | Community resilience: +25%'
            }
          },
          { 
            message: 'EV and Home agents negotiating charging priority', 
            participants: 2,
            details: {
              title: 'EV-Home Charging Priority Resolution',
              scenario: 'Limited available power requires negotiation between EV charging needs and home energy requirements.',
              agents: [
                { name: 'EV Agent', role: 'Mobile energy user', concern: 'Ensure sufficient range for tomorrow\'s 85-mile trip' },
                { name: 'Home Agent', role: 'Base load manager', concern: 'Maintain essential services and comfort systems' }
              ],
              negotiation: [
                'EV Agent: "Currently at 45% charge, need 65% minimum for tomorrow\'s long trip"',
                'Home Agent: "Limited 8 kWh available, also need power for water heater and HVAC"',
                'EV Agent: "Trip is critical. Can accept slow charge over 8 hours instead of fast charge"',
                'Home Agent: "Agreed. Allocate 5 kWh to EV slow charge, 3 kWh for home essentials"'
              ],
              outcome: 'Slow charging schedule ensures EV readiness while maintaining home comfort',
              impact: 'EV readiness: 100% | Home comfort: Maintained | Power optimization: Balanced'
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
            <p className="text-sm text-gray-500">System Time: {time.toLocaleTimeString()}</p>
            <p className="text-sm text-gray-500">
              Grid Price: ${energyData.gridPrice.toFixed(3)}/kWh 
              <span className="ml-2 text-xs">
                {new Date().getHours() >= 16 && new Date().getHours() <= 21 ? '(Peak)' :
                 new Date().getHours() >= 6 && new Date().getHours() <= 16 ? '(Mid-Peak)' : '(Off-Peak)'}
              </span>
            </p>
            <p className="text-xs text-gray-400 mb-3">
              *Prices update every 15 min (realistic market intervals)
            </p>
            
            <div className="border-t border-gray-200 pt-3">
              <div 
                className="text-sm font-semibold text-gray-700 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => setSelectedMetric('systemPerformance')}
              >
                <strong>GAIFARE System Performance:</strong>
                <span className="text-xs text-gray-500 ml-2">Click for comparison →</span>
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

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Energy Flow Diagram */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Zap className="mr-2 text-blue-600" />
              Live Energy Flow Network
            </h2>
            
            <div className="relative h-80 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-4 overflow-hidden">
              {/* Grid Connection */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gray-600 text-white p-3 rounded-lg text-center shadow-lg">
                  <div className="font-bold text-sm">⚡ GRID</div>
                  <div className="text-xs">${energyData.gridPrice.toFixed(3)}/kWh</div>
                  <div className="text-xs">{netFlow < 0 ? 'Import' : 'Export'}</div>
                </div>
              </div>

              {/* Solar Panel */}
              <div className="absolute top-4 right-4">
                <div className="bg-yellow-500 text-white p-3 rounded-lg text-center shadow-lg">
                  <Sun size={20} className="mx-auto mb-1" />
                  <div className="font-bold text-sm">SOLAR</div>
                  <div className="text-xs">{energyData.solarGeneration.toFixed(1)} kW</div>
                </div>
              </div>

              {/* Wind Turbine */}
              <div className="absolute top-4 left-4">
                <div className="bg-blue-500 text-white p-3 rounded-lg text-center shadow-lg">
                  <Wind size={20} className="mx-auto mb-1" />
                  <div className="font-bold text-sm">WIND</div>
                  <div className="text-xs">{energyData.windGeneration.toFixed(1)} kW</div>
                </div>
              </div>

              {/* Battery Storage - Central Hub */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className={`p-4 rounded-lg text-center shadow-lg text-white ${
                  energyData.batteryLevel > 60 ? 'bg-green-500' : 
                  energyData.batteryLevel > 30 ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  <Battery size={24} className="mx-auto mb-1" />
                  <div className="font-bold text-sm">BATTERY</div>
                  <div className="text-xs">{energyData.batteryLevel.toFixed(0)}%</div>
                  <div className="text-xs">{netFlow > 0 && energyData.batteryLevel < 90 ? 'Charging' : 
                    energyData.batteryLevel > 60 ? 'Ready' : 'Discharging'}</div>
                </div>
              </div>

              {/* Home */}
              <div className="absolute bottom-4 left-4">
                <div className="bg-purple-600 text-white p-3 rounded-lg text-center shadow-lg">
                  <Home size={20} className="mx-auto mb-1" />
                  <div className="font-bold text-sm">HOME</div>
                  <div className="text-xs">{energyData.homeConsumption.toFixed(1)} kW</div>
                </div>
              </div>

              {/* EV Charger */}
              <div className="absolute bottom-4 right-4">
                <div className="bg-green-600 text-white p-3 rounded-lg text-center shadow-lg">
                  <Car size={20} className="mx-auto mb-1" />
                  <div className="font-bold text-sm">EV</div>
                  <div className="text-xs">{energyData.evCharging.toFixed(1)} kW</div>
                </div>
              </div>

              {/* Energy Flow Lines - All connected through Battery Hub */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Define arrow markers for different flow types */}
                <defs>
                  <marker id="arrow-solar" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#eab308" />
                  </marker>
                  <marker id="arrow-wind" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
                  </marker>
                  <marker id="arrow-home" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#9333ea" />
                  </marker>
                  <marker id="arrow-ev" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#16a34a" />
                  </marker>
                  <marker id="arrow-import" markerWidth="12" markerHeight="12" refX="11" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L11,3 z" fill="#ef4444" />
                  </marker>
                  <marker id="arrow-export" markerWidth="12" markerHeight="12" refX="11" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L11,3 z" fill="#10b981" />
                  </marker>
                </defs>

                {/* Grid to Battery connection */}
                <line 
                  x1="50%" y1="80" x2="50%" y2="50%" 
                  stroke="#6b7280" strokeWidth="2" strokeDasharray="2,2"
                />

                {/* Solar to Battery flow */}
                {energyData.solarGeneration > 0 && (
                  <>
                    <line 
                      x1="85%" y1="80" x2="60%" y2="45%" 
                      stroke="#eab308" strokeWidth="3" strokeDasharray="5,5"
                      className="animate-pulse"
                      markerEnd="url(#arrow-solar)"
                    />
                    <text x="75%" y="35%" fill="#eab308" fontSize="10" className="font-bold">
                      {energyData.solarGeneration.toFixed(1)} kW
                    </text>
                    {/* Animated flow circles for solar */}
                    <circle r="3" fill="#eab308" opacity="0.8">
                      <animateMotion dur="2s" repeatCount="indefinite">
                        <path d="M 85% 80 L 60% 45%" />
                      </animateMotion>
                    </circle>
                    <circle r="2" fill="#fbbf24" opacity="0.6">
                      <animateMotion dur="2s" repeatCount="indefinite" begin="0.5s">
                        <path d="M 85% 80 L 60% 45%" />
                      </animateMotion>
                    </circle>
                  </>
                )}

                {/* Wind to Battery flow */}
                {energyData.windGeneration > 0 && (
                  <>
                    <line 
                      x1="15%" y1="80" x2="40%" y2="45%" 
                      stroke="#3b82f6" strokeWidth="3" strokeDasharray="5,5"
                      className="animate-pulse"
                      markerEnd="url(#arrow-wind)"
                    />
                    <text x="20%" y="35%" fill="#3b82f6" fontSize="10" className="font-bold">
                      {energyData.windGeneration.toFixed(1)} kW
                    </text>
                    {/* Animated flow circles for wind */}
                    <circle r="3" fill="#3b82f6" opacity="0.8">
                      <animateMotion dur="1.8s" repeatCount="indefinite">
                        <path d="M 15% 80 L 40% 45%" />
                      </animateMotion>
                    </circle>
                    <circle r="2" fill="#60a5fa" opacity="0.6">
                      <animateMotion dur="1.8s" repeatCount="indefinite" begin="0.6s">
                        <path d="M 15% 80 L 40% 45%" />
                      </animateMotion>
                    </circle>
                  </>
                )}

                {/* Battery to Home flow */}
                {energyData.homeConsumption > 0 && (
                  <>
                    <line 
                      x1="40%" y1="55%" x2="15%" y2="80%" 
                      stroke="#9333ea" strokeWidth="3" strokeDasharray="5,5"
                      className="animate-pulse"
                      markerEnd="url(#arrow-home)"
                    />
                    <text x="22%" y="75%" fill="#9333ea" fontSize="10" className="font-bold">
                      {Math.min(energyData.homeConsumption, totalGeneration * 0.4).toFixed(1)} kW
                    </text>
                    {/* Animated flow circles for home */}
                    <circle r="3" fill="#9333ea" opacity="0.8">
                      <animateMotion dur="2.2s" repeatCount="indefinite">
                        <path d="M 40% 55% L 15% 80%" />
                      </animateMotion>
                    </circle>
                    <circle r="2" fill="#c084fc" opacity="0.6">
                      <animateMotion dur="2.2s" repeatCount="indefinite" begin="0.7s">
                        <path d="M 40% 55% L 15% 80%" />
                      </animateMotion>
                    </circle>
                  </>
                )}

                {/* Battery to EV flow */}
                {energyData.evCharging > 0 && (
                  <>
                    <line 
                      x1="60%" y1="55%" x2="85%" y2="80%" 
                      stroke="#16a34a" strokeWidth="3" strokeDasharray="5,5"
                      className="animate-pulse"
                      markerEnd="url(#arrow-ev)"
                    />
                    <text x="75%" y="75%" fill="#16a34a" fontSize="10" className="font-bold">
                      {energyData.evCharging.toFixed(1)} kW
                    </text>
                    {/* Animated flow circles for EV */}
                    <circle r="3" fill="#16a34a" opacity="0.8">
                      <animateMotion dur="1.5s" repeatCount="indefinite">
                        <path d="M 60% 55% L 85% 80%" />
                      </animateMotion>
                    </circle>
                    <circle r="2" fill="#4ade80" opacity="0.6">
                      <animateMotion dur="1.5s" repeatCount="indefinite" begin="0.3s">
                        <path d="M 60% 55% L 85% 80%" />
                      </animateMotion>
                    </circle>
                  </>
                )}

                {/* Grid Import flow (when net is negative) */}
                {netFlow < 0 && (
                  <>
                    <line 
                      x1="50%" y1="80" x2="50%" y2="45%" 
                      stroke="#ef4444" strokeWidth="4" strokeDasharray="8,8"
                      className="animate-pulse"
                      markerEnd="url(#arrow-import)"
                    />
                    <text x="52%" y="35%" fill="#ef4444" fontSize="12" className="font-bold">
                      IMPORT {Math.abs(netFlow).toFixed(1)} kW
                    </text>
                    {/* Animated flow circles for grid import */}
                    <circle r="4" fill="#ef4444" opacity="0.8">
                      <animateMotion dur="1.2s" repeatCount="indefinite">
                        <path d="M 50% 80 L 50% 45%" />
                      </animateMotion>
                    </circle>
                    <circle r="3" fill="#f87171" opacity="0.6">
                      <animateMotion dur="1.2s" repeatCount="indefinite" begin="0.4s">
                        <path d="M 50% 80 L 50% 45%" />
                      </animateMotion>
                    </circle>
                    <circle r="2" fill="#fca5a5" opacity="0.4">
                      <animateMotion dur="1.2s" repeatCount="indefinite" begin="0.8s">
                        <path d="M 50% 80 L 50% 45%" />
                      </animateMotion>
                    </circle>
                  </>
                )}

                {/* Grid Export flow (when net is positive) */}
                {netFlow > 0 && (
                  <>
                    <line 
                      x1="50%" y1="45%" x2="50%" y2="80" 
                      stroke="#10b981" strokeWidth="4" strokeDasharray="8,8"
                      className="animate-pulse"
                      markerEnd="url(#arrow-export)"
                    />
                    <text x="52%" y="35%" fill="#10b981" fontSize="12" className="font-bold">
                      EXPORT {netFlow.toFixed(1)} kW
                    </text>
                    {/* Animated flow circles for grid export */}
                    <circle r="4" fill="#10b981" opacity="0.8">
                      <animateMotion dur="1.2s" repeatCount="indefinite">
                        <path d="M 50% 45% L 50% 80%" />
                      </animateMotion>
                    </circle>
                    <circle r="3" fill="#34d399" opacity="0.6">
                      <animateMotion dur="1.2s" repeatCount="indefinite" begin="0.4s">
                        <path d="M 50% 45% L 50% 80/" />
                      </animateMotion>
                    </circle>
                    <circle r="2" fill="#6ee7b7" opacity="0.4">
                      <animateMotion dur="1.2s" repeatCount="indefinite" begin="0.8s">
                        <path d="M 50% 45% L 50% 80/" />
                      </animateMotion>
                    </circle>
                  </>
                )}

                {/* Connection lines (always visible) - lighter to not interfere with flows */}
                <line x1="50%" y1="80" x2="50%" y2="45%" stroke="#e5e7eb" strokeWidth="1" opacity="0.3" />
                <line x1="85%" y1="80" x2="60%" y2="45%" stroke="#e5e7eb" strokeWidth="1" opacity="0.3" />
                <line x1="15%" y1="80" x2="40%" y2="45%" stroke="#e5e7eb" strokeWidth="1" opacity="0.3" />
                <line x1="40%" y1="55%" x2="15%" y2="80%" stroke="#e5e7eb" strokeWidth="1" opacity="0.3" />
                <line x1="60%" y1="55%" x2="85%" y2="80%" stroke="#e5e7eb" strokeWidth="1" opacity="0.3" />
              </svg>

              {/* GAIFARE AI Coordination Indicator */}
              <div className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-8">
                <div className="bg-white bg-opacity-95 p-2 rounded-full shadow-lg border-2 border-blue-400">
                  <Brain size={20} className="text-blue-600 animate-pulse" />
                </div>
                <div className="text-center mt-1">
                  <div className="text-xs font-bold text-blue-700">GAIFARE</div>
                  <div className="text-xs text-gray-600">AI Control</div>
                </div>
              </div>
            </div>

            {/* Flow Legend */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-1 bg-yellow-500 mr-2"></div>
                <span>Solar Flow</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-1 bg-blue-500 mr-2"></div>
                <span>Wind Flow</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-1 bg-green-500 mr-2"></div>
                <span>Battery Flow</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-1 bg-red-500 mr-2"></div>
                <span>Grid Import</span>
              </div>
            </div>
          </div>

          {/* Energy Flow Data */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="mr-2 text-green-600" />
              Energy Balance
            </h2>
            
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-800 mb-2">Generation</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>☀️ Solar:</span>
                    <span className="font-bold text-yellow-600">{energyData.solarGeneration.toFixed(1)} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span>💨 Wind:</span>
                    <span className="font-bold text-blue-600">{energyData.windGeneration.toFixed(1)} kW</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span>Total:</span>
                    <span className="font-bold text-green-600">{totalGeneration.toFixed(1)} kW</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-red-50 rounded-lg">
                <div className="font-medium text-red-800 mb-2">Consumption</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>🏠 Home:</span>
                    <span className="font-bold text-purple-600">{energyData.homeConsumption.toFixed(1)} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🚗 EV:</span>
                    <span className="font-bold text-green-600">{energyData.evCharging.toFixed(1)} kW</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span>Total:</span>
                    <span className="font-bold text-red-600">{totalConsumption.toFixed(1)} kW</span>
                  </div>
                </div>
              </div>

              <div className={`p-3 rounded-lg ${netFlow >= 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <div className={`font-medium mb-2 ${netFlow >= 0 ? 'text-green-800' : 'text-yellow-800'}`}>
                  {netFlow >= 0 ? '📤 Grid Export' : '📥 Grid Import'}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Net Flow:</span>
                    <span className={`font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {netFlow >= 0 ? '+' : ''}{netFlow.toFixed(1)} kW
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Battery:</span>
                    <span className={`font-bold ${
                      energyData.batteryLevel > 60 ? 'text-green-600' : 
                      energyData.batteryLevel > 30 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {energyData.batteryLevel.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Agents Panel */}
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
              <TrendingUp className="mr-2 text-green-600" />
              AI Optimization Insights
            </h2>
            
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="font-medium text-green-800">Energy Efficiency</div>
                <div className="text-sm text-green-700">
                  Current system efficiency: 94.2% (+2.3% from AI optimization)
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="font-medium text-blue-800">Predictive Forecast</div>
                <div className="text-sm text-blue-700">
                  Next 4 hours: High solar generation expected. 
                  Recommending battery charge completion.
                </div>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <div className="font-medium text-purple-800">Grid Interaction</div>
                <div className="text-sm text-purple-700">
                  Peak price period at 6 PM. Preparing for grid export 
                  (+$12.40 projected revenue).
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Negotiations and Decisions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-md">
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

          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Brain className="mr-2 text-indigo-600" />
              AI Decision Log
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

        {/* Metric Calculation Modal */}
        {selectedMetric && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] flex flex-col m-4">
              <div className="flex justify-between items-center p-4 pb-3 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedMetric === 'systemPerformance' && '🚀 GAIFARE vs Traditional System Comparison'}
                  {selectedMetric === 'costSavings' && '💰 Cost Savings Calculation'}
                  {selectedMetric === 'energyOptimized' && '⚡ Energy Optimization Calculation'}
                  {selectedMetric === 'co2Reduced' && '🌱 CO₂ Reduction Calculation'}
                  {selectedMetric === 'socialCost' && '💚 Social Cost of Carbon Calculation'}
                  {selectedMetric === 'gridSupport' && '🏘️ Grid Support Calculation'}
                </h2>
                <button 
                  onClick={() => setSelectedMetric(null)}
                  className="text-gray-500 hover:text-white hover:bg-red-500 w-8 h-8 flex items-center justify-center rounded-full text-xl font-bold flex-shrink-0 transition-colors"
                  title="Close"
                >
                  ×
                </button>
              </div>
              
              <div className="overflow-y-auto flex-1 p-4">
                {selectedMetric === 'systemPerformance' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                      <h3 className="font-bold text-gray-800 mb-3">GAIFARE vs Traditional System Performance Comparison</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                          <h4 className="font-semibold text-red-800 mb-2">❌ Traditional "Dumb" System</h4>
                          <ul className="text-sm text-red-700 space-y-1">
                            <li>• <strong>65% renewable efficiency</strong> - Poor utilization</li>
                            <li>• <strong>High grid dependency</strong> - No load optimization</li>
                            <li>• <strong>35% energy waste</strong> - No storage coordination</li>
                            <li>• <strong>Fixed consumption patterns</strong> - No market awareness</li>
                            <li>• <strong>No device coordination</strong> - Independent operation</li>
                            <li>• <strong>Peak-time grid strain</strong> - No community support</li>
                          </ul>
                        </div>
                        
                        <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                          <h4 className="font-semibold text-green-800 mb-2">✅ GAIFARE AI System</h4>
                          <ul className="text-sm text-green-700 space-y-1">
                            <li>• <strong>95% renewable efficiency</strong> - AI-optimized utilization</li>
                            <li>• <strong>30% less grid dependency</strong> - Smart load scheduling</li>
                            <li>• <strong>85% waste reduction</strong> - Intelligent storage management</li>
                            <li>• <strong>Real-time price optimization</strong> - Market-aware decisions</li>
                            <li>• <strong>Multi-agent coordination</strong> - Collaborative operation</li>
                            <li>• <strong>Peak-time grid support</strong> - Community stability aid</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-3 rounded">
                        <h4 className="font-semibold text-blue-800 mb-2">🚀 Performance Improvements</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">+46%</div>
                            <div className="text-blue-700">Efficiency Gain</div>
                            <div className="text-xs text-gray-600">(65% → 95%)</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">-85%</div>
                            <div className="text-blue-700">Energy Waste</div>
                            <div className="text-xs text-gray-600">(35% → 5%)</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">-30%</div>
                            <div className="text-blue-700">Grid Dependency</div>
                            <div className="text-xs text-gray-600">Smart scheduling</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                        <div className="text-sm text-yellow-800">
                          <strong>Key Differentiator:</strong> GAIFARE's multi-agent AI system enables devices to negotiate, 
                          coordinate, and optimize automatically - something impossible with traditional systems. This results 
                          in dramatic efficiency gains, cost savings, and environmental benefits while supporting grid stability.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMetric === 'costSavings' && (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-bold text-green-800 mb-2">How Cost Savings Are Calculated</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Traditional System Grid Usage:</strong></div>
                        <div className="ml-4 font-mono bg-gray-100 p-2 rounded">
                          Baseline Grid Use = max(0, {currentMetrics.baselineConsumption} kWh - ({totalGeneration.toFixed(1)} kWh × {currentMetrics.baselineEfficiency}%))
                          <br />= max(0, {currentMetrics.baselineConsumption} - {(totalGeneration * 0.65).toFixed(1)})
                          <br />= {Math.max(0, currentMetrics.baselineConsumption - totalGeneration * 0.65).toFixed(2)} kWh
                        </div>
                        
                        <div><strong>GAIFARE AI System Grid Usage:</strong></div>
                        <div className="ml-4 font-mono bg-gray-100 p-2 rounded">
                          AI Grid Use = max(0, {totalConsumption.toFixed(1)} kWh - ({totalGeneration.toFixed(1)} kWh × {currentMetrics.aiEfficiency}%))
                          <br />= max(0, {totalConsumption.toFixed(1)} - {(totalGeneration * 0.95).toFixed(1)})
                          <br />= {Math.max(0, totalConsumption - totalGeneration * 0.95).toFixed(2)} kWh
                        </div>
                        
                        <div><strong>Energy Saved Per Hour:</strong></div>
                        <div className="ml-4 font-mono bg-gray-100 p-2 rounded">
                          Energy Saved = {Math.max(0, currentMetrics.baselineConsumption - totalGeneration * 0.65).toFixed(2)} - {Math.max(0, totalConsumption - totalGeneration * 0.95).toFixed(2)}
                          <br />= {(Math.max(0, currentMetrics.baselineConsumption - totalGeneration * 0.65) - Math.max(0, totalConsumption - totalGeneration * 0.95)).toFixed(2)} kWh
                        </div>
                        
                        <div><strong>Cost Savings:</strong></div>
                        <div className="ml-4 font-mono bg-gray-100 p-2 rounded">
                          Cost Saved = Energy Saved × Current Grid Price
                          <br />= {(Math.max(0, currentMetrics.baselineConsumption - totalGeneration * 0.65) - Math.max(0, totalConsumption - totalGeneration * 0.95)).toFixed(2)} kWh × ${currentMetrics.currentGridPrice.toFixed(3)}/kWh
                          <br />= ${((Math.max(0, currentMetrics.baselineConsumption - totalGeneration * 0.65) - Math.max(0, totalConsumption - totalGeneration * 0.95)) * currentMetrics.currentGridPrice).toFixed(3)}/hour
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-green-100 rounded text-sm">
                        <strong>Current Cumulative Savings: ${cumulativeStats.totalSavings.toFixed(2)}</strong>
                        <br />This accumulates every 2 seconds (accelerated 15x for demo)
                      </div>
                    </div>
                  </div>
                )}

                {selectedMetric === 'energyOptimized' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-bold text-blue-800 mb-2">How Energy Optimization Is Calculated</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Traditional System Efficiency:</strong> {currentMetrics.baselineEfficiency}%</div>
                        <div><strong>GAIFARE AI System Efficiency:</strong> {currentMetrics.aiEfficiency}%</div>
                        
                        <div className="mt-3"><strong>Energy Waste Reduction:</strong></div>
                        <div className="ml-4 font-mono bg-gray-100 p-2 rounded">
                          Traditional Waste = Generation × (100% - {currentMetrics.baselineEfficiency}%) if excess
                          <br />= {totalGeneration.toFixed(1)} kWh × 35% = {(totalGeneration * 0.35).toFixed(1)} kWh wasted
                          <br /><br />
                          AI Waste = Generation × (100% - {currentMetrics.aiEfficiency}%) if excess
                          <br />= {totalGeneration.toFixed(1)} kWh × 5% = {(totalGeneration * 0.05).toFixed(1)} kWh wasted
                        </div>
                        
                        <div><strong>Total Energy Optimized:</strong></div>
                        <div className="ml-4 font-mono bg-gray-100 p-2 rounded">
                          Optimized = (Grid Energy Saved) + (Waste Reduced)
                          <br />= Efficiency improvements + Storage management + Load scheduling
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-blue-100 rounded text-sm">
                        <strong>Current Total Optimized: {cumulativeStats.energyOptimized.toFixed(1)} kWh</strong>
                        <br />Represents energy that would have been lost or inefficiently used
                      </div>
                    </div>
                  </div>
                )}

                {selectedMetric === 'co2Reduced' && (
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-bold text-purple-800 mb-2">How CO₂ Reduction Is Calculated</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>US Grid CO₂ Emissions Factor:</strong> {currentMetrics.gridCO2Factor} lbs CO₂ per kWh</div>
                        <div className="text-xs text-gray-600">Source: EPA eGRID 2022 national average</div>
                        
                        <div className="mt-3"><strong>CO₂ Avoided Calculation:</strong></div>
                        <div className="ml-4 font-mono bg-gray-100 p-2 rounded">
                          CO₂ Reduced = Energy Saved from Grid × CO₂ Factor
                          <br />= Energy not drawn from fossil fuel grid
                          <br />= {cumulativeStats.energyOptimized.toFixed(1)} kWh × {currentMetrics.gridCO2Factor} lbs/kWh
                          <br />= {(cumulativeStats.energyOptimized * currentMetrics.gridCO2Factor).toFixed(1)} lbs CO₂
                        </div>
                        
                        <div><strong>Conversion to Tons:</strong></div>
                        <div className="ml-4 font-mono bg-gray-100 p-2 rounded">
                          CO₂ in Tons = {cumulativeStats.co2Reduced.toFixed(1)} lbs ÷ 2000 lbs/ton
                          <br />= {(cumulativeStats.co2Reduced / 2000).toFixed(4)} tons
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-purple-100 rounded text-sm">
                        <strong>Environmental Impact:</strong>
                        <br />• Equivalent to planting {(cumulativeStats.co2Reduced / 48).toFixed(1)} tree seedlings
                        <br />• Removes {cumulativeStats.co2Reduced.toFixed(1)} lbs of CO₂ from atmosphere
                      </div>
                    </div>
                  </div>
                )}

                {selectedMetric === 'socialCost' && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-bold text-yellow-800 mb-2">Social Cost of Carbon Calculation</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>EPA Social Cost of Carbon (2023):</strong> $185 per ton CO₂</div>
                        <div className="text-xs text-gray-600">Represents economic damage from climate change per ton of CO₂</div>
                        
                        <div className="mt-3"><strong>Calculation:</strong></div>
                        <div className="ml-4 font-mono bg-gray-100 p-2 rounded">
                          Social Cost Saved = CO₂ Tons Avoided × Social Cost per Ton
                          <br />= {(cumulativeStats.co2Reduced / 2000).toFixed(4)} tons × $185/ton
                          <br />= ${((cumulativeStats.co2Reduced / 2000) * 185).toFixed(2)}
                        </div>
                        
                        <div><strong>What This Represents:</strong></div>
                        <ul className="ml-4 text-xs space-y-1">
                          <li>• Economic damages avoided from climate change</li>
                          <li>• Healthcare costs prevented from air pollution</li>
                          <li>• Agricultural productivity preserved</li>
                          <li>• Infrastructure damage reduction</li>
                          <li>• Ecosystem services maintained</li>
                        </ul>
                      </div>
                      <div className="mt-3 p-2 bg-yellow-100 rounded text-sm">
                        <strong>Societal Benefit: ${(cumulativeStats.socialCostSaved || 0).toFixed(2)}</strong>
                        <br />This is the economic value your energy system provides to society
                      </div>
                    </div>
                  </div>
                )}

                {selectedMetric === 'gridSupport' && (
                  <div className="space-y-4">
                    <div className="bg-cyan-50 p-4 rounded-lg">
                      <h3 className="font-bold text-cyan-800 mb-2">Grid Support Contribution Calculation</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Current Net Flow:</strong> {netFlow.toFixed(1)} kWh ({netFlow >= 0 ? 'Exporting' : 'Importing'})</div>
                        <div><strong>Current Time:</strong> {time.toLocaleTimeString()}</div>
                        
                        <div className="mt-3"><strong>Peak Hour Bonus (4-9 PM):</strong></div>
                        <div className="ml-4 font-mono bg-gray-100 p-2 rounded">
                          {new Date().getHours() >= 16 && new Date().getHours() <= 21 ? 
                            `Peak Time: Export value × 1.2 multiplier
                            ${Math.abs(netFlow).toFixed(1)} kWh × 1.2 = ${(Math.abs(netFlow) * 1.2).toFixed(1)} kWh equivalent contribution` :
                            `Off-Peak: Export value × 0.3 multiplier
                            ${Math.abs(netFlow).toFixed(1)} kWh × 0.3 = ${(Math.abs(netFlow) * 0.3).toFixed(1)} kWh equivalent contribution`
                          }
                        </div>
                        
                        <div><strong>Grid Stabilization Benefits:</strong></div>
                        <ul className="ml-4 text-xs space-y-1">
                          <li>• Reduces need for expensive peaker plants</li>
                          <li>• Improves local grid voltage stability</li>
                          <li>• Decreases transmission losses</li>
                          <li>• Supports renewable energy integration</li>
                          <li>• Enhances community energy resilience</li>
                        </ul>
                      </div>
                      <div className="mt-3 p-2 bg-cyan-100 rounded text-sm">
                        <strong>Total Grid Support: {cumulativeStats.gridStabilityContributions.toFixed(1)} kWh</strong>
                        <br />Your system helps stabilize the grid during high-demand periods
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Negotiation Details Modal */}
        {selectedNegotiation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[70vh] flex flex-col m-4">
              {/* Fixed Header with Close Button */}
              <div className="flex justify-between items-center p-4 pb-3 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-lg font-bold text-gray-800 pr-2">{selectedNegotiation.details.title}</h2>
                <button 
                  onClick={() => setSelectedNegotiation(null)}
                  className="text-gray-500 hover:text-white hover:bg-red-500 w-8 h-8 flex items-center justify-center rounded-full text-xl font-bold flex-shrink-0 transition-colors"
                  title="Close"
                >
                  ×
                </button>
              </div>
              
              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 p-4 pt-3">
                <div className="mb-4">
                  <p className="text-gray-600 text-sm mb-2">{selectedNegotiation.details.scenario}</p>
                  <div className="text-xs text-gray-500">
                    {selectedNegotiation.timestamp.toLocaleString()} | {selectedNegotiation.participants} participating agents
                  </div>
                </div>

                {/* Participants */}
                <div className="mb-4">
                  <h3 className="text-base font-semibold mb-2 flex items-center">
                    <Settings className="mr-1 text-blue-600" size={16} />
                    AI Agents Involved
                  </h3>
                  <div className="space-y-2">
                    {selectedNegotiation.details.agents.map((agent, index) => (
                      <div key={index} className="bg-blue-50 p-2 rounded text-xs">
                        <div className="font-medium text-blue-800">{agent.name} ({agent.role})</div>
                        <div className="text-gray-700">{agent.concern}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Negotiation Flow */}
                <div className="mb-4">
                  <h3 className="text-base font-semibold mb-2 flex items-center">
                    <Wifi className="mr-1 text-orange-600" size={16} />
                    Negotiation Flow
                  </h3>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="space-y-1">
                      {selectedNegotiation.details.negotiation.map((step, index) => (
                        <div key={index} className="flex items-start">
                          <div className="bg-orange-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="bg-white p-1.5 rounded border-l-2 border-orange-300 flex-1">
                            <div className="text-xs">{step}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Outcome and Impact */}
                <div className="space-y-3">
                  <div className="bg-green-50 p-2 rounded">
                    <h3 className="text-sm font-semibold mb-1 flex items-center text-green-800">
                      <TrendingUp className="mr-1" size={14} />
                      Outcome
                    </h3>
                    <p className="text-xs text-green-700">{selectedNegotiation.details.outcome}</p>
                  </div>
                  
                  <div className="bg-purple-50 p-2 rounded">
                    <h3 className="text-sm font-semibold mb-1 flex items-center text-purple-800">
                      <Brain className="mr-1" size={14} />
                      Impact
                    </h3>
                    <p className="text-xs text-purple-700 font-mono">{selectedNegotiation.details.impact}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Information */}
        <div className="mt-8 bg-gray-800 text-white rounded-lg p-6">
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
    </div>
  );
};

export default GAIFAREDemo;