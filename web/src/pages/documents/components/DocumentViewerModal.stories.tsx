import type { Meta, StoryObj } from '@storybook/react-vite'
import { DocumentViewerModal } from './DocumentViewerModal'
import type { DocumentDetails } from '@/api/documents'

const mockDetails: DocumentDetails = {
  id: 'SOP-OPTICS-01',
  title: 'Quy trình xử lý sự cố cáp quang và mất tín hiệu RX',
  source: 'INTERNAL_WIKI',
  docType: 'OPERATION_RUNBOOK',
  fileName: 'quy-trinh-xu-ly-su-co-cap-quang.md',
  fileFormat: 'MD',
  fileSizeBytes: 1843200,
  version: 2,
  indexingStatus: 'READY',
  statusReason: null,
  content: `# QUY TRÌNH XỬ LÝ SỰ CỐ CÁP QUANG VÀ MẤT TÍN HIỆU RX (SOP-OPTICS-01)

## 1. PHẠM VI ÁP DỤNG
Quy trình này áp dụng cho toàn thể kỹ sư vận hành mạng NOC thuộc Trung tâm Điều hành Mạng Quốc gia khi phát hiện suy hao công suất quang thu (Rx Power) vượt quá ngưỡng cho phép (-20 dBm) hoặc mất tín hiệu cổng quang (LOS - Loss of Signal) trên các tuyến trục backbone DWDM / IP.

---

## 2. DẤU HIỆU NHẬN BIẾT
- Cảnh báo **ALARM_OPTICAL_LOW_RX** trên Dashboard với mã lỗi \`OPT-ERR-401\`.
- Giao thức định tuyến động BGP lân cận (neighbor) báo trạng thái flapping liên tục.
- Giá trị công suất quang đo được: \`Rx Power < -22.0 dBm\` (ngưỡng bình thường: -10 dBm đến -16 dBm).

---

## 3. CÁC BƯỚC XỬ LÝ SỰ CỐ KHẨN CẤP

### Bước 1: Kiểm tra tình trạng cổng và đo kiểm thông số kỹ thuật
Thực hiện truy cập vào router/switch báo lỗi và chạy lệnh kiểm tra module quang SFP/QSFP:

\`\`\`bash
# Kiểm tra công suất quang cổng TenGigE0/0/0/1
show interfaces TenGigE0/0/0/1 optical-power

# Kiểm tra log chi tiết về tình trạng flapping
show logging | include TenGigE0/0/0/1
\`\`\`

### Bước 2: Đo khoảng cách điểm đứt cáp qua máy OTDR
- Liên hệ bộ phận trạm viễn thông gần nhất yêu cầu phát tín hiệu máy đo OTDR vào sợi quang đang gián đoạn.
- Ghi nhận khoảng cách chính xác từ trạm gốc đến vị trí suy hao / đứt cáp (sai số tối đa ± 15m).

### Bước 3: Điều động đội ứng cứu thông tin cơ động
- Thông báo tọa độ cho tổ cứu hộ cơ động mang theo máy hàn cáp quang chuyên dụng và cáp dự phòng.
- Thi công hàn nối trong hầm cáp hoặc cột treo, bảo đảm chỉ số suy hao mối hàn sau khi nối < 0.05 dB.

### Bước 4: Khôi phục dịch vụ và kiểm tra đồng bộ
- Theo dõi thông số công suất quang Rx tại cả 2 đầu thiết bị trong 15 phút.
- Đảm bảo phiên BGP chuyển về trạng thái **ESTABLISHED** mà không ghi nhận thêm sự cố flapping.

---

## 4. BÁO CÁO SAU XỬ LÝ
- Cập nhật thời gian giải quyết sự cố (MTTR) trên hệ thống vé sự cố NOC.
- Gửi biên bản kỹ thuật kèm biểu đồ OTDR trước và sau xử lý trong vòng 24 giờ.`,
  downloadUrl: '/api/documents/SOP-OPTICS-01/download',
  createdAt: new Date(Date.now() - 604800000).toISOString(),
  updatedAt: new Date(Date.now() - 172800000).toISOString(),
}

const meta: Meta<typeof DocumentViewerModal> = {
  title: 'Documents/DocumentViewerModal',
  component: DocumentViewerModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {
        inline: false,
        iframeHeight: 650,
      },
    },
  },
  tags: ['autodocs'],
  args: {
    isOpen: true,
    document: mockDetails,
    isLoadingContent: false,
    locale: 'vi',
    onClose: () => alert('Modal closed'),
    onDownload: (doc) => alert(`Downloading: ${doc.fileName}`),
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const DefaultVietnamese: Story = {
  args: {
    isOpen: true,
    document: mockDetails,
    isLoadingContent: false,
    locale: 'vi',
    onClose: () => alert('Modal closed'),
    onDownload: (doc) => alert(`Downloading: ${doc.fileName}`),
  },
}

export const English: Story = {
  args: {
    isOpen: true,
    document: mockDetails,
    isLoadingContent: false,
    locale: 'en',
    onClose: () => alert('Modal closed'),
    onDownload: (doc) => alert(`Downloading: ${doc.fileName}`),
  },
}

export const LoadingContent: Story = {
  args: {
    isOpen: true,
    document: {
      ...mockDetails,
      content: null,
    },
    isLoadingContent: true,
    locale: 'vi',
    onClose: () => {},
    onDownload: () => {},
  },
}

export const EmptyContent: Story = {
  args: {
    isOpen: true,
    document: {
      ...mockDetails,
      id: 'DOC-CSV-01',
      title: 'Danh mục thiết bị trạm A',
      fileFormat: 'CSV',
      content: null,
    },
    isLoadingContent: false,
    locale: 'vi',
    onClose: () => {},
    onDownload: () => {},
  },
}
