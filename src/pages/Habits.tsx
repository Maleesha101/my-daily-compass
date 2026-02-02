import { useEffect, useState } from 'react';
import { useHabitStore } from '@/stores/habitStore';
import { type Habit, HABIT_CATEGORIES } from '@/db/database';
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
import { Plus, Pencil, Trash2, Pause, Play } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { MonthSelector } from '@/components/shared/MonthSelector';
import { cn } from '@/lib/utils';

export default function Habits() {
  const {
    habits,
    loadHabits,
    loadEntriesForMonth,
    addHabit,
    updateHabit,
    deleteHabit,
    selectedMonth,
    setSelectedMonth,
  } = useHabitStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Health' as Habit['category'],
    goalValue: 20,
    type: 'boolean' as Habit['type'],
    unit: '',
  });

  useEffect(() => {
    loadHabits();
    loadEntriesForMonth(selectedMonth);
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Health',
      goalValue: 20,
      type: 'boolean',
      unit: '',
    });
    setEditingHabit(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingHabit) {
      await updateHabit(editingHabit.id, formData);
    } else {
      await addHabit({ ...formData, active: true });
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormData({
      name: habit.name,
      category: habit.category,
      goalValue: habit.goalValue,
      type: habit.type,
      unit: habit.unit || '',
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (habit: Habit) => {
    await updateHabit(habit.id, { active: !habit.active });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this habit? All entries will be lost.')) {
      await deleteHabit(id);
    }
  };

  const activeHabits = habits.filter(h => h.active);
  const pausedHabits = habits.filter(h => !h.active);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Habits</h1>
          <p className="text-sm text-muted-foreground">
            Track your daily habits and build consistency
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector currentMonth={selectedMonth} onChange={setSelectedMonth} />
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Habit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingHabit ? 'Edit Habit' : 'Add New Habit'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Habit Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Morning Run"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v as Habit['category'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HABIT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="goalValue">Monthly Goal (days)</Label>
                  <Input
                    id="goalValue"
                    type="number"
                    min={1}
                    max={31}
                    value={formData.goalValue}
                    onChange={(e) => setFormData({ ...formData, goalValue: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v as Habit['type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boolean">Yes/No (Checkbox)</SelectItem>
                      <SelectItem value="numeric">Numeric Value</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.type === 'numeric' && (
                  <div>
                    <Label htmlFor="unit">Unit (optional)</Label>
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="e.g., glasses, minutes"
                    />
                  </div>
                )}
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingHabit ? 'Save Changes' : 'Add Habit'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active Habits */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Active Habits ({activeHabits.length})</h2>
        {activeHabits.length === 0 ? (
          <EmptyState
            title="No active habits"
            description="Create your first habit to start tracking"
            action={
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Habit
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {activeHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onEdit={() => handleEdit(habit)}
                onToggle={() => handleToggleActive(habit)}
                onDelete={() => handleDelete(habit.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Paused Habits */}
      {pausedHabits.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
            Paused Habits ({pausedHabits.length})
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {pausedHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onEdit={() => handleEdit(habit)}
                onToggle={() => handleToggleActive(habit)}
                onDelete={() => handleDelete(habit.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface HabitCardProps {
  habit: Habit;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

function HabitCard({ habit, onEdit, onToggle, onDelete }: HabitCardProps) {
  return (
    <div
      className={cn(
        'dashboard-card',
        !habit.active && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{habit.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {habit.category} • {habit.goalValue} days/month
          </p>
          <span className={cn(
            'inline-block mt-2 px-2 py-0.5 text-xs rounded-full',
            habit.type === 'boolean' 
              ? 'bg-primary/10 text-primary' 
              : 'bg-accent/10 text-accent'
          )}>
            {habit.type === 'boolean' ? 'Checkbox' : `Numeric${habit.unit ? ` (${habit.unit})` : ''}`}
          </span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle}>
            {habit.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
