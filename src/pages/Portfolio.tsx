import { useEffect, useState } from 'react';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { type Stock } from '@/db/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Trash2, TrendingUp, TrendingDown, Layers, ArrowDownRight } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatCard } from '@/components/shared/StatCard';
import { formatCurrency, getPLColor } from '@/utils/helpers';
import { cn } from '@/lib/utils';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function Portfolio() {
  const {
    stocks,
    loadStocks,
    addStock,
    averageStock,
    sellStock,
    updateStockPrice,
    deleteStock,
    getTotalInvested,
    getTotalCurrentValue,
    getTotalPL,
    getTotalPLPercent,
  } = usePortfolioStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAverageDialogOpen, setIsAverageDialogOpen] = useState(false);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    quantity: 0,
    avgBuyPrice: 0,
    currentPrice: 0,
  });
  const [averageFormData, setAverageFormData] = useState({
    quantity: 0,
    buyPrice: 0,
  });
  const [sellFormData, setSellFormData] = useState({
    quantity: 0,
    sellPrice: 0,
  });

  useEffect(() => {
    loadStocks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addStock(formData);
    setFormData({ symbol: '', name: '', quantity: 0, avgBuyPrice: 0, currentPrice: 0 });
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remove this stock from portfolio?')) {
      await deleteStock(id);
    }
  };

  const handleOpenAverage = (stock: Stock) => {
    setSelectedStock(stock);
    setAverageFormData({ quantity: 0, buyPrice: stock.currentPrice });
    setIsAverageDialogOpen(true);
  };

  const handleAverageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStock && averageFormData.quantity > 0) {
      await averageStock(selectedStock.id, averageFormData.quantity, averageFormData.buyPrice);
      setIsAverageDialogOpen(false);
      setSelectedStock(null);
      setAverageFormData({ quantity: 0, buyPrice: 0 });
    }
  };

  const handleOpenSell = (stock: Stock) => {
    setSelectedStock(stock);
    setSellFormData({ quantity: 0, sellPrice: stock.currentPrice });
    setIsSellDialogOpen(true);
  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStock && sellFormData.quantity > 0 && sellFormData.quantity <= selectedStock.quantity) {
      const result = await sellStock(selectedStock.id, sellFormData.quantity, sellFormData.sellPrice);
      if (result) {
        const plColor = result.realizedPL >= 0 ? 'text-success' : 'text-destructive';
        alert(`Sold ${sellFormData.quantity} shares. Realized P&L: ${result.realizedPL >= 0 ? '+' : ''}${formatCurrency(result.realizedPL)}`);
      }
      setIsSellDialogOpen(false);
      setSelectedStock(null);
      setSellFormData({ quantity: 0, sellPrice: 0 });
    }
  };

  const handlePriceUpdate = async (id: string, price: string) => {
    const newPrice = parseFloat(price);
    if (!isNaN(newPrice)) {
      await updateStockPrice(id, newPrice);
    }
  };

  const totalInvested = getTotalInvested();
  const totalValue = getTotalCurrentValue();
  const totalPL = getTotalPL();
  const totalPLPercent = getTotalPLPercent();

  const pieData = stocks.map((stock) => ({
    name: stock.symbol,
    value: stock.quantity * stock.currentPrice,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stock Portfolio</h1>
          <p className="text-sm text-muted-foreground">
            Track your investments with manual price updates
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Stock
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Stock to Portfolio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    placeholder="e.g., SAMP"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Sampath Bank"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="avgBuyPrice">Avg Buy Price (LKR)</Label>
                  <Input
                    id="avgBuyPrice"
                    type="number"
                    step="0.01"
                    min={0}
                    value={formData.avgBuyPrice || ''}
                    onChange={(e) => setFormData({ ...formData, avgBuyPrice: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="currentPrice">Current Price (LKR)</Label>
                  <Input
                    id="currentPrice"
                    type="number"
                    step="0.01"
                    min={0}
                    value={formData.currentPrice || ''}
                    onChange={(e) => setFormData({ ...formData, currentPrice: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Stock</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Average Stock Dialog */}
        <Dialog open={isAverageDialogOpen} onOpenChange={setIsAverageDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Shares to {selectedStock?.symbol}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAverageSubmit} className="space-y-4">
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p>Current: <strong>{selectedStock?.quantity}</strong> shares @ <strong>{formatCurrency(selectedStock?.avgBuyPrice || 0)}</strong> avg</p>
              </div>
              <div>
                <Label htmlFor="avgQuantity">Additional Quantity</Label>
                <Input
                  id="avgQuantity"
                  type="number"
                  min={1}
                  value={averageFormData.quantity || ''}
                  onChange={(e) => setAverageFormData({ ...averageFormData, quantity: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="avgBuyPrice">Buy Price (LKR)</Label>
                <Input
                  id="avgBuyPrice"
                  type="number"
                  step="0.01"
                  min={0}
                  value={averageFormData.buyPrice || ''}
                  onChange={(e) => setAverageFormData({ ...averageFormData, buyPrice: Number(e.target.value) })}
                  required
                />
              </div>
              {selectedStock && averageFormData.quantity > 0 && averageFormData.buyPrice > 0 && (
                <div className="p-3 bg-primary/10 rounded-lg text-sm">
                  <p className="font-medium">New Position Preview:</p>
                  <p>Total: <strong>{selectedStock.quantity + averageFormData.quantity}</strong> shares</p>
                  <p>New Avg: <strong>{formatCurrency(
                    ((selectedStock.quantity * selectedStock.avgBuyPrice) + (averageFormData.quantity * averageFormData.buyPrice)) / 
                    (selectedStock.quantity + averageFormData.quantity)
                  )}</strong></p>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsAverageDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Shares</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Sell Stock Dialog */}
        <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sell {selectedStock?.symbol} Shares</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSellSubmit} className="space-y-4">
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p>Current: <strong>{selectedStock?.quantity}</strong> shares @ <strong>{formatCurrency(selectedStock?.avgBuyPrice || 0)}</strong> avg</p>
              </div>
              <div>
                <Label htmlFor="sellQuantity">Quantity to Sell</Label>
                <Input
                  id="sellQuantity"
                  type="number"
                  min={1}
                  max={selectedStock?.quantity || 1}
                  value={sellFormData.quantity || ''}
                  onChange={(e) => setSellFormData({ ...sellFormData, quantity: Number(e.target.value) })}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Max: {selectedStock?.quantity} shares</p>
              </div>
              <div>
                <Label htmlFor="sellPrice">Sell Price (LKR)</Label>
                <Input
                  id="sellPrice"
                  type="number"
                  step="0.01"
                  min={0}
                  value={sellFormData.sellPrice || ''}
                  onChange={(e) => setSellFormData({ ...sellFormData, sellPrice: Number(e.target.value) })}
                  required
                />
              </div>
              {selectedStock && sellFormData.quantity > 0 && sellFormData.sellPrice > 0 && (
                <div className={cn(
                  "p-3 rounded-lg text-sm",
                  (sellFormData.sellPrice - selectedStock.avgBuyPrice) >= 0 
                    ? "bg-success/10" 
                    : "bg-destructive/10"
                )}>
                  <p className="font-medium">Sale Preview:</p>
                  <p>Selling: <strong>{sellFormData.quantity}</strong> shares @ <strong>{formatCurrency(sellFormData.sellPrice)}</strong></p>
                  <p>Sale Value: <strong>{formatCurrency(sellFormData.quantity * sellFormData.sellPrice)}</strong></p>
                  <p className={cn(
                    "font-medium",
                    (sellFormData.sellPrice - selectedStock.avgBuyPrice) >= 0 
                      ? "text-success" 
                      : "text-destructive"
                  )}>
                    Realized P&L: {(sellFormData.sellPrice - selectedStock.avgBuyPrice) >= 0 ? '+' : ''}
                    {formatCurrency((sellFormData.sellPrice - selectedStock.avgBuyPrice) * sellFormData.quantity)}
                  </p>
                  {sellFormData.quantity < selectedStock.quantity && (
                    <p className="mt-2 text-muted-foreground">
                      Remaining: {selectedStock.quantity - sellFormData.quantity} shares
                    </p>
                  )}
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsSellDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="destructive"
                  disabled={!sellFormData.quantity || sellFormData.quantity > (selectedStock?.quantity || 0)}
                >
                  Sell Shares
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Total Invested"
          value={formatCurrency(totalInvested)}
        />
        <StatCard
          label="Current Value"
          value={formatCurrency(totalValue)}
        />
        <StatCard
          label="Total P&L"
          value={
            <span className={getPLColor(totalPL)}>
              {totalPL >= 0 ? '+' : ''}{formatCurrency(totalPL)}
            </span>
          }
          icon={totalPL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
        />
        <StatCard
          label="P&L %"
          value={
            <span className={getPLColor(totalPLPercent)}>
              {totalPLPercent >= 0 ? '+' : ''}{totalPLPercent.toFixed(2)}%
            </span>
          }
        />
      </div>

      {stocks.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="h-8 w-8 text-muted-foreground" />}
          title="No stocks in portfolio"
          description="Add your first stock to start tracking investments"
          action={
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Stock
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Table */}
          <div className="lg:col-span-2 dashboard-card overflow-x-auto">
            <h3 className="font-semibold mb-4">Holdings</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Avg Price</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocks.map((stock) => {
                  const invested = stock.quantity * stock.avgBuyPrice;
                  const value = stock.quantity * stock.currentPrice;
                  const pl = value - invested;
                  const plPercent = invested > 0 ? (pl / invested) * 100 : 0;

                  return (
                    <TableRow key={stock.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{stock.symbol}</p>
                          <p className="text-xs text-muted-foreground">{stock.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{stock.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(stock.avgBuyPrice)}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          step="0.01"
                          value={stock.currentPrice}
                          onChange={(e) => handlePriceUpdate(stock.id, e.target.value)}
                          className="w-24 h-8 text-right"
                        />
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(value)}</TableCell>
                      <TableCell className={cn('text-right font-medium', getPLColor(pl))}>
                        {pl >= 0 ? '+' : ''}{formatCurrency(pl)}
                        <span className="text-xs ml-1">({plPercent.toFixed(1)}%)</span>
                      </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenAverage(stock)}
                              title="Add shares (average)"
                            >
                              <Layers className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-warning"
                              onClick={() => handleOpenSell(stock)}
                              title="Sell shares"
                            >
                              <ArrowDownRight className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDelete(stock.id)}
                              title="Remove stock"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pie Chart */}
          <div className="dashboard-card">
            <h3 className="font-semibold mb-4">Allocation</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const total = pieData.reduce((sum, d) => sum + d.value, 0);
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
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="flex-1">{item.name}</span>
                  <span className="text-muted-foreground">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
