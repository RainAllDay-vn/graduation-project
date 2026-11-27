import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { SourcesView } from './index'
import { AppProviders } from '@/context'
import type {
  ExternalSourceDetails,
  ExternalSourceSummary,
  SyncRunSummary,
} from '@/api/sources'

const MOCK_SOURCES: ExternalSourceSummary[] = [
  {
    id: 'DS-ZABBIX-01',
    name: 'Zabbix NOC',
    type: 'REST',
    status: 'ACTIVE',
    endpointUrl: 'https://zabbix.noc.internal/api_jsonrpc.php',
    pollIntervalSeconds: 60,
    lastSyncStatus: 'SUCCESS',
    lastSyncAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
  },
  {
    id: 'DS-NETFLOW-01',
    name: 'NetFlow Collector',
    type: 'MQ',
    status: 'ACTIVE',
    brokerAddress: 'kafka-noc.internal:9092',
    topic: 'netflow.events',
    streamLatencyMs: 1800,
  },
  {
    id: 'DS-CRM-01',
    name: 'Inventory CRM',
    type: 'REST',
    status: 'ERROR',
    endpointUrl: 'https://crm.company.vn/api/v2',
    pollIntervalSeconds: 300,
    lastSyncStatus: 'FAILED',
    lastSyncAt: new Date(Date.now() - 52 * 60 * 1000).toISOString(),
    lastSyncMessage: 'token xác thực hết hạn · lần thử lại 3/5',
  },
  {
    id: 'DS-SYSLOG-01',
    name: 'Syslog Gateway',
    type: 'MQ',
    status: 'ACTIVE',
    brokerAddress: 'kafka-noc.internal:9092',
    topic: 'syslog.raw',
    streamLatencyMs: 900,
  },
]

