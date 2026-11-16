import type { Meta, StoryObj } from '@storybook/react-vite'
import { SourceHistoryPanel } from './SourceHistoryPanel'
import type { ExternalSourceSummary, SyncRunSummary } from '@/api/sources'

const MOCK_ZABBIX: ExternalSourceSummary = {
  id: 'DS-ZABBIX-01',
  name: 'Zabbix NOC',
  type: 'REST',
  status: 'ACTIVE',
}

const MOCK_NETFLOW: ExternalSourceSummary = {
  id: 'DS-NETFLOW-01',
  name: 'NetFlow Collector',
  type: 'MQ',
  status: 'ACTIVE',
  streamLatencyMs: 1800,
}

const MOCK_CRM: ExternalSourceSummary = {
  id: 'DS-CRM-01',
  name: 'Inventory CRM',
  type: 'REST',
  status: 'ERROR',
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

const meta: Meta<typeof SourceHistoryPanel> = {
  title: 'Sources/SourceHistoryPanel',
  component: SourceHistoryPanel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onResync: { action: 'resync triggered' },
  },
}

export default meta
type Story = StoryObj<typeof SourceHistoryPanel>

export const Default: Story = {
  args: {
    source: MOCK_ZABBIX,
    history: MOCK_ZABBIX_HISTORY,
    locale: 'vi',
  },
}

export const FailedSync: Story = {
  args: {
    source: MOCK_CRM,
    history: MOCK_FAILED_HISTORY,
    locale: 'vi',
  },
}

export const MessageQueue: Story = {
  args: {
    source: MOCK_NETFLOW,
    history: [],
    locale: 'vi',
  },
}

export const ResyncingState: Story = {
  args: {
    source: MOCK_ZABBIX,
    history: MOCK_ZABBIX_HISTORY,
    isResyncing: true,
    locale: 'vi',
  },
}

export const LoadingState: Story = {
  args: {
    source: MOCK_ZABBIX,
    history: [],
    isLoading: true,
    locale: 'vi',
  },
}

export const EnglishLocale: Story = {
  args: {
    source: MOCK_ZABBIX,
    history: MOCK_ZABBIX_HISTORY,
    locale: 'en',
  },
}
