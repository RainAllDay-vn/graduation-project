import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTheme } from '@/context'
import {
  getSources,
  getSourceById,
  getSyncHistory,
  testConnection,
  resyncFromScratch,
  updateSource,
  createSource,
  type ExternalSourceSummary,
  type ExternalSourceDetails,
  type SyncRunSummary,
  type TestConnectionResult,
  type CreateExternalSourceRequest,
  type UpdateExternalSourceRequest,
} from '@/api/sources'
import {
  SourceListPanel,
  SourceHistoryPanel,
  SourceConfigPanel,
  AddSourceModal,
} from './components'
import { LandingFooter } from '@/pages/_components/LandingFooter'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export interface SourcesViewProps {
  sources: ExternalSourceSummary[]
  selectedId: string | null
  selectedSourceDetails: ExternalSourceDetails | null
  syncHistory: SyncRunSummary[]
  isLoadingSources: boolean
  isLoadingDetails: boolean
  isLoadingHistory: boolean
  isResyncing: boolean
  isTestingConnection: boolean
  testResult: TestConnectionResult | null
  isAddModalOpen: boolean
  isAddingSource: boolean
  locale?: 'vi' | 'en'
  onSelectSource: (source: ExternalSourceSummary) => void
  onTestConnection: () => void
  onResync: () => void
  onSaveSource: (data: UpdateExternalSourceRequest) => void
  onOpenAddModal: () => void
  onCloseAddModal: () => void
  onAddSource: (data: CreateExternalSourceRequest) => void | Promise<void>
}

