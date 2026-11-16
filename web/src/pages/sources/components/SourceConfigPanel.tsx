import { useState } from 'react'
import type {
  ExternalSourceDetails,
  TestConnectionResult,
  UpdateExternalSourceRequest,
} from '@/api/sources'
import { Button } from '@/components/ui/button'
import { formatSyncTime } from './sourceUtils'
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Radio,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'

export interface SourceConfigPanelProps {
  source: ExternalSourceDetails | null
  isLoading?: boolean
  isTestingConnection?: boolean
  testResult?: TestConnectionResult | null
  onTestConnection?: () => void
  onSave?: (updated: UpdateExternalSourceRequest) => void
  onUpdateTokenClick?: () => void
  locale?: 'vi' | 'en'
}

export function SourceConfigPanel({
  source,
  isLoading = false,
  isTestingConnection = false,
  testResult = null,
  onTestConnection,
  onSave,
  onUpdateTokenClick,
  locale = 'vi',
}: SourceConfigPanelProps) {
  const isEn = locale === 'en'
  const isMq = source?.type === 'MQ'
  const [isSaving, setIsSaving] = useState(false)

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#1e293b] rounded-xl overflow-hidden shadow-xs p-5 space-y-4 animate-pulse">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded font-mono" />
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="space-y-3 pt-3">
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded font-mono" />
          <div className="h-10 w-full bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded font-mono" />
          <div className="h-28 w-full bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!source) {
    return (
      <div className="bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#1e293b] rounded-xl overflow-hidden shadow-xs p-8 text-center text-xs text-[#94a3b8] dark:text-[#64748b]">
        {isEn ? 'Select a data source to view configuration.' : 'Chọn một nguồn dữ liệu để xem cấu hình.'}
      </div>
    )
  }

  const isTokenError =
    source.status === 'ERROR' &&
    source.lastSyncMessage?.toLowerCase().includes('token')

  const handleSave = async () => {
    if (!onSave) return
    setIsSaving(true)
    try {
      await onSave({
        endpointUrl: source.endpointUrl,
        pollIntervalSeconds: source.pollIntervalSeconds,
        brokerAddress: source.brokerAddress,
        topic: source.topic,
        consumerGroup: source.consumerGroup,
        fieldMappings: source.fieldMappings,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#1e293b] rounded-xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between font-mono font-extrabold text-[11px] tracking-[0.14em] text-[#64748b] dark:text-[#94a3b8] px-4 py-3.5 border-b border-[#e2e8f0] dark:border-[#1e293b] select-none">
        <span>{isEn ? 'SOURCE CONFIGURATION' : 'CẤU HÌNH NGUỒN'}</span>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Source Name */}
        <div className="text-[16px] font-extrabold text-[#0f172a] dark:text-[#f8fafc]">
          {source.name}
        </div>

        {/* Error Alert Banner if Status is ERROR */}
        {source.status === 'ERROR' && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg p-3 text-[12.5px] text-rose-800 dark:text-rose-300 leading-relaxed flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              {isEn ? (
                <span>
                  Last sync failed at {formatSyncTime(source.lastSyncAt)} —{' '}
                  <span className="font-semibold">{source.lastSyncMessage || 'authentication failed'}</span>.
                  System retries every {Math.round((source.pollIntervalSeconds || 300) / 60)} minutes (attempt {source.retryAttempts || 1}/5).
                </span>
              ) : (
                <span>
                  Lần đồng bộ gần nhất thất bại lúc {formatSyncTime(source.lastSyncAt)} —{' '}
                  <span className="font-semibold">{source.lastSyncMessage || 'lỗi xác thực'}</span>.
                  Hệ thống tự thử lại mỗi {Math.round((source.pollIntervalSeconds || 300) / 60)} phút (đã thử {source.retryAttempts || 1}/5 lần).
                </span>
              )}
            </div>
          </div>
        )}

        {/* Protocol Specific Fields */}
        {!isMq ? (
          /* REST Polling Fields */
          <div className="space-y-3.5">
            <div>
              <div className="font-mono font-extrabold text-[10px] tracking-[0.12em] text-[#64748b] dark:text-[#94a3b8] mb-1.5 uppercase">
                {isEn ? 'ENDPOINT URL' : 'ĐỊA CHỈ'}
              </div>
              <div className="font-mono text-[12.5px] font-semibold text-[#334155] dark:text-[#cbd5e1] bg-[#f8fafc] dark:bg-[#0b0f19] border border-[#e2e8f0] dark:border-[#1e293b] rounded-lg px-3 py-2 select-all break-all">
                {source.endpointUrl || 'https://...'}
              </div>
            </div>

            <div>
              <div className="font-mono font-extrabold text-[10px] tracking-[0.12em] text-[#64748b] dark:text-[#94a3b8] mb-1.5 uppercase">
                {isEn ? 'SYNC METHOD' : 'PHƯƠNG THỨC ĐỒNG BỘ'}
              </div>
              <div className="inline-flex border border-[#cbd5e1] dark:border-[#334155] rounded-lg overflow-hidden p-0.5 bg-[#f8fafc] dark:bg-[#0b0f19]">
                <span className="px-3 py-1 font-bold text-xs rounded-md bg-[#1d4ed8] text-white">
                  Polling
                </span>
                <span className="px-3 py-1 font-semibold text-xs text-[#64748b] dark:text-[#94a3b8]">
                  Messaging
                </span>
              </div>
              <div className="text-[11.5px] text-[#94a3b8] dark:text-[#64748b] mt-1.5">
                {isEn
                  ? `Pulling data every ${source.pollIntervalSeconds || 60} seconds`
                  : `kéo dữ liệu mỗi ${source.pollIntervalSeconds || 60} giây`}
              </div>
            </div>

            {source.authType && source.authType !== 'NONE' && (
              <div>
                <div className="font-mono font-extrabold text-[10px] tracking-[0.12em] text-[#64748b] dark:text-[#94a3b8] mb-1.5 uppercase">
                  {isEn ? 'AUTHENTICATION' : 'XÁC THỰC'}
                </div>
                <div className="font-mono text-[12px] text-[#334155] dark:text-[#cbd5e1] bg-[#f8fafc] dark:bg-[#0b0f19] border border-[#e2e8f0] dark:border-[#1e293b] rounded-lg px-3 py-2 flex items-center justify-between">
                  <span>{source.authType}</span>
                  <span className="text-[#94a3b8] dark:text-[#64748b] font-mono">
                    {source.authTokenMasked || '••••••••'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Message Queue Fields */
          <div className="space-y-3.5">
            <div>
              <div className="font-mono font-extrabold text-[10px] tracking-[0.12em] text-[#64748b] dark:text-[#94a3b8] mb-1.5 uppercase">
                {isEn ? 'BROKER ADDRESS' : 'ĐỊA CHỈ BROKER'}
              </div>
              <div className="font-mono text-[12.5px] font-semibold text-[#334155] dark:text-[#cbd5e1] bg-[#f8fafc] dark:bg-[#0b0f19] border border-[#e2e8f0] dark:border-[#1e293b] rounded-lg px-3 py-2 select-all">
                {source.brokerAddress || 'kafka.internal:9092'}
              </div>
            </div>

            <div>
              <div className="font-mono font-extrabold text-[10px] tracking-[0.12em] text-[#64748b] dark:text-[#94a3b8] mb-1.5 uppercase">
                {isEn ? 'TOPIC / CONSUMER GROUP' : 'TOPIC / NHÓM ĐỌC'}
              </div>
              <div className="font-mono text-[12.5px] font-semibold text-[#334155] dark:text-[#cbd5e1] bg-[#f8fafc] dark:bg-[#0b0f19] border border-[#e2e8f0] dark:border-[#1e293b] rounded-lg px-3 py-2">
                {source.topic || 'topic.name'}
                {source.consumerGroup ? ` · nhóm ${source.consumerGroup}` : ''}
              </div>
            </div>

            <div>
              <div className="font-mono font-extrabold text-[10px] tracking-[0.12em] text-[#64748b] dark:text-[#94a3b8] mb-1.5 uppercase">
                {isEn ? 'SYNC METHOD' : 'PHƯƠNG THỨC ĐỒNG BỘ'}
              </div>
              <div className="inline-flex border border-[#cbd5e1] dark:border-[#334155] rounded-lg overflow-hidden p-0.5 bg-[#f8fafc] dark:bg-[#0b0f19]">
                <span className="px-3 py-1 font-semibold text-xs text-[#64748b] dark:text-[#94a3b8]">
                  Polling
                </span>
                <span className="px-3 py-1 font-bold text-xs rounded-md bg-[#1d4ed8] text-white">
                  Messaging
                </span>
              </div>
              <div className="text-[11.5px] text-[#94a3b8] dark:text-[#64748b] mt-1.5 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#10b981]" />
                <span>
                  {isEn
                    ? 'Continuous stream event ingestion'
                    : 'Luồng dữ liệu liên tục theo sự kiện'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Data Field Mapping Table */}
        <div>
          <div className="font-mono font-extrabold text-[10px] tracking-[0.12em] text-[#64748b] dark:text-[#94a3b8] mb-1.5 uppercase">
            {isEn ? 'FIELD MAPPINGS' : 'ÁNH XẠ TRƯỜNG DỮ LIỆU'}
          </div>

          <div className="border border-[#e2e8f0] dark:border-[#1e293b] rounded-lg overflow-hidden divide-y divide-[#e2e8f0] dark:divide-[#1e293b]">
            {source.fieldMappings && source.fieldMappings.length > 0 ? (
              source.fieldMappings.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 px-3 py-2 text-[12px] bg-white dark:bg-[#0f172a]"
                >
                  <span className="font-mono font-bold text-[11.5px] text-[#334155] dark:text-[#cbd5e1] truncate flex-1">
                    {m.sourceField}
                  </span>

                  <ArrowRight className="w-3.5 h-3.5 text-[#94a3b8] dark:text-[#64748b] shrink-0" />

                  <div className="flex-1 text-right truncate">
                    {m.targetField ? (
                      <span className="font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                        {m.targetField}
                      </span>
                    ) : (
                      <span className="inline-block rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.04em] bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60">
                        {isEn ? 'UNMAPPED' : 'CHƯA ÁNH XẠ'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs text-[#94a3b8] dark:text-[#64748b]">
                {isEn ? 'No field mappings configured.' : 'Chưa có cấu hình ánh xạ trường.'}
              </div>
            )}
          </div>
        </div>

        {/* Inline Test Connection Result Card */}
        {testResult && (
          <div
            className={`rounded-lg p-3 text-[12px] flex items-start gap-2.5 border transition-all ${
              testResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold flex items-center gap-2">
                <span>
                  {testResult.success
                    ? isEn
                      ? 'Connection Successful'
                      : 'Kết nối thành công'
                    : isEn
                    ? 'Connection Failed'
                    : 'Kết nối thất bại'}
                </span>
                {testResult.latencyMs !== undefined && (
                  <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 bg-white/60 dark:bg-black/30 rounded border border-current">
                    {testResult.latencyMs}ms
                  </span>
                )}
              </div>
              <div className="text-[11.5px] mt-0.5 opacity-90">{testResult.message}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-2">
          {/* Test Connection Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isTestingConnection}
            onClick={onTestConnection}
            className="flex-1 h-9 text-xs font-bold text-[#334155] dark:text-[#cbd5e1] bg-white dark:bg-[#1e293b] border-[#cbd5e1] dark:border-[#334155] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] cursor-pointer transition-colors flex items-center justify-center gap-1.5"
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isEn ? 'Testing…' : 'Đang kiểm tra…'}</span>
              </>
            ) : (
              <span>{isEn ? 'Test Connection' : 'Kiểm tra kết nối'}</span>
            )}
          </Button>

          {/* Save Changes or Update Token Button */}
          {isTokenError ? (
            <Button
              type="button"
              size="sm"
              onClick={onUpdateTokenClick || handleSave}
              className="flex-1 h-9 text-xs font-bold bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <span>{isEn ? 'Update Token' : 'Cập nhật token'}</span>
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={isSaving}
              onClick={handleSave}
              className="flex-1 h-9 text-xs font-bold bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEn ? 'Saving…' : 'Đang lưu…'}</span>
                </>
              ) : (
                <span>{isEn ? 'Save Changes' : 'Lưu thay đổi'}</span>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
