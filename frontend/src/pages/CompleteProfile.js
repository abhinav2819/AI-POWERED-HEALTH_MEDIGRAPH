import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UserCircle } from 'lucide-react';

const CompleteProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    weight: ''
  });
  const [goals, setGoals] = useState({
    targetSteps: 10000,
    targetCalories: 2000,
    targetSleepHours: 8,
    preferredUnit: 'METRIC'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Complete profile
      await userApi.completeProfile({
        name: formData.name,
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight)
      });

      // Create goals
      await userApi.createGoal(goals);

      toast.success('Profile completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDF9] flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl p-8 border-[#E5E7E1] rounded-3xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#8A9A5B] rounded-full flex items-center justify-center mb-4">
            <UserCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-outfit font-semibold text-[#1A1F16] tracking-tight">
            Complete Your Profile
          </h1>
          <p className="text-sm text-[#666] mt-2">Help us personalize your health journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1F16] mb-2">Full Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
                className="rounded-xl border-[#E5E7E1]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#1A1F16] mb-2">Age</label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="30"
                required
                className="rounded-xl border-[#E5E7E1]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#1A1F16] mb-2">Height (cm)</label>
              <Input
                type="number"
                step="0.1"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                placeholder="175.5"
                required
                className="rounded-xl border-[#E5E7E1]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#1A1F16] mb-2">Weight (kg)</label>
              <Input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="70.5"
                required
                className="rounded-xl border-[#E5E7E1]"
              />
            </div>
          </div>

          <div className="border-t border-[#E5E7E1] pt-6">
            <h2 className="text-xl font-outfit font-semibold text-[#1A1F16] mb-4">Set Your Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1F16] mb-2">Daily Steps Target</label>
                <Input
                  type="number"
                  value={goals.targetSteps}
                  onChange={(e) => setGoals({ ...goals, targetSteps: parseInt(e.target.value) })}
                  className="rounded-xl border-[#E5E7E1]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#1A1F16] mb-2">Daily Calories Target</label>
                <Input
                  type="number"
                  value={goals.targetCalories}
                  onChange={(e) => setGoals({ ...goals, targetCalories: parseInt(e.target.value) })}
                  className="rounded-xl border-[#E5E7E1]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#1A1F16] mb-2">Sleep Hours Target</label>
                <Input
                  type="number"
                  value={goals.targetSleepHours}
                  onChange={(e) => setGoals({ ...goals, targetSleepHours: parseInt(e.target.value) })}
                  className="rounded-xl border-[#E5E7E1]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#1A1F16] mb-2">Preferred Unit</label>
                <Select
                  value={goals.preferredUnit}
                  onValueChange={(value) => setGoals({ ...goals, preferredUnit: value })}
                >
                  <SelectTrigger className="rounded-xl border-[#E5E7E1]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="METRIC">Metric</SelectItem>
                    <SelectItem value="IMPERIAL">Imperial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#8A9A5B] hover:bg-[#7a8a4b] text-white h-12 transition-all duration-200 hover:-translate-y-0.5"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CompleteProfile;