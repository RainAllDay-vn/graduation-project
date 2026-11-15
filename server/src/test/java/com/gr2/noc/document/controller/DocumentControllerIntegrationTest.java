package com.gr2.noc.document.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import com.jayway.jsonpath.JsonPath;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.lang.NonNull;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser
@Transactional
class DocumentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @TempDir
    static Path tempDir;

    @DynamicPropertySource
    static void registerStorageDir(DynamicPropertyRegistry registry) {
        registry.add("app.documents.storage-dir", () -> tempDir.toString());
    }

    @NonNull
    private MockMultipartFile mdFile(String fileName, String content) {
        return new MockMultipartFile("file", fileName, "text/markdown",
                content.getBytes(StandardCharsets.UTF_8));
    }

    @NonNull
    private MockMultipartFile csvFile(String fileName, String content) {
        return new MockMultipartFile("file", fileName, "text/csv",
                content.getBytes(StandardCharsets.UTF_8));
    }

    private MvcResult upload(String title, String fileName, String content) throws Exception {
        return mockMvc.perform(multipart("/api/documents")
                        .file(mdFile(fileName, content))
                        .param("title", title))
                .andExpect(status().isCreated())
                .andReturn();
    }

    private String readJsonString(MvcResult result, String pointer) throws Exception {
        return JsonPath.read(result.getResponse().getContentAsString(), pointer);
    }

    private int readJsonInt(MvcResult result, String pointer) throws Exception {
        return JsonPath.read(result.getResponse().getContentAsString(), pointer);
    }

    @Nested
    @DisplayName("GET /api/documents")
    class GetDocumentsTests {

        @Test
        @DisplayName("Should list uploaded documents ordered by newest first")
        void shouldListUploadedDocuments() throws Exception {
            upload("Danh mục kiểm thử Alpha", "quy-trinh-a.md", "# A");
            upload("Danh mục kiểm thử Beta", "quy-trinh-b.md", "# B");

            mockMvc.perform(get("/api/documents").param("q", "Danh mục kiểm thử"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].title", is("Danh mục kiểm thử Beta")))
                    .andExpect(jsonPath("$[1].title", is("Danh mục kiểm thử Alpha")));
        }

        @Test
        @DisplayName("Should filter documents by free-text query on title")
        void shouldFilterByQuery() throws Exception {
            upload("Quy trình xử lý quang gamma", "quang.md", "# Quang");
            upload("Sổ tay vận hành BGP delta", "bgp.md", "# BGP");

            mockMvc.perform(get("/api/documents").param("q", "gamma"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].title", is("Quy trình xử lý quang gamma")));
        }

        @Test
        @DisplayName("Should filter documents by semantic type, status and source")
        void shouldFilterByTypeStatusSource() throws Exception {
            mockMvc.perform(multipart("/api/documents")
                            .file(mdFile("sop.md", "# SOP epsilon"))
                            .param("title", "SOP vận hành epsilon")
                            .param("docType", "OPERATION_RUNBOOK")
                            .param("source", "CONFLUENCE"))
                    .andExpect(status().isCreated());

            upload("Tài liệu wiki zeta", "wiki.md", "# Wiki");

            mockMvc.perform(get("/api/documents")
                            .param("q", "epsilon")
                            .param("type", "OPERATION_RUNBOOK")
                            .param("status", "READY")
                            .param("source", "CONFLUENCE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].docType", is("OPERATION_RUNBOOK")))
                    .andExpect(jsonPath("$[0].source", is("CONFLUENCE")));
        }

        @Test
        @DisplayName("Should return FAILED documents excluded from READY filter")
        void shouldExcludeFailedFromReadyFilter() throws Exception {
            upload("Tài liệu hợp lệ eta", "hop-le.md", "# OK");

            mockMvc.perform(multipart("/api/documents")
                            .file(csvFile("danh-muc.csv", "col1,col2\n1,2"))
                            .param("title", "Danh mục CSV theta"))
                    .andExpect(status().isCreated());

            mockMvc.perform(get("/api/documents").param("q", "eta").param("status", "READY"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].indexingStatus", is("READY")));

            mockMvc.perform(get("/api/documents").param("q", "theta").param("status", "FAILED"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].statusReason", containsString("không được hỗ trợ")));
        }
    }

    @Nested
    @DisplayName("POST /api/documents")
    class UploadTests {

        @Test
        @DisplayName("Should upload markdown file and index it to READY with extracted content")
        void shouldUploadMarkdownAndIndexToReady() throws Exception {
            MvcResult result = upload("Quy trình suy hao quang", "quy-trinh-suy-hao-quang.md",
                    "# Quy trình suy hao quang\n1. Đo OTDR\n2. Hàn nối sợi");

            assertThat(readJsonString(result, "$.id")).startsWith("DOC-");
            assertThat(readJsonString(result, "$.fileFormat")).isEqualTo("MD");
            assertThat(readJsonInt(result, "$.version")).isEqualTo(1);
            assertThat(readJsonString(result, "$.indexingStatus")).isEqualTo("READY");
            assertThat(readJsonString(result, "$.content")).contains("OTDR");
            assertThat(readJsonString(result, "$.docType")).isEqualTo("OPERATION_RUNBOOK");
            assertThat(readJsonString(result, "$.source")).isEqualTo("MANUAL");
        }

        @Test
        @DisplayName("Should store unsupported format as FAILED with status reason")
        void shouldStoreUnsupportedFormatAsFailed() throws Exception {
            mockMvc.perform(multipart("/api/documents")
                            .file(csvFile("du-lieu.csv", "a,b\n1,2"))
                            .param("title", "Dữ liệu CSV"))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.indexingStatus", is("FAILED")))
                    .andExpect(jsonPath("$.fileFormat", is("CSV")))
                    .andExpect(jsonPath("$.statusReason", containsString(".md, .txt")));
        }

        @Test
        @DisplayName("Should return 400 Bad Request when file is missing")
        void shouldReturn400WhenFileMissing() throws Exception {
            mockMvc.perform(multipart("/api/documents").param("title", "Không có tệp"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 Bad Request when title is blank")
        void shouldReturn400WhenTitleBlank() throws Exception {
            mockMvc.perform(multipart("/api/documents")
                            .file(mdFile("no-title.md", "# No title")))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should apply explicit docType and source from the upload form")
        void shouldApplyExplicitDocTypeAndSource() throws Exception {
            mockMvc.perform(multipart("/api/documents")
                            .file(mdFile("spec-vendor.md", "# Vendor spec"))
                            .param("title", "Đặc tả nhà sản xuất")
                            .param("docType", "VENDOR_SPECIFICATION")
                            .param("source", "INTERNAL_WIKI"))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.docType", is("VENDOR_SPECIFICATION")))
                    .andExpect(jsonPath("$.source", is("INTERNAL_WIKI")));
        }
    }

    @Nested
    @DisplayName("GET /api/documents/{id}")
    class GetDocumentByIdTests {

        @Test
        @DisplayName("Should return document details with content and download url")
        void shouldReturnDocumentDetails() throws Exception {
            MvcResult result = upload("Quy trình BGP", "bgp.md", "# BGP flapping");
            String id = readJsonString(result, "$.id");

            mockMvc.perform(get("/api/documents/{id}", id))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is(id)))
                    .andExpect(jsonPath("$.title", is("Quy trình BGP")))
                    .andExpect(jsonPath("$.fileName", is("bgp.md")))
                    .andExpect(jsonPath("$.indexingStatus", is("READY")))
                    .andExpect(jsonPath("$.downloadUrl", is("/api/documents/" + id + "/download")))
                    .andExpect(jsonPath("$.content", containsString("flapping")));
        }

        @Test
        @DisplayName("Should return 404 Not Found when document does not exist")
        void shouldReturn404WhenDocumentNotFound() throws Exception {
            mockMvc.perform(get("/api/documents/{id}", "DOC-NOT-EXIST"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/documents/{id}/download")
    class DownloadTests {

        @Test
        @DisplayName("Should download the stored file with original filename")
        void shouldDownloadStoredFile() throws Exception {
            String content = "# Nội dung tài liệu";
            MvcResult result = upload("Tài liệu tải xuống", "tai-lieu.md", content);
            String id = readJsonString(result, "$.id");

            mockMvc.perform(get("/api/documents/{id}/download", id))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Content-Disposition",
                            containsString("tai-lieu.md")))
                    .andExpect(content().bytes(content.getBytes(StandardCharsets.UTF_8)));
        }

        @Test
        @DisplayName("Should return 404 Not Found when document does not exist")
        void shouldReturn404WhenDocumentNotFound() throws Exception {
            mockMvc.perform(get("/api/documents/{id}/download", "DOC-NOT-EXIST"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("PUT /api/documents/{id}/file")
    class ReplaceFileTests {

        @Test
        @DisplayName("Should replace file, bump version and re-index to READY")
        void shouldReplaceFileAndBumpVersion() throws Exception {
            MvcResult result = upload("Quy trình cáp quang", "quy-trinh.md", "# Bản cũ");
            String id = readJsonString(result, "$.id");

            mockMvc.perform(multipart(HttpMethod.PUT, "/api/documents/{id}/file", id)
                            .file(mdFile("quy-trinh.md", "# Bản mới v2")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.version", is(2)))
                    .andExpect(jsonPath("$.indexingStatus", is("READY")))
                    .andExpect(jsonPath("$.content", containsString("Bản mới v2")));

            assertThat(Files.exists(tempDir.resolve("docs").resolve(id).resolve("v1.md")))
                    .as("old version must be kept on storage")
                    .isTrue();
        }

        @Test
        @DisplayName("Should return 404 Not Found when document does not exist")
        void shouldReturn404WhenDocumentNotFound() throws Exception {
            mockMvc.perform(multipart(HttpMethod.PUT, "/api/documents/{id}/file", "DOC-NOT-EXIST")
                            .file(mdFile("new.md", "# New")))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return 400 Bad Request when replacement file is missing")
        void shouldReturn400WhenFileMissing() throws Exception {
            MvcResult result = upload("Quy trình A", "quy-trinh-a.md", "# A");
            String id = readJsonString(result, "$.id");

            mockMvc.perform(multipart(HttpMethod.PUT, "/api/documents/{id}/file", id))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("DELETE /api/documents/{id}")
    class DeleteDocumentTests {

        @Test
        @DisplayName("Should delete document and remove every stored version")
        void shouldDeleteDocumentAndStoredFiles() throws Exception {
            MvcResult result = upload("Quy trình cần xóa", "xoa.md", "# Xóa");
            String id = readJsonString(result, "$.id");
            assertThat(Files.exists(tempDir.resolve("docs").resolve(id).resolve("v1.md"))).isTrue();

            mockMvc.perform(delete("/api/documents/{id}", id))
                    .andExpect(status().isNoContent());

            mockMvc.perform(get("/api/documents/{id}", id))
                    .andExpect(status().isNotFound());
            assertThat(Files.exists(tempDir.resolve("docs").resolve(id)))
                    .as("document folder must be removed from storage")
                    .isFalse();
        }

        @Test
        @DisplayName("Should return 404 Not Found when document does not exist")
        void shouldReturn404WhenDocumentNotFound() throws Exception {
            mockMvc.perform(delete("/api/documents/{id}", "DOC-NOT-EXIST"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Security")
    class SecurityTests {

        @Test
        @WithAnonymousUser
        @DisplayName("Should return 401 Unauthorized for anonymous access")
        void shouldReturn401ForAnonymous() throws Exception {
            mockMvc.perform(get("/api/documents"))
                    .andExpect(status().isUnauthorized());
        }
    }
}
