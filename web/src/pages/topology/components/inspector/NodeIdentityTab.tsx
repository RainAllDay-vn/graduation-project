import React, { useEffect, useRef, useState } from 'react'
import { Check, Copy, Cpu, Globe, MapPin, Server, Terminal } from 'lucide-react'
import type { DeviceSummary } from '@/api/topology'
import { cn } from '@/lib/utils'

export interface NodeIdentityTabProps {
  node: DeviceSummary
  locale?: 'vi' | 'en'
  className?: string
}

interface QuickCliCommand {
  id: string
  command: string
  description: string
}

function buildQuickCliCommands(node: DeviceSummary, isEn: boolean): QuickCliCommand[] {
  const model = (node.model || '').toLowerCase()
  const ip = node.ipAddress || node.id
  const targetHint = `${node.id} (${ip})`

  if (model.includes('huawei')) {
    return [
      {
        id: 'if-brief',
        command: 'display interface brief',
        description: isEn
          ? `Check physical & protocol link states on ${targetHint}`
          : `Kiểm tra trạng thái cổng vật lý & giao thức trên ${targetHint}`,
      },
      {
        id: 'bgp-peer',
        command: 'display bgp peer',
        description: isEn
          ? `Verify BGP neighbor sessions & uptime on ${node.id}`
          : `Xem trạng thái phiên BGP neighbor trên ${node.id}`,
      },
      {
        id: 'ssh-mgmt',
        command: `ssh noc@${ip}`,
        description: isEn
          ? `Open management CLI session to ${node.id}`
          : `Mở phiên SSH quản trị tới ${node.id}`,
      },
    ]
  }

  if (model.includes('juniper')) {
    return [
      {
        id: 'if-terse',
        command: 'show interfaces terse',
        description: isEn
          ? `Check interface operational & admin states on ${targetHint}`
          : `Kiểm tra trạng thái cổng vật lý & admin trên ${targetHint}`,
      },
      {
        id: 'bgp-sum',
        command: 'show bgp summary',
        description: isEn
          ? `Inspect BGP session states and prefixes on ${node.id}`
          : `Xem tóm tắt phiên BGP trên ${node.id}`,
      },
      {
        id: 'ssh-mgmt',
        command: `ssh noc@${ip}`,
        description: isEn
          ? `Open management CLI session to ${node.id}`
          : `Mở phiên SSH quản trị tới ${node.id}`,
      },
    ]
  }

  if (model.includes('nokia')) {
    return [
      {
        id: 'show-port',
        command: 'show port',
        description: isEn
          ? `Check physical port admin/oper status on ${targetHint}`
          : `Kiểm tra trạng thái cổng vật lý trên ${targetHint}`,
      },
      {
        id: 'bgp-sum',
        command: 'show router bgp summary',
        description: isEn
          ? `Verify BGP peering sessions on ${node.id}`
          : `Kiểm tra phiên BGP peering trên ${node.id}`,
      },
      {
        id: 'ssh-mgmt',
        command: `ssh noc@${ip}`,
        description: isEn
          ? `Open management CLI session to ${node.id}`
          : `Mở phiên SSH quản trị tới ${node.id}`,
      },
    ]
  }

  if (model.includes('cisco') && (model.includes('nexus') || model.includes('93'))) {
    return [
      {
        id: 'if-status',
        command: 'show interface status',
        description: isEn
          ? `Check switch/agg port states & transceiver status on ${targetHint}`
          : `Kiểm tra trạng thái các cổng & module quang trên ${targetHint}`,
      },
      {
        id: 'if-counters',
        command: 'show interface counters errors',
        description: isEn
          ? `Inspect CRC, input/output error counters on ${node.id}`
          : `Kiểm tra bộ đếm lỗi CRC/gói tin trên ${node.id}`,
      },
      {
        id: 'ssh-mgmt',
        command: `ssh noc@${ip}`,
        description: isEn
          ? `Open management CLI session to ${node.id}`
          : `Mở phiên SSH quản trị tới ${node.id}`,
      },
    ]
  }

  if (model.includes('cisco')) {
    return [
      {
        id: 'if-desc',
        command: 'show interfaces description',
        description: isEn
          ? `Check physical trunk status & descriptions on ${targetHint}`
          : `Kiểm tra trạng thái & mô tả các cổng trên ${targetHint}`,
      },
      {
        id: 'bgp-sum',
        command: 'show bgp summary',
        description: isEn
          ? `Inspect BGP neighbor adjacency table on ${node.id}`
          : `Xem bảng phiên kết nối BGP trên ${node.id}`,
      },
      {
        id: 'ssh-mgmt',
        command: `ssh noc@${ip}`,
        description: isEn
          ? `Open management CLI session to ${node.id}`
          : `Mở phiên SSH quản trị tới ${node.id}`,
      },
    ]
  }

  return [
    {
      id: 'ping-check',
      command: `ping -c 4 ${ip}`,
      description: isEn
        ? `Check ICMP reachability to ${node.id}`
        : `Kiểm tra kết nối ICMP tới ${node.id}`,
    },
    {
      id: 'trace-check',
      command: `traceroute ${ip}`,
      description: isEn
        ? `Trace routing path toward ${node.id}`
        : `Kiểm tra tuyến đường gói tin tới ${node.id}`,
    },
    {
      id: 'ssh-mgmt',
      command: `ssh noc@${ip}`,
      description: isEn
        ? `Open management CLI session to ${node.id}`
        : `Mở phiên SSH quản trị tới ${node.id}`,
    },
  ]
}

