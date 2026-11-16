import type { Meta, StoryObj } from '@storybook/react-vite'
import { SourceConfigPanel } from './SourceConfigPanel'
import type { ExternalSourceDetails } from '@/api/sources'

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

const meta: Meta<typeof SourceConfigPanel> = {
  title: 'Sources/SourceConfigPanel',
  component: SourceConfigPanel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onTestConnection: { action: 'test connection' },
    onSave: { action: 'save changes' },
    onUpdateTokenClick: { action: 'update token' },
  },
}

export default meta
type Story = StoryObj<typeof SourceConfigPanel>

export const DefaultRest: Story = {
  args: {
    source: MOCK_ZABBIX_DETAILS,
    locale: 'vi',
  },
}

export const MessageQueue: Story = {
  args: {
    source: MOCK_NETFLOW_DETAILS,
    locale: 'vi',
  },
}

export const ErrorState: Story = {
  args: {
    source: MOCK_CRM_DETAILS,
    locale: 'vi',
  },
}

export const WithTestSuccess: Story = {
  args: {
    source: MOCK_ZABBIX_DETAILS,
    testResult: {
      success: true,
      latencyMs: 82,
      message: 'Kết nối thành công tới endpoint API',
    },
    locale: 'vi',
  },
}

export const WithTestFailure: Story = {
  args: {
    source: MOCK_CRM_DETAILS,
    testResult: {
      success: false,
      message: 'HTTP 401 Unauthorized — Bearer token has expired',
    },
    locale: 'vi',
  },
}

export const TestingConnection: Story = {
  args: {
    source: MOCK_ZABBIX_DETAILS,
    isTestingConnection: true,
    locale: 'vi',
  },
}

export const LoadingState: Story = {
  args: {
    source: null,
    isLoading: true,
    locale: 'vi',
  },
}

export const EnglishLocale: Story = {
  args: {
    source: MOCK_ZABBIX_DETAILS,
    locale: 'en',
  },
}
