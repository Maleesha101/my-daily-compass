import { useEffect, useState, useRef } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Save, Database, User, AlertTriangle } from 'lucide-react';
import { downloadFile, formatDisplayDate } from '@/utils/helpers';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const { settings, loadSettings, updateSettings, exportData, importData } = useSettingsStore();
  const [userName, setUserName] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setUserName(settings.userName);
    }
  }, [settings]);

  const handleSaveProfile = async () => {
    await updateSettings({ userName });
    toast({
      title: 'Settings saved',
      description: 'Your profile has been updated.',
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportData();
      const filename = `tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      downloadFile(data, filename, 'application/json');
      toast({
        title: 'Export successful',
        description: 'Your data has been exported.',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const content = await file.text();
      await importData(content);
      toast({
        title: 'Import successful',
        description: 'Your data has been restored.',
      });
      // Reload the page to refresh all data
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Invalid backup file',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile and data backup
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>
            Personalize your tracker experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="userName">Display Name</Label>
            <Input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name"
              className="max-w-sm"
            />
          </div>
          <div>
            <Label>Currency</Label>
            <p className="text-sm text-muted-foreground mt-1">LKR (Sri Lankan Rupee) - Fixed</p>
          </div>
          <Button onClick={handleSaveProfile}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export and import your tracking data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <h4 className="font-medium mb-2">Export Data</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Download all your habits, goals, stocks, and transactions as a JSON file.
              Use this for backup or transferring to another device.
            </p>
            <Button onClick={handleExport} disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export Backup'}
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <h4 className="font-medium mb-2">Import Data</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Restore data from a previously exported backup file.
            </p>
            <div className="flex items-start gap-3">
              <Button onClick={handleImportClick} disabled={isImporting} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? 'Importing...' : 'Import Backup'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
            <div className="flex items-start gap-2 mt-3 p-2 rounded bg-warning/10 text-warning-foreground">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-xs">
                Warning: Importing will replace all existing data. Make sure to export first if needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Personal Tracker</strong> - Offline-first tracking app</p>
            <p>All data is stored locally in your browser using IndexedDB.</p>
            <p>No accounts, no servers, complete privacy.</p>
            {settings && (
              <p className="text-xs mt-4">
                Last updated: {formatDisplayDate(settings.updatedAt)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