/**
 * Node Identity Tab (Stylebook §5.1 Định danh thiết bị)
 *
 * Displays only real backend fields from DeviceSummary (`model`, `ipAddress`, `site`,
 * `region`, `name`, `accessDeviceCount`) plus contextual 1-click Quick CLI commands.
 */
export const NodeIdentityTab: React.FC<NodeIdentityTabProps> = ({
  node,
  locale = 'vi',
  className,
}) => {
  const isEn = locale === 'en'
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const copyTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current)
      }
    }
  }, [])

  const handleCopy = async (id: string, text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopiedId(id)
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current)
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopiedId(null)
      }, 1500)
    } catch {
      // Ignore clipboard permission errors in restricted contexts
    }
  }

  const cliCommands = buildQuickCliCommands(node, isEn)
  const hasAccessCluster = (node.accessDeviceCount ?? 0) > 0 || node.layer === 'EXCHANGE'

  return (
    <div
      className={cn('flex-1 flex flex-col gap-3', className)}
      role="tabpanel"
      data-testid="inspector-panel-identity"
    >
      {/* 1. Hardware & Location Metadata Card */}
      <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0b111e] border border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="font-mono text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase">
          {isEn ? 'IDENTITY & LOCATION' : 'THÔNG TIN ĐỊNH DANH & VỊ TRÍ'}
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {node.name && (
            <div className="flex items-start gap-2">
              <Server className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isEn ? 'System Name' : 'Tên hệ thống'}
                </div>
                <div
                  className="font-mono text-[11.5px] font-bold text-slate-900 dark:text-slate-100 break-words"
                  data-testid="identity-name"
                >
                  {node.name}
                </div>
              </div>
            </div>
          )}

          {node.model && (
            <div className="flex items-start gap-2">
              <Cpu className="w-3.5 h-3.5 text-sky-500 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Model
                </div>
                <div
                  className="font-mono text-[11.5px] font-bold text-slate-900 dark:text-slate-100 break-words"
                  data-testid="identity-model"
                >
                  {node.model}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-200/70 dark:border-slate-800">
            {node.ipAddress && (
              <div className="flex items-start gap-1.5 min-w-0">
                <Globe className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isEn ? 'Mgmt IP' : 'IP Quản lý'}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('ip-address', node.ipAddress)}
                    data-testid="identity-ip"
                    title={isEn ? 'Click to copy IP' : 'Bấm để copy IP'}
                    className="font-mono text-[11px] font-bold text-slate-900 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1 cursor-pointer truncate max-w-full"
                  >
                    <span className="truncate">{node.ipAddress}</span>
                    {copiedId === 'ip-address' && (
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {node.site && (
              <div className="flex items-start gap-1.5 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Site / POP
                  </div>
                  <div
                    className="font-mono text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate"
                    data-testid="identity-site"
                  >
                    {node.site}
                  </div>
                </div>
              </div>
            )}
          </div>

          {node.region && (
            <div className="pt-1.5 border-t border-slate-200/70 dark:border-slate-800">
              <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isEn ? 'Region' : 'Khu vực'}
              </div>
              <div
                className="font-sans text-[11.5px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5"
                data-testid="identity-region"
              >
                {node.region}
              </div>
            </div>
          )}

          {hasAccessCluster && (
            <div className="pt-1.5 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isEn ? 'Access Downstream' : 'Cụm Access trực thuộc'}
              </span>
              <span
                className={cn(
                  'font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded',
                  (node.accessErrorCount ?? 0) > 0
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                )}
                data-testid="identity-access-summary"
              >
                +{node.accessDeviceCount ?? 0} ACC
                {(node.accessErrorCount ?? 0) > 0
                  ? ` · ${node.accessErrorCount} ${isEn ? 'err' : 'lỗi'}`
                  : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Quick CLI Diagnostic Commands Box */}
      <div
        className="p-3 rounded-lg bg-slate-50 dark:bg-[#0b111e] border border-slate-200 dark:border-slate-800 space-y-2.5"
        data-testid="quick-cli-section"
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-emerald-500" />
            QUICK CLI
          </span>
          <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500">
            {isEn ? '1-click copy' : 'Copy nhanh'}
          </span>
        </div>

        <div className="space-y-2">
          {cliCommands.map((item) => {
            const isCopied = copiedId === item.id
            return (
              <div
                key={item.id}
                className="rounded-md bg-slate-900 dark:bg-[#070a10] border border-slate-800 p-2.5 space-y-1.5"
                data-testid={`quick-cli-item-${item.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-sans text-[10px] text-slate-400 leading-snug">
                    # {item.description}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.id, item.command)}
                    data-testid={`quick-cli-copy-${item.id}`}
                    className={cn(
                      'shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[9px] font-extrabold tracking-wider transition-colors cursor-pointer',
                      isCopied
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700'
                    )}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-2.5 h-2.5" />
                        {isEn ? 'COPIED' : 'ĐÃ COPY'}
                      </>
                    ) : (
                      <>
                        <Copy className="w-2.5 h-2.5" />
                        COPY
                      </>
                    )}
                  </button>
                </div>

                <code className="block font-mono text-[10.5px] font-semibold text-emerald-400 select-all break-all">
                  {item.command}
                </code>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
