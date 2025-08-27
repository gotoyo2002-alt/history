import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Shield, BarChart3 } from 'lucide-react';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: "登入失敗",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "登入失敗",
        description: "發生未知錯誤，請稍後再試",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        toast({
          title: "註冊失敗",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "註冊成功",
          description: "請檢查您的電子郵件以確認帳號",
        });
      }
    } catch (error) {
      toast({
        title: "註冊失敗",
        description: "發生未知錯誤，請稍後再試",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light via-background to-accent p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="space-y-6 text-center lg:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-primary">股票交易紀錄平台</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              專業的股票交易管理工具，讓您輕鬆追蹤投資績效
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="financial-card p-4 text-center">
              <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">安全可靠</h3>
              <p className="text-sm text-muted-foreground">資料加密儲存</p>
            </div>
            <div className="financial-card p-4 text-center">
              <BarChart3 className="h-6 w-6 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">數據分析</h3>
              <p className="text-sm text-muted-foreground">績效可視化</p>
            </div>
            <div className="financial-card p-4 text-center">
              <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">交易追蹤</h3>
              <p className="text-sm text-muted-foreground">完整紀錄管理</p>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        <Card className="financial-card">
          <CardHeader className="text-center">
            <CardTitle>開始您的投資之旅</CardTitle>
            <CardDescription>
              登入或註冊開始管理您的股票交易紀錄
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">登入</TabsTrigger>
                <TabsTrigger value="signup">註冊</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">電子郵件</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">密碼</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="請輸入密碼"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full financial-gradient"
                    disabled={loading}
                  >
                    {loading ? "登入中..." : "登入"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">顯示名稱</Label>
                    <Input
                      id="signup-name"
                      placeholder="您的姓名"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">電子郵件</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">密碼</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="至少6個字符"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full financial-gradient"
                    disabled={loading}
                  >
                    {loading ? "註冊中..." : "註冊"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}