const MOCK_ZABBIX_DETAILS: ExternalSourceDetails = {
  id: 'DS-ZABBIX-01',
  name: 'Zabbix NOC',
  type: 'REST',
  status: 'ACTIVE',
  endpointUrl: 'https://zabbix.noc.internal/api_jsonrpc.php',
  pollIntervalSeconds: 60,
  lastSyncStatus: 'SUCCESS',
  lastSyncAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
  fieldMappings: [
    { sourceField: 'host.name', targetField: 'Thiết bị · Tên' },
    { sourceField: 'host.ip', targetField: 'Thiết bị · Địa chỉ IP' },
    { sourceField: 'icmp.rtt_ms', targetField: 'Liên kết · Độ trễ' },
    { sourceField: 'snmp.temp_c', targetField: null },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const MOCK_NETFLOW_DETAILS: ExternalSourceDetails = {
  id: 'DS-NETFLOW-01',
  name: 'NetFlow Collector',
  type: 'MQ',
  status: 'ACTIVE',
  brokerAddress: 'kafka-noc.internal:9092',
  topic: 'netflow.events',
  consumerGroup: 'noc-topology-prod',
  streamLatencyMs: 1800,
  fieldMappings: [
    { sourceField: 'flow.src_ip', targetField: 'Liên kết · Điểm đầu' },
    { sourceField: 'flow.dst_ip', targetField: 'Liên kết · Điểm cuối' },
    { sourceField: 'flow.bps', targetField: 'Liên kết · Băng thông' },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const MOCK_CRM_DETAILS: ExternalSourceDetails = {
  id: 'DS-CRM-01',
  name: 'Inventory CRM',
  type: 'REST',
  status: 'ERROR',
  endpointUrl: 'https://crm.company.vn/api/v2',
  pollIntervalSeconds: 300,
  authType: 'BEARER_TOKEN',
  authTokenMasked: '••••90a1',
  retryAttempts: 3,
  lastSyncStatus: 'FAILED',
  lastSyncAt: new Date(Date.now() - 52 * 60 * 1000).toISOString(),
  lastSyncMessage: 'token xác thực hết hạn · lần thử lại 3/5',
  fieldMappings: [
    { sourceField: 'cmdb.host_id', targetField: 'Thiết bị · Mã ngoài' },
    { sourceField: 'cmdb.site', targetField: 'Thiết bị · Khu vực' },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const MOCK_ZABBIX_HISTORY: SyncRunSummary[] = [
  {
    id: 'SYNC-ZBX-01',
    triggerType: 'SCHEDULED',
    status: 'SUCCESS',
    recordsFetched: 12480,
    recordsFailed: 0,
    startedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
  },
  {
    id: 'SYNC-ZBX-02',
    triggerType: 'SCHEDULED',
    status: 'SUCCESS',
    recordsFetched: 12461,
    recordsFailed: 0,
    startedAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
  },
  {
    id: 'SYNC-ZBX-03',
    triggerType: 'SCHEDULED',
    status: 'SUCCESS',
    recordsFetched: 12455,
    recordsFailed: 0,
    startedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
]

const MOCK_FAILED_HISTORY: SyncRunSummary[] = [
  {
    id: 'SYNC-CRM-01',
    triggerType: 'RETRY',
    status: 'FAILED',
    recordsFetched: 0,
    recordsFailed: 0,
    message: 'token xác thực hết hạn · lần thử lại 3/5',
    startedAt: new Date(Date.now() - 52 * 60 * 1000).toISOString(),
  },
  {
    id: 'SYNC-CRM-02',
    triggerType: 'SCHEDULED',
    status: 'SUCCESS',
    recordsFetched: 12390,
    recordsFailed: 0,
    startedAt: new Date(Date.now() - 57 * 60 * 1000).toISOString(),
  },
  {
    id: 'SYNC-CRM-03',
    triggerType: 'SCHEDULED',
    status: 'SUCCESS',
    recordsFetched: 12388,
    recordsFailed: 0,
    startedAt: new Date(Date.now() - 62 * 60 * 1000).toISOString(),
  },
]

const meta: Meta<typeof SourcesView> = {
  title: 'Pages/Sources',
  component: SourcesView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AppProviders>
          <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] text-[#0f172a] dark:text-[#f8fafc] [background-image:radial-gradient(#e2e8f0_1px,transparent_1px)] dark:[background-image:radial-gradient(#1e293b_1px,transparent_1px)] [background-size:26px_26px] font-sans">
            <Story />
          </div>
        </AppProviders>
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const DefaultRest: Story = {
  args: {
    sources: MOCK_SOURCES,
    selectedId: 'DS-ZABBIX-01',
    selectedSourceDetails: MOCK_ZABBIX_DETAILS,
    syncHistory: MOCK_ZABBIX_HISTORY,
    historyPage: 0,
    historyTotalPages: 3,
    historyTotalElements: 24,
    isLiveConnected: true,
    isLoadingSources: false,
    isLoadingDetails: false,
    isLoadingHistory: false,
    isResyncing: false,
    isTestingConnection: false,
    testResult: null,
    isAddModalOpen: false,
    isAddingSource: false,
    locale: 'vi',
    onSelectSource: (s) => console.log('Select source:', s),
    onHistoryPageChange: (p) => console.log('History page:', p),
    onTestConnection: () => console.log('Test connection'),
    onResync: () => console.log('Resync triggered'),
    onSaveSource: (d) => console.log('Save source:', d),
    onOpenAddModal: () => console.log('Open add modal'),
    onCloseAddModal: () => console.log('Close add modal'),
    onAddSource: (d) => console.log('Add source:', d),
  },
}

export const MessageQueueSelected: Story = {
  args: {
    ...DefaultRest.args,
    selectedId: 'DS-NETFLOW-01',
    selectedSourceDetails: MOCK_NETFLOW_DETAILS,
    syncHistory: [],
  },
}

export const ErrorState: Story = {
  args: {
    ...DefaultRest.args,
    selectedId: 'DS-CRM-01',
    selectedSourceDetails: MOCK_CRM_DETAILS,
    syncHistory: MOCK_FAILED_HISTORY,
  },
}

export const ResyncingState: Story = {
  args: {
    ...DefaultRest.args,
    isResyncing: true,
  },
}

export const AddModalOpen: Story = {
  args: {
    ...DefaultRest.args,
    isAddModalOpen: true,
  },
}

export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
  args: {
    ...DefaultRest.args,
  },
}

export const EnglishLocale: Story = {
  args: {
    ...DefaultRest.args,
    locale: 'en',
  },
}
