import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Save, X } from 'lucide-react';

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
}

interface TradingRecordFormProps {
  record?: TradingRecord | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TradingRecordForm({ record, onSuccess, onCancel }: TradingRecordFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    trade_date: '',
    stock_symbol: '',
    stock_name: '',
    transaction_type: 'buy' as 'buy' | 'sell',
    quantity: '',
    price: '',
    commission: '',
    tax: '',
    notes: '',
  });

  useEffect(() => {
    if (record) {
      setFormData({
        trade_date: new Date(record.trade_date).toISOString().split('T')[0],
        stock_symbol: record.stock_symbol,
        stock_name: record.stock_name || '',
        transaction_type: record.transaction_type,
        quantity: record.quantity.toString(),
        price: record.price.toString(),
        commission: record.commission?.toString() || '',
        tax: record.tax?.toString() || '',
        notes: record.notes || '',
      });
    } else {
      // Default to today's date for new records
      setFormData(prev => ({
        ...prev,
        trade_date: new Date().toISOString().split('T')[0],
      }));
    }
  }, [record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const recordData = {
        trade_date: formData.trade_date,
        stock_symbol: formData.stock_symbol.toUpperCase(),
        stock_name: formData.stock_name || null,
        transaction_type: formData.transaction_type,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        commission: formData.commission ? parseFloat(formData.commission) : 0,
        tax: formData.tax ? parseFloat(formData.tax) : 0,
        notes: formData.notes || null,
      };

      let error;

      if (record) {
        // Update existing record
        const result = await supabase
          .from('trading_records')
          .update(recordData)
          .eq('id', record.id);
        error = result.error;
      } else {
        // Create new record
        if (!user?.id) throw new Error('User not authenticated');
        const result = await supabase
          .from('trading_records')
          .insert([{ ...recordData, user_id: user.id }]);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: record ? "更新成功" : "新增成功",
        description: record ? "交易紀錄已更新" : "交易紀錄已新增",
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving record:', error);
      toast({
        title: record ? "更新失敗" : "新增失敗",
        description: "無法儲存交易紀錄，請稍後再試",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            {record ? '編輯交易紀錄' : '新增交易紀錄'}
          </DialogTitle>
          <DialogDescription>
            {record ? '修改交易紀錄的詳細資訊' : '輸入新交易的詳細資訊'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trade_date">交易日期 *</Label>
              <Input
                id="trade_date"
                type="date"
                value={formData.trade_date}
                onChange={(e) => handleInputChange('trade_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_type">交易類型 *</Label>
              <Select
                value={formData.transaction_type}
                onValueChange={(value) => handleInputChange('transaction_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">買入</SelectItem>
                  <SelectItem value="sell">賣出</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_symbol">股票代號 *</Label>
              <Input
                id="stock_symbol"
                placeholder="例如：2330"
                value={formData.stock_symbol}
                onChange={(e) => handleInputChange('stock_symbol', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_name">股票名稱</Label>
              <Input
                id="stock_name"
                placeholder="例如：台積電"
                value={formData.stock_name}
                onChange={(e) => handleInputChange('stock_name', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">數量 *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                step="1"
                placeholder="股數"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">價格 *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="每股價格"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commission">手續費</Label>
              <Input
                id="commission"
                type="number"
                min="0"
                step="0.01"
                placeholder="手續費"
                value={formData.commission}
                onChange={(e) => handleInputChange('commission', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax">交易稅</Label>
              <Input
                id="tax"
                type="number"
                min="0"
                step="0.01"
                placeholder="交易稅（賣出時）"
                value={formData.tax}
                onChange={(e) => handleInputChange('tax', e.target.value)}
                disabled={formData.transaction_type === 'buy'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">備註</Label>
            <Textarea
              id="notes"
              placeholder="交易備註..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
            <Button type="submit" disabled={loading} className="financial-gradient">
              <Save className="h-4 w-4 mr-2" />
              {loading ? "儲存中..." : "儲存"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}