export function SourcesView({
  sources,
  selectedId,
  selectedSourceDetails,
  syncHistory,
  isLoadingSources,
  isLoadingDetails,
  isLoadingHistory,
  isResyncing,
  isTestingConnection,
  testResult,
  isAddModalOpen,
  isAddingSource,
  locale = 'vi',
  onSelectSource,
  onTestConnection,
  onResync,
  onSaveSource,
  onOpenAddModal,
  onCloseAddModal,
  onAddSource,
}: SourcesViewProps) {
  const isEn = locale === 'en'

  return (
    <div className="flex-1 flex flex-col justify-between w-full min-h-[calc(100vh-60px)]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-6 pb-8">
        {/* Page Top Header matching vp-head */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-[-0.01em] text-[#0f172a] dark:text-[#f8fafc] m-0">
              {isEn ? 'Data Sources' : 'Nguồn dữ liệu'}
            </h1>
            <div className="text-[13px] text-[#64748b] dark:text-[#94a3b8] mt-1.5">
              {isEn
                ? 'Connect third-party source systems · data only syncs one-way into system'
                : 'Kết nối hệ thống nguồn bên thứ ba · dữ liệu chỉ đồng bộ một chiều vào hệ thống'}
            </div>
          </div>

          <Button
            type="button"
            onClick={onOpenAddModal}
            className="h-9 px-4 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{isEn ? 'Add Source' : 'Thêm nguồn'}</span>
          </Button>
        </div>

        {/* Master-Detail 2-Column Grid matching vp-main */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-4 items-start">
          {/* Left Column: Connected Sources & Sync History */}
          <div className="flex flex-col gap-4 min-w-0">
            <SourceListPanel
              sources={sources}
              selectedId={selectedId}
              onSelectSource={onSelectSource}
              isLoading={isLoadingSources}
              locale={locale}
            />

            <SourceHistoryPanel
              source={selectedSourceDetails || sources.find((s) => s.id === selectedId) || null}
              history={syncHistory}
              isResyncing={isResyncing}
              isLoading={isLoadingHistory}
              onResync={onResync}
              locale={locale}
            />
          </div>

          {/* Right Column: Source Configuration Inspector */}
          <div className="min-w-0">
            <SourceConfigPanel
              source={selectedSourceDetails}
              isLoading={isLoadingDetails}
              isTestingConnection={isTestingConnection}
              testResult={testResult}
              onTestConnection={onTestConnection}
              onSave={onSaveSource}
              onUpdateTokenClick={onOpenAddModal}
              locale={locale}
            />
          </div>
        </div>
      </div>

      {/* Add Source Modal Dialog */}
      <AddSourceModal
        isOpen={isAddModalOpen}
        isLoading={isAddingSource}
        onClose={onCloseAddModal}
        onSubmit={onAddSource}
        locale={locale}
      />

      {/* Technical Status Footer */}
      <LandingFooter
        version="v0.4"
        environment="TEST"
        supportContact={isEn ? 'INTERNAL IT' : 'IT NỘI BỘ'}
        locale={locale}
      />
    </div>
  )
}

export default function SourcesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { locale } = useTheme()
  const queryClient = useQueryClient()

  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // 1. Fetch Sources List
  const { data: sources = [], isLoading: isLoadingSources } = useQuery({
    queryKey: ['sources'],
    queryFn: () => getSources(),
    refetchInterval: 5000,
  })

  // Selected Source ID from URL params (defaults to first source once loaded)
  const paramId = searchParams.get('id')
  const selectedId =
    paramId && sources.some((s) => s.id === paramId)
      ? paramId
      : sources.length > 0
      ? sources[0].id
      : null

  // Keep URL search params in sync when defaults apply
  useEffect(() => {
    if (!paramId && selectedId) {
      setSearchParams({ id: selectedId }, { replace: true })
    }
  }, [paramId, selectedId, setSearchParams])

  // Clear connection test result when active source changes
  useEffect(() => {
    setTestResult(null)
  }, [selectedId])

  // 2. Fetch Selected Source Details
  const { data: selectedSourceDetails = null, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['source', selectedId],
    queryFn: () => getSourceById(selectedId!),
    enabled: !!selectedId,
    refetchInterval: 5000,
  })

  // 3. Fetch Sync History for REST sources
  const activeSourceSummary = sources.find((s) => s.id === selectedId)
  const isRestSource = activeSourceSummary?.type === 'REST'

  const { data: syncHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['sourceHistory', selectedId],
    queryFn: () => getSyncHistory(selectedId!),
    enabled: !!selectedId && isRestSource,
    refetchInterval: 5000,
  })

  // 4. Mutations
  const testConnMutation = useMutation({
    mutationFn: (id: string) => testConnection(id),
    onSuccess: (result) => {
      setTestResult(result)
    },
    onError: (err: Error) => {
      setTestResult({
        success: false,
        message: err.message || (locale === 'en' ? 'Connection test failed' : 'Kiểm tra kết nối thất bại'),
      })
    },
  })

  const resyncMutation = useMutation({
    mutationFn: (id: string) => resyncFromScratch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] })
      queryClient.invalidateQueries({ queryKey: ['source', selectedId] })
      queryClient.invalidateQueries({ queryKey: ['sourceHistory', selectedId] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExternalSourceRequest }) =>
      updateSource(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] })
      queryClient.invalidateQueries({ queryKey: ['source', selectedId] })
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateExternalSourceRequest) => createSource(data),
    onSuccess: (newSource) => {
      queryClient.invalidateQueries({ queryKey: ['sources'] })
      setSearchParams({ id: newSource.id })
      setIsAddModalOpen(false)
    },
  })

  const handleSelectSource = (source: ExternalSourceSummary) => {
    setSearchParams({ id: source.id })
  }

  const handleTestConnection = () => {
    if (selectedId) {
      testConnMutation.mutate(selectedId)
    }
  }

  const handleResync = () => {
    if (selectedId) {
      resyncMutation.mutate(selectedId)
    }
  }

  const handleSaveSource = (data: UpdateExternalSourceRequest) => {
    if (selectedId) {
      updateMutation.mutate({ id: selectedId, data })
    }
  }

  const handleAddSource = async (data: CreateExternalSourceRequest) => {
    await createMutation.mutateAsync(data)
  }

  return (
    <SourcesView
      sources={sources}
      selectedId={selectedId}
      selectedSourceDetails={selectedSourceDetails}
      syncHistory={syncHistory}
      isLoadingSources={isLoadingSources}
      isLoadingDetails={isLoadingDetails}
      isLoadingHistory={isLoadingHistory}
      isResyncing={resyncMutation.isPending}
      isTestingConnection={testConnMutation.isPending}
      testResult={testResult}
      isAddModalOpen={isAddModalOpen}
      isAddingSource={createMutation.isPending}
      locale={locale}
      onSelectSource={handleSelectSource}
      onTestConnection={handleTestConnection}
      onResync={handleResync}
      onSaveSource={handleSaveSource}
      onOpenAddModal={() => setIsAddModalOpen(true)}
      onCloseAddModal={() => setIsAddModalOpen(false)}
      onAddSource={handleAddSource}
    />
  )
}
