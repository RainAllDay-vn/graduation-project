import type { Meta, StoryObj } from '@storybook/react-vite'
import { SourceListPanel } from './SourceListPanel'
import type { ExternalSourceSummary } from '@/api/sources'

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

const meta: Meta<typeof SourceListPanel> = {
  title: 'Sources/SourceListPanel',
  component: SourceListPanel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onSelectSource: { action: 'selected' },
  },
}

export default meta
type Story = StoryObj<typeof SourceListPanel>

export const Default: Story = {
  args: {
    sources: MOCK_SOURCES,
    selectedId: 'DS-ZABBIX-01',
    locale: 'vi',
  },
}

export const QueueSelected: Story = {
  args: {
    sources: MOCK_SOURCES,
    selectedId: 'DS-NETFLOW-01',
    locale: 'vi',
  },
}

export const ErrorSelected: Story = {
  args: {
    sources: MOCK_SOURCES,
    selectedId: 'DS-CRM-01',
    locale: 'vi',
  },
}

export const LoadingState: Story = {
  args: {
    sources: [],
    selectedId: null,
    isLoading: true,
    locale: 'vi',
  },
}

export const EmptyState: Story = {
  args: {
    sources: [],
    selectedId: null,
    isLoading: false,
    locale: 'vi',
  },
}

export const EnglishLocale: Story = {
  args: {
    sources: MOCK_SOURCES,
    selectedId: 'DS-ZABBIX-01',
    locale: 'en',
  },
}
