import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Shield, 
  Key, 
  Database,
  Activity,
  AlertTriangle,
  Save,
  Eye,
  EyeOff
} from "lucide-react";

export const AdminSettings = () => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    // Password Settings
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    
    // System Settings
    manualApprovals: true,
    autoPoolEnabled: true,
    directIncomeEnabled: true,
    binaryIncomeEnabled: true,
    levelIncomeEnabled: true,
    emiBonus: true,
    
    // Pool Configuration
    poolEntryAmount: "10000",
    poolLevels: "3",
    poolDistribution: "1:3:9",
    
    // Company Settings
    companyCharges: "10",
    tdsDeduction: "5",
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    
    // Maintenance
    maintenanceMode: false,
    maintenanceMessage: "System is under maintenance. Please try again later."
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await apiRequest('POST', '/api/admin/change-password', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Admin password has been changed successfully",
      });
      setSettings(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
    },
    onError: (error: any) => {
      toast({
        title: "Password update failed",
        description: error.message || "Could not update password",
        variant: "destructive",
      });
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/admin/settings', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "System settings have been saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Settings update failed",
        description: error.message || "Could not update settings",
        variant: "destructive",
      });
    },
  });

  const handlePasswordChange = () => {
    if (!settings.currentPassword || !settings.newPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (settings.newPassword !== settings.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation do not match",
        variant: "destructive",
      });
      return;
    }

    if (settings.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    updatePasswordMutation.mutate({
      currentPassword: settings.currentPassword,
      newPassword: settings.newPassword
    });
  };

  const handleSettingsUpdate = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={settings.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={settings.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={settings.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <Button 
            onClick={handlePasswordChange}
            disabled={updatePasswordMutation.isPending}
            className="w-full md:w-auto"
          >
            <Key className="h-4 w-4 mr-2" />
            {updatePasswordMutation.isPending ? "Updating..." : "Change Password"}
          </Button>
        </CardContent>
      </Card>

      {/* Income Module Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Income Module Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="directIncome">Direct Income (5%)</Label>
                <p className="text-sm text-gray-500">Enable/disable direct referral income</p>
              </div>
              <Switch
                id="directIncome"
                checked={settings.directIncomeEnabled}
                onCheckedChange={(checked) => handleInputChange('directIncomeEnabled', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="binaryIncome">Binary Income (5%)</Label>
                <p className="text-sm text-gray-500">Enable/disable binary matching income</p>
              </div>
              <Switch
                id="binaryIncome"
                checked={settings.binaryIncomeEnabled}
                onCheckedChange={(checked) => handleInputChange('binaryIncomeEnabled', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="levelIncome">Level Income (62%)</Label>
                <p className="text-sm text-gray-500">Enable/disable level income distribution</p>
              </div>
              <Switch
                id="levelIncome"
                checked={settings.levelIncomeEnabled}
                onCheckedChange={(checked) => handleInputChange('levelIncomeEnabled', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emiBonus">EMI Bonus</Label>
                <p className="text-sm text-gray-500">Enable/disable EMI completion bonus</p>
              </div>
              <Switch
                id="emiBonus"
                checked={settings.emiBonus}
                onCheckedChange={(checked) => handleInputChange('emiBonus', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoPool">Auto Pool</Label>
                <p className="text-sm text-gray-500">Enable/disable auto pool system</p>
              </div>
              <Switch
                id="autoPool"
                checked={settings.autoPoolEnabled}
                onCheckedChange={(checked) => handleInputChange('autoPoolEnabled', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="manualApprovals">Manual Approvals</Label>
                <p className="text-sm text-gray-500">Require admin approval for new accounts</p>
              </div>
              <Switch
                id="manualApprovals"
                checked={settings.manualApprovals}
                onCheckedChange={(checked) => handleInputChange('manualApprovals', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto Pool Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Auto Pool Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="poolEntry">Pool Entry Amount (₹)</Label>
              <Input
                id="poolEntry"
                type="number"
                value={settings.poolEntryAmount}
                onChange={(e) => handleInputChange('poolEntryAmount', e.target.value)}
                placeholder="10000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="poolLevels">Pool Levels</Label>
              <Input
                id="poolLevels"
                type="number"
                value={settings.poolLevels}
                onChange={(e) => handleInputChange('poolLevels', e.target.value)}
                placeholder="3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="poolDistribution">Distribution Ratio</Label>
              <Input
                id="poolDistribution"
                value={settings.poolDistribution}
                onChange={(e) => handleInputChange('poolDistribution', e.target.value)}
                placeholder="1:3:9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Company Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyCharges">Company Charges (%)</Label>
              <Input
                id="companyCharges"
                type="number"
                value={settings.companyCharges}
                onChange={(e) => handleInputChange('companyCharges', e.target.value)}
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tdsDeduction">TDS Deduction (%)</Label>
              <Input
                id="tdsDeduction"
                type="number"
                value={settings.tdsDeduction}
                onChange={(e) => handleInputChange('tdsDeduction', e.target.value)}
                placeholder="5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Maintenance Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenance">Enable Maintenance Mode</Label>
              <p className="text-sm text-gray-500">Temporarily disable user access to the system</p>
            </div>
            <Switch
              id="maintenance"
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
            />
          </div>
          
          {settings.maintenanceMode && (
            <div className="space-y-2">
              <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
              <Textarea
                id="maintenanceMessage"
                value={settings.maintenanceMessage}
                onChange={(e) => handleInputChange('maintenanceMessage', e.target.value)}
                placeholder="Enter maintenance message for users"
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSettingsUpdate}
          disabled={updateSettingsMutation.isPending}
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {updateSettingsMutation.isPending ? "Saving..." : "Save All Settings"}
        </Button>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Badge variant="default" className="bg-green-500 mb-2">Online</Badge>
              <p className="text-sm text-gray-600">Server Status</p>
            </div>
            <div className="text-center">
              <Badge variant="default" className="bg-green-500 mb-2">Connected</Badge>
              <p className="text-sm text-gray-600">Database</p>
            </div>
            <div className="text-center">
              <Badge variant="default" className="bg-green-500 mb-2">Active</Badge>
              <p className="text-sm text-gray-600">Payment Gateway</p>
            </div>
            <div className="text-center">
              <Badge variant={settings.maintenanceMode ? "destructive" : "default"} className={settings.maintenanceMode ? "" : "bg-green-500"}>
                {settings.maintenanceMode ? "Maintenance" : "Running"}
              </Badge>
              <p className="text-sm text-gray-600">System Mode</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};