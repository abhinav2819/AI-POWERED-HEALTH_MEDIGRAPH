import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { metricsApi } from '@/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { METRICS } from '@/constants/testIds';
import { Activity } from 'lucide-react';
import { toast } from 'sonner';

const AddMetrics = () => {
  const [metricType, setMetricType] = useState('STEPS');
  const [value, setValue] = useState('');
  const [source, setSource] = useState('MANUAL');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await metricsApi.postManual({
        metricType,
        value: parseFloat(value),
        source
      });

      toast.success('Metric added successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add metric');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDF9] p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 border-[#E5E7E1] rounded-3xl" data-testid={METRICS.addForm}>
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#8A9A5B] rounded-full flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-outfit font-semibold text-[#1A1F16] tracking-tight">
              Add Health Metric
            </h1>
            <p className="text-sm text-[#666] mt-2">Track your daily health data</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#1A1F16] mb-2">Metric Type</label>
              <Select value={metricType} onValueChange={setMetricType}>
                <SelectTrigger data-testid={METRICS.typeSelect} className="rounded-xl border-[#E5E7E1]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STEPS">Steps</SelectItem>
                  <SelectItem value="HEART_RATE">Heart Rate (bpm)</SelectItem>
                  <SelectItem value="SLEEP">Sleep (hours)</SelectItem>
                  <SelectItem value="CALORIES">Calories</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1F16] mb-2">Value</label>
              <Input
                data-testid={METRICS.valueInput}
                type="number"
                step="0.1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value"
                required
                className="rounded-xl border-[#E5E7E1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1F16] mb-2">Source</label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="rounded-xl border-[#E5E7E1]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANUAL">Manual Entry</SelectItem>
                  <SelectItem value="GOOGLE_FIT">Google Fit</SelectItem>
                  <SelectItem value="FITBIT">Fitbit</SelectItem>
                  <SelectItem value="APPLE_HEALTH">Apple Health</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex-1 rounded-full border-[#E5E7E1] h-12"
              >
                Cancel
              </Button>
              <Button
                data-testid={METRICS.submitBtn}
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full bg-[#8A9A5B] hover:bg-[#7a8a4b] text-white h-12 transition-all duration-200 hover:-translate-y-0.5"
              >
                {loading ? 'Adding...' : 'Add Metric'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddMetrics;