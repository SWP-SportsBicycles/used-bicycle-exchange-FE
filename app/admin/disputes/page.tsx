'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  AlertOctagon,
  User,
  MessageSquare,
  ChevronRight,
  Scale,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useLanguage } from '@/lib/language-context'
import { MOCK_DISPUTES, formatVND, DISPUTE_TYPE_LABELS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const statusColors: Record<string, string> = {
  open: 'bg-destructive/20 text-destructive border-destructive/30',
  investigating: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
  resolved_buyer_favor: 'bg-success/20 text-success border-success/30',
  resolved_seller_favor: 'bg-success/20 text-success border-success/30',
  closed: 'bg-muted text-muted-foreground border-border',
}

const statusLabels: Record<string, { vi: string; en: string }> = {
  open: { vi: 'Mở', en: 'Open' },
  investigating: { vi: 'Đang xử lý', en: 'Investigating' },
  resolved_buyer_favor: { vi: 'Giải quyết (Người mua)', en: 'Resolved (Buyer)' },
  resolved_seller_favor: { vi: 'Giải quyết (Người bán)', en: 'Resolved (Seller)' },
  closed: { vi: 'Đã đóng', en: 'Closed' },
}

export default function DisputesPage() {
  const { language } = useLanguage()
  const [disputes, setDisputes] = useState(MOCK_DISPUTES)
  const [selectedDispute, setSelectedDispute] = useState<typeof MOCK_DISPUTES[0] | null>(null)
  const [resolution, setResolution] = useState<'buyer' | 'seller'>('buyer')
  const [resolutionNotes, setResolutionNotes] = useState('')

  const handleResolve = () => {
    if (selectedDispute) {
      setDisputes(prev => prev.map(d => 
        d.id === selectedDispute.id 
          ? { 
              ...d, 
              status: resolution === 'buyer' ? 'resolved_buyer_favor' : 'resolved_seller_favor',
              resolution: resolutionNotes 
            } 
          : d
      ))
      setSelectedDispute(null)
      setResolutionNotes('')
    }
  }

  const activeDisputes = disputes.filter(d => ['open', 'investigating'].includes(d.status))
  const resolvedDisputes = disputes.filter(d => !['open', 'investigating'].includes(d.status))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {language === 'vi' ? 'Quản Lý Tranh Chấp' : 'Dispute Management'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'vi' 
            ? 'Xử lý tranh chấp giữa người mua và người bán' 
            : 'Handle disputes between buyers and sellers'}
        </p>
      </div>

      {/* Decision Matrix Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="h-5 w-5" />
            {language === 'vi' ? 'Ma Trận Quyết Định' : 'Decision Matrix'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div className="space-y-2">
              <p className="font-medium text-success">
                {language === 'vi' ? 'Ưu tiên Người Mua:' : 'Favor Buyer:'}
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• {language === 'vi' ? 'Xe có vấn đề nghiêm trọng không được mô tả' : 'Serious issues not described'}</li>
                <li>• {language === 'vi' ? 'Serial không khớp với đăng ký' : 'Serial does not match registration'}</li>
                <li>• {language === 'vi' ? 'Groupset khác với quảng cáo' : 'Groupset differs from listing'}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-primary">
                {language === 'vi' ? 'Ưu tiên Người Bán:' : 'Favor Seller:'}
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• {language === 'vi' ? 'Người mua đổi ý sau kiểm định đạt' : 'Buyer changes mind after passing inspection'}</li>
                <li>• {language === 'vi' ? 'Vấn đề đã được mô tả rõ trong tin đăng' : 'Issues were clearly described in listing'}</li>
                <li>• {language === 'vi' ? 'Không có bằng chứng hỗ trợ khiếu nại' : 'No evidence supporting the claim'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Disputes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-destructive" />
            {language === 'vi' ? 'Tranh Chấp Đang Xử Lý' : 'Active Disputes'}
          </CardTitle>
          <CardDescription>
            {activeDisputes.length} {language === 'vi' ? 'tranh chấp cần giải quyết' : 'disputes need resolution'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeDisputes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success" />
              <p>{language === 'vi' ? 'Không có tranh chấp đang xử lý' : 'No active disputes'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeDisputes.map((dispute) => (
                <motion.div
                  key={dispute.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-destructive/20 bg-destructive/5"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Dispute Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold">{dispute.listing.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatVND(dispute.listing.price)}
                          </p>
                        </div>
                        <Badge variant="outline" className={cn('text-xs', statusColors[dispute.status])}>
                          {statusLabels[dispute.status][language]}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {DISPUTE_TYPE_LABELS[dispute.type][language]}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(dispute.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      {/* Parties */}
                      <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{language === 'vi' ? 'Người mua' : 'Buyer'}</p>
                            <p className="font-medium">{dispute.buyer.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center">
                            <User className="h-4 w-4 text-success" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{language === 'vi' ? 'Người bán' : 'Seller'}</p>
                            <p className="font-medium">{dispute.seller.name}</p>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="p-3 rounded-lg bg-card border border-border">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm">{dispute.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 lg:flex-none"
                        onClick={() => setSelectedDispute(dispute)}
                      >
                        {language === 'vi' ? 'Giải quyết' : 'Resolve'}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 lg:flex-none"
                        onClick={() => {
                          setDisputes(prev => prev.map(d => 
                            d.id === dispute.id 
                              ? { ...d, status: 'investigating' as const } 
                              : d
                          ))
                        }}
                      >
                        {language === 'vi' ? 'Đang xử lý' : 'Investigating'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolved Disputes */}
      {resolvedDisputes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{language === 'vi' ? 'Tranh Chấp Đã Giải Quyết' : 'Resolved Disputes'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resolvedDisputes.map((dispute) => (
                <div 
                  key={dispute.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {dispute.status === 'resolved_buyer_favor' ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{dispute.listing.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {dispute.buyer.name} vs {dispute.seller.name}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn('text-xs', statusColors[dispute.status])}>
                    {statusLabels[dispute.status][language]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resolution Dialog */}
      <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {language === 'vi' ? 'Giải Quyết Tranh Chấp' : 'Resolve Dispute'}
            </DialogTitle>
            <DialogDescription>
              {language === 'vi' 
                ? 'Chọn bên được ưu tiên và cung cấp lý do quyết định'
                : 'Choose the favored party and provide the decision rationale'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted">
              <p className="font-medium">{selectedDispute?.listing.title}</p>
              <p className="text-sm text-muted-foreground">
                {DISPUTE_TYPE_LABELS[selectedDispute?.type || 'other'][language]}
              </p>
            </div>

            {/* Resolution Choice */}
            <div className="space-y-3">
              <Label>{language === 'vi' ? 'Quyết định' : 'Decision'}</Label>
              <RadioGroup
                value={resolution}
                onValueChange={(v) => setResolution(v as 'buyer' | 'seller')}
                className="grid grid-cols-2 gap-3"
              >
                <Label
                  htmlFor="favor-buyer"
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-colors',
                    resolution === 'buyer'
                      ? 'border-success bg-success/10'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <RadioGroupItem value="buyer" id="favor-buyer" className="sr-only" />
                  <User className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">
                    {language === 'vi' ? 'Ưu tiên Người Mua' : 'Favor Buyer'}
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    {language === 'vi' ? 'Hoàn tiền cho người mua' : 'Refund to buyer'}
                  </span>
                </Label>
                <Label
                  htmlFor="favor-seller"
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-colors',
                    resolution === 'seller'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <RadioGroupItem value="seller" id="favor-seller" className="sr-only" />
                  <User className="h-6 w-6 text-success" />
                  <span className="text-sm font-medium">
                    {language === 'vi' ? 'Ưu tiên Người Bán' : 'Favor Seller'}
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    {language === 'vi' ? 'Giữ tiền cho người bán' : 'Release funds to seller'}
                  </span>
                </Label>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'vi' ? 'Lý do quyết định' : 'Decision rationale'}</Label>
              <Textarea
                placeholder={language === 'vi' 
                  ? 'Giải thích lý do đưa ra quyết định này...'
                  : 'Explain the rationale for this decision...'}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDispute(null)}>
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button onClick={handleResolve} disabled={!resolutionNotes.trim()}>
              {language === 'vi' ? 'Xác nhận quyết định' : 'Confirm Decision'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
