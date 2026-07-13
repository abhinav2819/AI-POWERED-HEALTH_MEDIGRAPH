import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { metricsApi, analyticsApi, userApi } from '@/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DASHBOARD } from '@/constants/testIds';
import { formatMetricValue, getMetricIcon, getMetricColor } from '@/utils/helpers';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Footprints, HeartPulse, Moon, Flame, TrendingUp, Plus } from 'lucide-react';
import { toast } from 'sonner';

// Extract MetricCard component outside to avoid re-creation on each render
const MetricCard = ({ type, icon: Icon, title, color, value, data, target }) => {
  return (
    <Card className="p-6 border-[#E5E7E1] rounded-2xl hover:shadow-md transition-all duration-200 hover:-translate-y-1" data-testid={`${DASHBOARD.metricsCard}-${type}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-5 h-5" style={{ color }} />
            <h3 className="text-sm font-medium text-[#666] uppercase tracking-wide">{title}</h3>
          </div>
          <p className="text-3xl font-outfit font-semibold text-[#1A1F16]">
            {formatMetricValue(type, value)}
          </p>
          {target && (
            <p className="text-xs text-[#666] mt-1">
              Goal: {formatMetricValue(type, target)}
            </p>
          )}
        </div>
      </div>
      {data.length > 0 && (
        <div className="h-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={2}
                fill={`url(#gradient-${type})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

const Dashboard = () => {
  const [metrics, setMetrics] = useState([]);
  const [bmi, setBmi] = useState(null);
  const [progress, setProgress] = useState(null);
  const [goals, setGoals] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      const [metricsRes, bmiRes, progressRes, goalsRes] = await Promise.all([
        metricsApi.getAllMetrics(),
        analyticsApi.getBMI().catch(() => null),
        analyticsApi.getProgress().catch(() => null),
        userApi.getGoals().catch(() => null)
      ]);

      setMetrics(metricsRes.data || []);
      setBmi(bmiRes?.data);
      setProgress(progressRes?.data);
      setGoals(goalsRes?.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getLatestMetricValue = (type) => {
    const typeMetrics = metrics.filter(m => m.metricType === type);
    if (typeMetrics.length === 0) return 0;
    return typeMetrics[typeMetrics.length - 1].value;
  };

  const getMetricChartData = (type) => {
    return metrics
      .filter(m => m.metricType === type)
      .slice(-7)
      .map(m => ({
        date: new Date(m.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: m.value
      }));
  };

  const renderMetricCard = (type, icon, title, color) => {
    const value = getLatestMetricValue(type);
    const data = getMetricChartData(type);
    const target = goals?.[`target${type.charAt(0) + type.slice(1).toLowerCase()}`];
    
    return (
      <MetricCard
        key={type}
        type={type}
        icon={icon}
        title={title}
        color={color}
        value={value}
        data={data}
        target={target}
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDF9] flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-[#8A9A5B] animate-pulse mx-auto mb-4" />
          <p className="text-[#666]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDF9]" data-testid={DASHBOARD.container}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl sm:text-5xl font-outfit font-semibold text-[#1A1F16] tracking-tight">
              Your Health Dashboard
            </h1>
            <p className="text-base text-[#666] mt-2">Track your progress and stay on top of your goals</p>
          </div>
          <Button
            data-testid={DASHBOARD.addMetricBtn}
            onClick={() => navigate('/metrics/add')}
            className="rounded-full bg-[#8A9A5B] hover:bg-[#7a8a4b] text-white transition-all duration-200 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Metric
          </Button>
        </div>

        {/* BMI Card */}
        {bmi && (
          <Card className="p-6 border-[#E5E7E1] rounded-2xl bg-gradient-to-br from-[#8A9A5B]/10 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-[#666] uppercase tracking-wide mb-1">Your BMI</h3>
                <p className="text-4xl font-outfit font-semibold text-[#1A1F16]">{bmi.bmi?.toFixed(1)}</p>
                <p className="text-sm text-[#666] mt-1">{bmi.category}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-[#8A9A5B]" />
            </div>
          </Card>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderMetricCard('STEPS', Footprints, 'Steps', '#8A9A5B')}
          {renderMetricCard('HEART_RATE', HeartPulse, 'Heart Rate', '#E2725B')}
          {renderMetricCard('SLEEP', Moon, 'Sleep', '#6B7280')}
          {renderMetricCard('CALORIES', Flame, 'Calories', '#D97706')}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/health-analysis')}
            className="h-24 rounded-2xl border-[#E5E7E1] hover:border-[#8A9A5B] transition-all duration-200"
          >
            <div className="text-center">
              <Activity className="w-6 h-6 mx-auto mb-2 text-[#8A9A5B]" />
              <p className="font-medium text-[#1A1F16]">Health Analysis</p>
            </div>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/ai-coach')}
            className="h-24 rounded-2xl border-[#E5E7E1] hover:border-[#8A9A5B] transition-all duration-200"
          >
            <div className="text-center">
              <HeartPulse className="w-6 h-6 mx-auto mb-2 text-[#8A9A5B]" />
              <p className="font-medium text-[#1A1F16]">AI Health Coach</p>
            </div>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/store')}
            className="h-24 rounded-2xl border-[#E5E7E1] hover:border-[#8A9A5B] transition-all duration-200"
          >
            <div className="text-center">
              <Activity className="w-6 h-6 mx-auto mb-2 text-[#8A9A5B]" />
              <p className="font-medium text-[#1A1F16]">Health Store</p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
