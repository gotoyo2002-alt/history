import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import TradingRecordForm from './TradingRecordForm';
import AdminDashboard from './AdminDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, BarChart3, LogOut, Edit, Trash2, Shield, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TradingRecord {
  id: string;
  trade_date: string;
  stock_symbol: string;
  stock_name?: string;
  transaction_type: 'buy' | 'sell';
  quantity: number;
  price: number;
  commission?: number;
  tax?: number;
  notes?: string;
  created_at: string;
}

export default function TradingDashboard() {
  const { user, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [records, setRecords] = useState<TradingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TradingRecord | null>(null);
  const [activeTab, setActiveTab] = useState('trading');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_records')
        .select('*')
        .order('trade_date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('載入交易紀錄失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trading_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRecords(records.filter(record => record.id !== id));
      toast.success('交易紀錄已刪除');
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('刪除交易紀錄失敗');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingRecord(null);
    fetchRecords();
  };

  // Calculate investment statistics
  const totalInvestment = records
    .filter(r => r.transaction_type === 'buy')
    .reduce((sum, r) => sum + (r.quantity * r.price), 0);

  const totalReturn = records
    .filter(r => r.transaction_type === 'sell')
    .reduce((sum, r) => sum + (r.quantity * r.price), 0);

  const totalFees = records.reduce((sum, r) => sum + (r.commission || 0) + (r.tax || 0), 0);
  const totalPnL = totalReturn - totalInvestment - totalFees;

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-gradient-primary">股票交易紀錄</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user?.email}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-muted-foreground">
                    {isAdmin ? '管理員' : '交易員'}
                  </p>
                  {isAdmin && (
                    <Badge variant="outline" className="bg-gradient-primary text-white border-0 text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              className="hover:bg-accent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              登出
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="trading" className="flex items-center space-x-2">
              <LayoutDashboard className="h-4 w-4" />
              <span>交易紀錄</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>系統管理</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="trading" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">總投資金額</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient-primary">${totalInvestment.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    累計投入資金
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">總損益</CardTitle>
                  {totalPnL >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ${totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    整體投資表現
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">交易筆數</CardTitle>
                  <BarChart3 className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient-primary">{records.length}</div>
                  <p className="text-xs text-muted-foreground">
                    總交易次數
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Trading Records */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>交易紀錄</CardTitle>
                    <CardDescription>管理您的股票買賣紀錄</CardDescription>
                  </div>
                  <Button 
                    onClick={() => {
                      setEditingRecord(null);
                      setShowForm(true);
                    }}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    新增交易
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {records.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>還沒有交易紀錄</p>
                    <p className="text-sm">點擊「新增交易」開始記錄您的投資</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>日期</TableHead>
                        <TableHead>股票代號</TableHead>
                        <TableHead>股票名稱</TableHead>
                        <TableHead>類型</TableHead>
                        <TableHead>數量</TableHead>
                        <TableHead>價格</TableHead>
                        <TableHead>損益</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{new Date(record.trade_date).toLocaleDateString('zh-TW')}</TableCell>
                          <TableCell className="font-medium">{record.stock_symbol}</TableCell>
                          <TableCell>{record.stock_name || '-'}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={record.transaction_type === 'buy' ? 'default' : 'secondary'}
                              className={record.transaction_type === 'buy' ? 'bg-success' : 'bg-destructive'}
                            >
                              {record.transaction_type === 'buy' ? '買入' : '賣出'}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.quantity.toLocaleString()}</TableCell>
                          <TableCell>${record.price.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={`font-medium ${
                              record.transaction_type === 'buy' 
                                ? 'text-destructive' 
                                : 'text-success'
                            }`}>
                              {record.transaction_type === 'buy' ? '-' : '+'}${(record.quantity * record.price + (record.commission || 0) + (record.tax || 0)).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingRecord(record);
                                  setShowForm(true);
                                }}
                                className="hover:bg-accent"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>確認刪除</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      確定要刪除這筆交易紀錄嗎？此操作無法復原。
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>取消</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteRecord(record.id)}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      刪除
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin">
              <AdminDashboard />
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Trading Record Form Modal */}
      {showForm && (
        <TradingRecordForm
          record={editingRecord}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingRecord(null);
          }}
        />
      )}
    </div>
  );
}