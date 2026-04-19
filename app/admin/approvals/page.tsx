'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, 
  X, 
  Eye,
  Clock,
  ExternalLink,
  AlertCircle,
  ChevronDown
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useLanguage } from '@/lib/language-context'
import { MOCK_ADMIN_APPROVALS, formatVND, CITIES } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function ApprovalsPage() {
  const { language } = useLanguage()
  const [approvals, setApprovals] = useState(MOCK_ADMIN_APPROVALS)
  const [selectedApproval, setSelectedApproval] = useState<typeof MOCK_ADMIN_APPROVALS[0] | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'approved' as const } : a
    ))
  }

  const handleReject = () => {
    if (selectedApproval) {
      setApprovals(prev => prev.map(a => 
        a.id === selectedApproval.id 
          ? { ...a, status: 'rejected' as const, reviewNotes: rejectReason } 
          : a
      ))
      setSelectedApproval(null)
      setRejectReason('')
    }
  }

  const pendingApprovals = approvals.filter(a => a.status === 'pending')
  const processedApprovals = approvals.filter(a => a.status !== 'pending')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {language === 'vi' ? 'Duyệt Tin Đăng' : 'Listing Approval'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'vi' 
            ? 'Xét duyệt tin đăng mới và xác minh số serial' 
            : 'Review new listings and verify serial numbers'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingApprovals.length}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'vi' ? 'Chờ duyệt' : 'Pending'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                <Check className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {processedApprovals.filter(a => a.status === 'approved').length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'vi' ? 'Đã duyệt' : 'Approved'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
                <X className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {processedApprovals.filter(a => a.status === 'rejected').length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'vi' ? 'Từ chối' : 'Rejected'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'vi' ? 'Tin Đăng Chờ Duyệt' : 'Pending Listings'}</CardTitle>
          <CardDescription>
            {language === 'vi' 
              ? 'Xác minh số serial và thông tin trước khi duyệt' 
              : 'Verify serial number and information before approval'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Check className="h-12 w-12 mx-auto mb-4 text-success" />
              <p>{language === 'vi' ? 'Không có tin đăng nào chờ duyệt' : 'No pending listings'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((approval) => (
                <Collapsible
                  key={approval.id}
                  open={expandedId === approval.id}
                  onOpenChange={() => setExpandedId(expandedId === approval.id ? null : approval.id)}
                >
                  <div className="rounded-lg border border-border overflow-hidden">
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                        <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img 
                            src={approval.listing.images[0]} 
                            alt={approval.listing.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-medium truncate">{approval.listing.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {approval.listing.brand} {approval.listing.model}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {CITIES.find(c => c.value === approval.listing.city)?.label}
                            </Badge>
                            <span className="text-sm font-semibold text-primary">
                              {formatVND(approval.listing.price)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(approval.submittedAt).toLocaleDateString('vi-VN')}
                          </span>
                          <ChevronDown className={cn(
                            'h-5 w-5 text-muted-foreground transition-transform',
                            expandedId === approval.id && 'rotate-180'
                          )} />
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="p-4 pt-0 border-t border-border bg-muted/30">
                        <div className="grid gap-6 md:grid-cols-2">
                          {/* Serial Verification */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm">
                              {language === 'vi' ? 'Xác Minh Số Serial' : 'Serial Verification'}
                            </h4>
                            <div className="p-3 rounded-lg bg-card border border-border">
                              <p className="text-xs text-muted-foreground mb-1">
                                {language === 'vi' ? 'Số serial đăng ký:' : 'Registered serial:'}
                              </p>
                              <p className="font-mono font-semibold">{approval.listing.serial}</p>
                            </div>
                            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                              <img 
                                src={approval.serialPhotoUrl} 
                                alt="Serial photo"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {language === 'vi' 
                                ? 'So sánh số serial trong ảnh với số đăng ký' 
                                : 'Compare serial in photo with registered number'}
                            </p>
                          </div>

                          {/* Listing Details */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm">
                              {language === 'vi' ? 'Thông Tin Xe' : 'Bike Details'}
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{language === 'vi' ? 'Loại' : 'Category'}</span>
                                <span className="capitalize">{approval.listing.category}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{language === 'vi' ? 'Khung' : 'Frame'}</span>
                                <span>{approval.listing.frameMaterial}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{language === 'vi' ? 'Size' : 'Size'}</span>
                                <span>{approval.listing.frameSize}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Groupset</span>
                                <span>{approval.listing.groupset}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{language === 'vi' ? 'Tình trạng' : 'Condition'}</span>
                                <span className="capitalize">{approval.listing.condition.replace('_', ' ')}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-4">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => setSelectedApproval(approval)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                {language === 'vi' ? 'Từ chối' : 'Reject'}
                              </Button>
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleApprove(approval.id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                {language === 'vi' ? 'Duyệt' : 'Approve'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={!!selectedApproval} onOpenChange={() => setSelectedApproval(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'vi' ? 'Từ Chối Tin Đăng' : 'Reject Listing'}
            </DialogTitle>
            <DialogDescription>
              {language === 'vi' 
                ? 'Vui lòng cung cấp lý do từ chối để người bán có thể chỉnh sửa'
                : 'Please provide a reason so the seller can make corrections'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted">
              <p className="font-medium">{selectedApproval?.listing.title}</p>
              <p className="text-sm text-muted-foreground">
                Serial: {selectedApproval?.listing.serial}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'vi' ? 'Lý do từ chối' : 'Rejection reason'}</Label>
              <Textarea
                placeholder={language === 'vi' 
                  ? 'VD: Số serial không khớp với ảnh...'
                  : 'E.g., Serial number does not match photo...'}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApproval(null)}>
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
              {language === 'vi' ? 'Xác nhận từ chối' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

