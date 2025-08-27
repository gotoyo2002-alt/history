import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, Activity, TrendingUp, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  role: 'admin' | 'user';
}

interface SystemStats {
  totalUsers: number;
  totalRecords: number;
  adminUsers: number;
  activeUsers: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalRecords: 0,
    adminUsers: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      
      // Fetch users with their roles
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          email,
          display_name,
          created_at,
          user_roles (role)
        `);

      if (usersError) throw usersError;

      const formattedUsers = usersData?.map(user => ({
        id: user.user_id,
        email: user.email || '',
        display_name: user.display_name || '',
        created_at: user.created_at,
        role: (user.user_roles as any)?.[0]?.role || 'user'
      })) || [];

      setUsers(formattedUsers);

      // Fetch trading records count
      const { count: recordsCount } = await supabase
        .from('trading_records')
        .select('*', { count: 'exact', head: true });

      // Calculate stats
      const totalUsers = formattedUsers.length;
      const adminUsers = formattedUsers.filter(u => u.role === 'admin').length;
      const activeUsers = totalUsers; // For now, all users are considered active

      setStats({
        totalUsers,
        totalRecords: recordsCount || 0,
        adminUsers,
        activeUsers
      });

    } catch (error) {
      console.error('Error fetching system data:', error);
      toast.error('載入系統資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: userId, 
          role: newRole 
        });

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast.success('用戶角色已更新');
      
      // Update stats
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      );
      const adminCount = updatedUsers.filter(u => u.role === 'admin').length;
      setStats(prev => ({ ...prev, adminUsers: adminCount }));

    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('更新用戶角色失敗');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">載入管理資料中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">系統管理</h1>
          <p className="text-muted-foreground mt-2">平台維運與使用者管理</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="bg-gradient-primary text-white border-0">
            管理員權限
          </Badge>
        </div>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總用戶數</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient-primary">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              已註冊用戶
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">交易紀錄</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient-primary">{stats.totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              總交易筆數
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">管理員</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient-primary">{stats.adminUsers}</div>
            <p className="text-xs text-muted-foreground">
              管理員用戶
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活躍用戶</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient-primary">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              近期活躍
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>用戶管理</CardTitle>
          <CardDescription>
            管理平台用戶帳號和權限設定
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用戶</TableHead>
                <TableHead>電子信箱</TableHead>
                <TableHead>註冊日期</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.display_name || '未設定'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('zh-TW')}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.role === 'admin' ? 'default' : 'secondary'}
                      className={user.role === 'admin' ? 'bg-gradient-primary text-white' : ''}
                    >
                      {user.role === 'admin' ? '管理員' : '一般用戶'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value: 'admin' | 'user') => {
                        if (value !== user.role) {
                          updateUserRole(user.id, value);
                        }
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">一般用戶</SelectItem>
                        <SelectItem value="admin">管理員</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              目前沒有用戶資料
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}