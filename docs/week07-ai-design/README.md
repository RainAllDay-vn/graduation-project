# Tuần 7: Thiết Kế Module RAG & AI Root Cause Analysis

Thư mục này chứa tài liệu đặc tả kiến trúc và thiết kế hướng đối tượng cho Module **AI & RAG Root Cause Analysis (RCA)** của hệ thống NOC GR2.

- 📄 **Tài liệu thiết kế chi tiết:** [`ai-root-cause-analysis-design.md`](ai-root-cause-analysis-design.md)

---

## Tóm tắt Kiến trúc Cốt lõi

1. **Mô hình thiết kế:** **Template Method Design Pattern**
   - Lớp trừu tượng `AbstractIncidentInvestigationWorkflow` cố định thuật toán điều tra bất biến qua phương thức `final execute(String incidentId)`.
   - Lớp hiện thực `RAGIncidentInvestigationWorkflow` kết nối Spring AI `ChatClient` và tri thức từ pgvector.
2. **Tầng tri thức vận hành (RAG Knowledge Base):**
   - Lưu trữ metadata SOP/Runbooks trên PostgreSQL (`TechnicalDocument`).
   - Đánh chỉ mục vector 1536 chiều trên `pgvector` (`technical_doc_embeddings`) phục vụ tìm kiếm tương đồng (Cosine Similarity).
3. **Ngữ cảnh đa nguồn:**
   - Tự động gom dữ liệu từ 4 module đã hoàn thiện: `incident` (alarms), `telemetry` (hiệu năng), `hypothesis` (lưu trữ giả thuyết), và `topology` (tâm chấn $1$-hop).
4. **Cơ chế suy luận:**
   - Prompt Engineering đóng vai trò NOC Lead L3 Architect.
   - Bắt buộc trích dẫn bằng chứng xác thực (evidence) và bằng chứng mâu thuẫn (contradicting evidence), chấm điểm khớp (match score %), đề xuất lệnh Quick CLI kiểm tra ngay trên hệ thống.
