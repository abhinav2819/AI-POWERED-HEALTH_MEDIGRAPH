import React, { useState, useEffect } from 'react';
import { metricsApi, analyticsApi } from '@/api';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/utils/helpers';

const HealthAnalysis = () => {
  const [metricType, setMetricType] = useState('STEPS');
  const [period, setPeriod] = useState('LAST_WEEK');
  const [history, setHistory] = useState([]);
  const [aggregate, setAggregate] = useState(null);
  const [bmi, setBmi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysisData();
  }, [metricType, period]);

  const fetchAnalysisData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - (period === 'LAST_WEEK' ? 7 : period === 'LAST_15_DAYS' ? 15 : 30));

      const [historyRes, aggregateRes, bmiRes] = await Promise.all([
        metricsApi.getHistory({
          metricType,
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        }),
        metricsApi.getAggregate({
          metricType,
          operation: 'AVERAGE',
          period
        }),
        analyticsApi.getBMI().catch(() => null)
      ]);

      setHistory(historyRes.data || []);
      setAggregate(aggregateRes.data);
      setBmi(bmiRes?.data);
    } catch (error) {
      toast.error('Failed to load analysis data');
    } finally {
      setLoading(false);
    }
  };

  const chartData = history.map(item => ({
    date: formatDate(item.timestamp),
    value: item.value
  }));

  return (
    <div className="min-h-screen bg-[#FDFDF9] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-outfit font-semibold text-[#1A1F16] tracking-tight">
            Health Analysis
          </h1>
          <p className="text-base text-[#666] mt-2">Detailed insights into your health metrics</p>
        </div>

        <div className="flex gap-4">
          <Select value={metricType} onValueChange={setMetricType}>
            <SelectTrigger className="w-48 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STEPS">Steps</SelectItem>
              <SelectItem value="HEART_RATE">Heart Rate</SelectItem>
              <SelectItem value="SLEEP">Sleep</SelectItem>
              <SelectItem value="CALORIES">Calories</SelectItem>
            </SelectContent>
          </Select>

          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LAST_WEEK">Last Week</SelectItem>
              <SelectItem value="LAST_15_DAYS">Last 15 Days</SelectItem>
              <SelectItem value="LAST_MONTH">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {bmi && (
          <Card className="p-6 border-[#E5E7E1] rounded-2xl">
            <h3 className="text-lg font-semibold text-[#1A1F16] mb-4">Your BMI</h3>
            <div className="flex items-center gap-8">
              <div>
                <p className="text-5xl font-outfit font-bold text-[#8A9A5B]">{bmi.bmi?.toFixed(1)}</p>
                <p className="text-sm text-[#666] mt-1">{bmi.category}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-[#8A9A5B]" />
            </div>
          </Card>
        )}

        {aggregate && (
          <Card className="p-6 border-[#E5E7E1] rounded-2xl">
            <h3 className="text-lg font-semibold text-[#1A1F16] mb-4">Average {metricType}</h3>
            <p className="text-4xl font-outfit font-bold text-[#1A1F16]">{aggregate.result}</p>
          </Card>
        )}

        <Card className="p-6 border-[#E5E7E1] rounded-2xl">
          <h3 className="text-lg font-semibold text-[#1A1F16] mb-6">Historical Trend</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7E1" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8A9A5B" strokeWidth={3} dot={{ fill: '#8A9A5B', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-[#666]">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No data available for this period</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default HealthAnalysis;