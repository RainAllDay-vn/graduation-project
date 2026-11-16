import { useState, useEffect } from 'react'
import type {
  CreateExternalSourceRequest,
  SourceAuthType,
  SourceType,
} from '@/api/sources'
import { Button } from '@/components/ui/button'
import { X, Loader2, Globe, Radio } from 'lucide-react'

export interface AddSourceModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateExternalSourceRequest) => void | Promise<void>
  isLoading?: boolean
  locale?: 'vi' | 'en'
}

export function AddSourceModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  locale = 'vi',
}: AddSourceModalProps) {
  const isEn = locale === 'en'

  const [type, setType] = useState<SourceType>('REST')
  const [name, setName] = useState('')
  const [endpointUrl, setEndpointUrl] = useState('')
  const [pollIntervalSeconds, setPollIntervalSeconds] = useState(60)
  const [authType, setAuthType] = useState<SourceAuthType>('NONE')
  const [authToken, setAuthToken] = useState('')
  const [brokerAddress, setBrokerAddress] = useState('')
  const [topic, setTopic] = useState('')
  const [consumerGroup, setConsumerGroup] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setType('REST')
      setName('')
      setEndpointUrl('')
      setPollIntervalSeconds(60)
      setAuthType('NONE')
      setAuthToken('')
      setBrokerAddress('')
      setTopic('')
      setConsumerGroup('')
      setErrorMsg('')
    }
  }, [isOpen])

  // ESC to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isLoading, onClose])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!name.trim()) {
      setErrorMsg(isEn ? 'Source name is required.' : 'Vui lòng nhập tên nguồn.')
      return
    }

    if (type === 'REST') {
      if (!endpointUrl.trim()) {
        setErrorMsg(
          isEn ? 'Endpoint URL is required.' : 'Vui lòng nhập địa chỉ URL endpoint.'
        )
        return
      }
      onSubmit({
        name: name.trim(),
        type: 'REST',
        endpointUrl: endpointUrl.trim(),
        pollIntervalSeconds: Number(pollIntervalSeconds) || 60,
        authType,
        authToken: authType !== 'NONE' ? authToken.trim() : undefined,
      })
    } else {
      if (!brokerAddress.trim()) {
        setErrorMsg(
          isEn ? 'Broker address is required.' : 'Vui lòng nhập địa chỉ Broker.'
        )
        return
      }
      if (!topic.trim()) {
        setErrorMsg(isEn ? 'Topic is required.' : 'Vui lòng nhập tên topic.')
        return
      }
      onSubmit({
        name: name.trim(),
        type: 'MQ',
        brokerAddress: brokerAddress.trim(),
        topic: topic.trim(),
        consumerGroup: consumerGroup.trim() || undefined,
      })
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-source-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] dark:border-[#1e293b]">
          <div>
            <h3 id="add-source-modal-title" className="text-[17px] font-extrabold text-[#0f172a] dark:text-[#f8fafc] m-0">
              {isEn ? 'Add Data Source' : 'Thêm nguồn dữ liệu'}
            </h3>
            <p className="text-[12px] text-[#64748b] dark:text-[#94a3b8] mt-0.5 m-0">
              {isEn
                ? 'Connect third-party source · one-way read-only ingestion'
                : 'Kết nối hệ thống nguồn bên thứ ba · dữ liệu chỉ đồng bộ một chiều'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-[#64748b] hover:text-[#0f172a] dark:text-[#94a3b8] dark:hover:text-[#f8fafc] rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg text-rose-700 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          {/* Type Selector (Radio Cards) */}
          <div>
            <label className="block font-mono font-extrabold text-[10px] tracking-[0.12em] text-[#64748b] dark:text-[#94a3b8] mb-2 uppercase">
              {isEn ? 'CONNECTION TYPE' : 'KIỂU KẾT NỐI'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('REST')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                  type === 'REST'
                    ? 'border-[#1d4ed8] bg-blue-50/50 dark:bg-blue-950/30 text-[#1d4ed8]'
                    : 'border-[#cbd5e1] dark:border-[#334155] bg-transparent text-[#64748b] dark:text-[#94a3b8] hover:border-[#94a3b8]'
                }`}
              >
                <Globe className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[13px] font-bold text-[#0f172a] dark:text-[#f8fafc]">
                    REST API
                  </div>
                  <div className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-0.5">
                    {isEn ? 'Periodic polling' : 'Kéo dữ liệu định kỳ'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('MQ')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                  type === 'MQ'
                    ? 'border-[#1d4ed8] bg-blue-50/50 dark:bg-blue-950/30 text-[#1d4ed8]'
                    : 'border-[#cbd5e1] dark:border-[#334155] bg-transparent text-[#64748b] dark:text-[#94a3b8] hover:border-[#94a3b8]'
                }`}
              >
                <Radio className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[13px] font-bold text-[#0f172a] dark:text-[#f8fafc]">
                    Message Queue
                  </div>
                  <div className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-0.5">
                    {isEn ? 'Kafka / MQ stream' : 'Luồng Kafka / MQ'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Source Name */}
          <div>
            <label className="block font-mono font-extrabold text-[10px] tracking-[0.12em] text-[#64748b] dark:text-[#94a3b8] mb-1.5 uppercase">
              {isEn ? 'SOURCE NAME' : 'TÊN NGUỒN'} *
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? 'e.g. Zabbix Production' : 'Ví dụ: Zabbix NOC Miền Bắc'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-[#0b0f19] text-[13px] text-[#0f172a] dark:text-[#f8fafc] focus:outline-hidden focus:border-[#1d4ed8] transition-colors"
            />
          </div>

          {/* Conditional REST Form Fields */}
          {type === 'REST' ? (
            <>
              <div>
                <label className="block font-mono font-extrabold text-[10px] tracking-[0.12em] text-[#64748b] dark:text-[#94a3b8] mb-1.5 uppercase">
                  {isEn ? 'ENDPOINT URL' : 'ĐỊA CHỈ URL ENDPOINT'} *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://api.system.internal/v1"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  className="w-full h-9 px-3 font-mono rounded-lg border border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-[#0b0f19] text-[12.5px] text-[#0f172a] dark:text-[#f8fafc] focus:outline-hidden focus:border-[#1d4ed8] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono font-extrabold text-[10px] tracking-[0.12em] text-[#64748b] dark:text-[#94a3b8] mb-1.5 uppercase">
                    {isEn ? 'POLL INTERVAL (SEC)' : 'CHU KỲ (GIÂY)'}
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={86400}
                    value={pollIntervalSeconds}
                    onChange={(e) => setPollIntervalSeconds(Number(e.target.value))}
                    className="w-full h-9 px-3 font-mono rounded-lg border border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-[#0b0f19] text-[12.5px] text-[#0f172a] dark:text-[#f8fafc] focus:outline-hidden focus:border-[#1d4ed8] transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-mono font-extrabold text-[10px] tracking-[0.12em] text-[#64748b] dark:text-[#94a3b8] mb-1.5 uppercase">
                    {isEn ? 'AUTHENTICATION' : 'XÁC THỰC'}
                  </label>
                  <select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value as SourceAuthType)}
                    className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-[#0b0f19] text-[12.5px] text-[#0f172a] dark:text-[#f8fafc] focus:outline-hidden focus:border-[#1d4ed8] transition-colors"
                  >
                    <option value="NONE">{isEn ? 'None' : 'Không có'}</option>
                    <option value="BEARER_TOKEN">Bearer Token</option>
                    <option value="API_KEY">API Key</option>
                  </select>
                </div>
              </div>

              {authType !== 'NONE' && (
                <div>
                  <label className="block font-mono font-extrabold text-[10px] tracking-[0.12em] text-[#64748b] dark:text-[#94a3b8] mb-1.5 uppercase">
                    {isEn ? 'TOKEN / KEY' : 'MÃ TOKEN / KHÓA'}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    className="w-full h-9 px-3 font-mono rounded-lg border border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-[#0b0f19] text-[12.5px] text-[#0f172a] dark:text-[#f8fafc] focus:outline-hidden focus:border-[#1d4ed8] transition-colors"
                  />
                </div>
              )}
            </>
          ) : (
            /* Conditional MQ Form Fields */
            <>
              <div>
                <label className="block font-mono font-extrabold text-[10px] tracking-[0.12em] text-[#64748b] dark:text-[#94a3b8] mb-1.5 uppercase">
                  {isEn ? 'BROKER ADDRESS' : 'ĐỊA CHỈ BROKER'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="kafka-cluster.internal:9092"
                  value={brokerAddress}
                  onChange={(e) => setBrokerAddress(e.target.value)}
                  className="w-full h-9 px-3 font-mono rounded-lg border border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-[#0b0f19] text-[12.5px] text-[#0f172a] dark:text-[#f8fafc] focus:outline-hidden focus:border-[#1d4ed8] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono font-extrabold text-[10px] tracking-[0.12em] text-[#64748b] dark:text-[#94a3b8] mb-1.5 uppercase">
                    {isEn ? 'TOPIC' : 'TÊN TOPIC'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="netflow.events"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full h-9 px-3 font-mono rounded-lg border border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-[#0b0f19] text-[12.5px] text-[#0f172a] dark:text-[#f8fafc] focus:outline-hidden focus:border-[#1d4ed8] transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-mono font-extrabold text-[10px] tracking-[0.12em] text-[#64748b] dark:text-[#94a3b8] mb-1.5 uppercase">
                    {isEn ? 'CONSUMER GROUP' : 'NHÓM ĐỌC'}
                  </label>
                  <input
                    type="text"
                    placeholder="noc-consumer-prod"
                    value={consumerGroup}
                    onChange={(e) => setConsumerGroup(e.target.value)}
                    className="w-full h-9 px-3 font-mono rounded-lg border border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-[#0b0f19] text-[12.5px] text-[#0f172a] dark:text-[#f8fafc] focus:outline-hidden focus:border-[#1d4ed8] transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2e8f0] dark:border-[#1e293b]">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={onClose}
              className="h-9 px-4 text-xs font-semibold text-[#64748b] dark:text-[#94a3b8] border-[#cbd5e1] dark:border-[#334155] hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] cursor-pointer"
            >
              {isEn ? 'Cancel' : 'Hủy'}
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-9 px-4 text-xs font-bold bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEn ? 'Adding…' : 'Đang thêm…'}</span>
                </>
              ) : (
                <span>{isEn ? 'Add Source' : 'Thêm nguồn'}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
