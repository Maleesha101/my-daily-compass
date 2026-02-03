import { useEffect, useState } from 'react';
import { useGoalStore } from '@/stores/goalStore';
import { type Goal } from '@/db/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2, Target, TrendingUp, Wallet, CheckCircle } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { ProgressRing } from '@/components/shared/ProgressRing';
import { formatCurrency } from '@/utils/helpers';
import { cn } from '@/lib/utils';

export default function Goals() {
  const { goals, loadGoals, addGoal, updateGoalProgress, deleteGoal } = useGoalStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'finance' as Goal['type'],
    target: 0,
    period: 'monthly' as Goal['period'],
    trackingType: 'cumulative' as Goal['trackingType'],
    unit: '',
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addGoal({
      ...formData,
      unit: formData.unit || undefined,
      startDate: new Date().toISOString(),
      status: 'active',
    });
    setFormData({ name: '', type: 'finance', target: 0, period: 'monthly', trackingType: 'cumulative', unit: '' });
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this goal?')) {
      await deleteGoal(id);
    }
  };

  const handleUpdateProgress = async (id: string, current: number) => {
    await updateGoalProgress(id, current);
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  const getIcon = (type: Goal['type']) => {
    switch (type) {
      case 'habit': return <Target className="h-5 w-5" />;
      case 'portfolio': return <TrendingUp className="h-5 w-5" />;
      default: return <Wallet className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Goals</h1>
          <p className="text-sm text-muted-foreground">
            Set and track your financial and portfolio goals
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Emergency Fund"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as Goal['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="finance">Financial Goal</SelectItem>
                    <SelectItem value="portfolio">Portfolio Goal</SelectItem>
                    <SelectItem value="habit">Habit Goal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="period">Period</Label>
                <Select
                  value={formData.period}
                  onValueChange={(v) => setFormData({ ...formData, period: v as Goal['period'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily (e.g., 2 hours every day)</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="trackingType">Tracking Type</Label>
                <Select
                  value={formData.trackingType}
                  onValueChange={(v) => setFormData({ ...formData, trackingType: v as Goal['trackingType'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per-period">Per Period (target for each day/week/month)</SelectItem>
                    <SelectItem value="cumulative">Cumulative (total over period)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target">Target</Label>
                  <Input
                    id="target"
                    type="number"
                    min={1}
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit (optional)</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g., hours, days, LKR"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Goal</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Goals */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Active Goals ({activeGoals.length})</h2>
        {activeGoals.length === 0 ? (
          <EmptyState
            icon={<Target className="h-8 w-8 text-muted-foreground" />}
            title="No active goals"
            description="Create your first goal to start tracking"
            action={
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                icon={getIcon(goal.type)}
                onUpdateProgress={handleUpdateProgress}
                onDelete={() => handleDelete(goal.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Completed Goals ({completedGoals.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                icon={getIcon(goal.type)}
                onUpdateProgress={handleUpdateProgress}
                onDelete={() => handleDelete(goal.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface GoalCardProps {
  goal: Goal;
  icon: React.ReactNode;
  onUpdateProgress: (id: string, current: number) => void;
  onDelete: () => void;
}

function GoalCard({ goal, icon, onUpdateProgress, onDelete }: GoalCardProps) {
  const [inputValue, setInputValue] = useState(goal.current.toString());
  const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
  const isCompleted = goal.status === 'completed';

  const handleBlur = () => {
    const newValue = Number(inputValue);
    if (!isNaN(newValue) && newValue !== goal.current) {
      onUpdateProgress(goal.id, newValue);
    }
  };

  return (
    <div className={cn('dashboard-card', isCompleted && 'border-success/50 bg-success/5')}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            'p-2 rounded-lg',
            isCompleted ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
          )}>
            {icon}
          </div>
          <div>
            <h3 className="font-medium">{goal.name}</h3>
            <p className="text-xs text-muted-foreground capitalize">
              {goal.type} • {goal.period}{goal.trackingType === 'per-period' ? ' (per period)' : ''}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-4">
        <ProgressRing progress={Math.min(progress, 100)} size={80} strokeWidth={6} />
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Current Progress</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleBlur}
              className="h-8"
              disabled={isCompleted}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Target: {goal.target}{goal.unit ? ` ${goal.unit}` : ''}{goal.trackingType === 'per-period' ? ` / ${goal.period.replace('ly', '')}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
