import { useEffect, useState } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { type FinanceTransaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/db/database';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatCard } from '@/components/shared/StatCard';
import { MonthSelector } from '@/components/shared/MonthSelector';
import { formatCurrency, formatDisplayDate, getPLColor } from '@/utils/helpers';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--destructive))',
  'hsl(var(--warning))',
  'hsl(var(--info))',
];

export default function Finance() {
  const {
    transactions,
    selectedMonth,
    loadTransactionsForMonth,
    addTransaction,
    deleteTransaction,
    setSelectedMonth,
    getTotalIncome,
    getTotalExpenses,
    getNetSavings,
    getCategoryTotals,
  } = useFinanceStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    loadTransactionsForMonth(selectedMonth);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTransaction(formData);
    setFormData({
      type: 'expense',
      category: '',
      description: '',
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const netSavings = getNetSavings();
  const expensesByCategory = getCategoryTotals('expense');
  const incomeByCategory = getCategoryTotals('income');

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financial Management</h1>
          <p className="text-sm text-muted-foreground">
            Track income, expenses, and savings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector currentMonth={selectedMonth} onChange={setSelectedMonth} />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <Tabs
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v as 'income' | 'expense', category: '' })}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="expense">Expense</TabsTrigger>
                      <TabsTrigger value="income">Income</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Grocery shopping"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (LKR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min={1}
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Transaction</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total Income"
          value={formatCurrency(totalIncome)}
          icon={<ArrowUpCircle className="h-5 w-5 text-success" />}
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={<ArrowDownCircle className="h-5 w-5 text-destructive" />}
        />
        <StatCard
          label="Net Savings"
          value={
            <span className={getPLColor(netSavings)}>
              {formatCurrency(netSavings)}
            </span>
          }
          icon={<Wallet className="h-5 w-5" />}
        />
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon={<Wallet className="h-8 w-8 text-muted-foreground" />}
          title="No transactions this month"
          description="Add your first transaction to start tracking"
          action={
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Transactions Table */}
          <div className="lg:col-span-2 dashboard-card overflow-x-auto">
            <h3 className="font-semibold mb-4">Transactions</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDisplayDate(tx.date)}
                      </TableCell>
                      <TableCell>{tx.description || '-'}</TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                          {tx.category}
                        </span>
                      </TableCell>
                      <TableCell className={cn('text-right font-medium', tx.type === 'income' ? 'text-success' : 'text-destructive')}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(tx.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {/* Expense Breakdown */}
          <div className="dashboard-card">
            <h3 className="font-semibold mb-4">Expense Breakdown</h3>
            {expensesByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No expenses this month
              </p>
            ) : (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="total"
                        nameKey="category"
                      >
                        {expensesByCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const total = expensesByCategory.reduce((sum, d) => sum + d.total, 0);
                            const percent = total > 0 ? ((payload[0].value as number) / total) * 100 : 0;
                            return (
                              <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-md">
                                <p className="font-medium">{payload[0].name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(payload[0].value as number)} ({percent.toFixed(1)}%)
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {expensesByCategory.map((item, index) => (
                    <div key={item.category} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="flex-1 truncate">{item.category}</span>
                      <span className="text-muted-foreground">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
