import React, { useState, useEffect, useCallback } from 'react';
import { userApi, whatsappApi } from '@/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PROFILE } from '@/constants/testIds';
import { User, Settings, Bell, Target, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const Profile = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const response = await userApi.getProfile();
      setProfile(response.data);
    } catch (error) {
      // Profile fetch failed
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGoals = useCallback(async () => {
    try {
      const response = await userApi.getGoals();
      setGoals(response.data);
    } catch (error) {
      // Goals fetch failed
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchGoals();
  }, [fetchProfile, fetchGoals]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await userApi.updateProfile(profile);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleUpdateGoals = async (e) => {
    e.preventDefault();
    try {
      await userApi.updateGoals(goals);
      toast.success('Goals updated successfully!');
    } catch (error) {
      toast.error('Failed to update goals');
    }
  };

  const handleSendTestReport = async () => {
    if (!whatsappNumber) {
      toast.error('Please enter WhatsApp number');
      return;
    }

    try {
      await whatsappApi.sendReport({
        phone_number: whatsappNumber,
        user_name: profile?.name || 'User',
        report_summary: 'This is a test health report from MEDIGRAPH',
        metrics: {
          'Steps': '8,500',
          'Heart Rate': '72 bpm',
          'Sleep': '7.5 hours'
        }
      });
      toast.success('Test report sent to WhatsApp!');
    } catch (error) {
      toast.error('Failed to send WhatsApp report');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDF9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#8A9A5B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDF9] p-6" data-testid={PROFILE.container}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-outfit font-semibold text-[#1A1F16] tracking-tight">
            Profile & Settings
          </h1>
          <p className="text-base text-[#666] mt-2">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-[#F4F5F0] rounded-2xl p-1">
            <TabsTrigger value="profile" className="rounded-xl data-[state=active]:bg-white">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="goals" className="rounded-xl data-[state=active]:bg-white">
              <Target className="w-4 h-4 mr-2" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-xl data-[state=active]:bg-white">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-8 border-[#E5E7E1] rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-outfit font-semibold text-[#1A1F16]">Personal Information</h2>
                {!editing ? (
                  <Button
                    data-testid={PROFILE.editBtn}
                    onClick={() => setEditing(true)}
                    variant="outline"
                    className="rounded-full border-[#E5E7E1]"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    onClick={() => setEditing(false)}
                    variant="outline"
                    className="rounded-full border-[#E5E7E1]"
                  >
                    Cancel
                  </Button>
                )}
              </div>

              {profile && (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-[#1A1F16]">Full Name</Label>
                      <Input
                        data-testid={PROFILE.nameInput}
                        value={profile.name || ''}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        disabled={!editing}
                        className="rounded-xl border-[#E5E7E1] mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-[#1A1F16]">Email</Label>
                      <Input
                        value={authUser?.email || ''}
                        disabled
                        className="rounded-xl border-[#E5E7E1] mt-2 bg-[#F4F5F0]"
                      />
                    </div>
                    <div>
                      <Label className="text-[#1A1F16]">Age</Label>
                      <Input
                        data-testid={PROFILE.ageInput}
                        type="number"
                        value={profile.age || ''}
                        onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                        disabled={!editing}
                        className="rounded-xl border-[#E5E7E1] mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-[#1A1F16]">Height (cm)</Label>
                      <Input
                        data-testid={PROFILE.heightInput}
                        type="number"
                        step="0.1"
                        value={profile.height || ''}
                        onChange={(e) => setProfile({ ...profile, height: parseFloat(e.target.value) })}
                        disabled={!editing}
                        className="rounded-xl border-[#E5E7E1] mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-[#1A1F16]">Weight (kg)</Label>
                      <Input
                        data-testid={PROFILE.weightInput}
                        type="number"
                        step="0.1"
                        value={profile.weight || ''}
                        onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) })}
                        disabled={!editing}
                        className="rounded-xl border-[#E5E7E1] mt-2"
                      />
                    </div>
                  </div>

                  {editing && (
                    <Button
                      data-testid={PROFILE.saveBtn}
                      type="submit"
                      className="rounded-full bg-[#8A9A5B] hover:bg-[#7a8a4b] text-white px-8 h-12"
                    >
                      Save Changes
                    </Button>
                  )}
                </form>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="goals">
            <Card className="p-8 border-[#E5E7E1] rounded-3xl">
              <h2 className="text-2xl font-outfit font-semibold text-[#1A1F16] mb-6">Health Goals</h2>
              {goals && (
                <form onSubmit={handleUpdateGoals} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-[#1A1F16]">Daily Steps Target</Label>
                      <Input
                        type="number"
                        value={goals.targetSteps || ''}
                        onChange={(e) => setGoals({ ...goals, targetSteps: parseInt(e.target.value) })}
                        className="rounded-xl border-[#E5E7E1] mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-[#1A1F16]">Daily Calories Target</Label>
                      <Input
                        type="number"
                        value={goals.targetCalories || ''}
                        onChange={(e) => setGoals({ ...goals, targetCalories: parseInt(e.target.value) })}
                        className="rounded-xl border-[#E5E7E1] mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-[#1A1F16]">Sleep Hours Target</Label>
                      <Input
                        type="number"
                        value={goals.targetSleepHours || ''}
                        onChange={(e) => setGoals({ ...goals, targetSleepHours: parseInt(e.target.value) })}
                        className="rounded-xl border-[#E5E7E1] mt-2"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="rounded-full bg-[#8A9A5B] hover:bg-[#7a8a4b] text-white px-8 h-12"
                  >
                    Update Goals
                  </Button>
                </form>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="p-8 border-[#E5E7E1] rounded-3xl">
              <h2 className="text-2xl font-outfit font-semibold text-[#1A1F16] mb-6 flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-[#8A9A5B]" />
                WhatsApp Notifications
              </h2>
              <p className="text-[#666] mb-6">
                Receive personalized health reports and insights directly on WhatsApp
              </p>
              <div className="space-y-4">
                <div>
                  <Label className="text-[#1A1F16]">WhatsApp Number (with country code)</Label>
                  <Input
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+919876543210"
                    className="rounded-xl border-[#E5E7E1] mt-2"
                  />
                  <p className="text-xs text-[#666] mt-2">Example: +91 for India, +1 for USA</p>
                </div>
                <Button
                  onClick={handleSendTestReport}
                  className="rounded-full bg-[#8A9A5B] hover:bg-[#7a8a4b] text-white px-8 h-12"
                >
                  Send Test Report
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;