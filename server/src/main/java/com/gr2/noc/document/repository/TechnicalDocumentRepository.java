package com.gr2.noc.document.repository;

import com.gr2.noc.document.enums.IndexingStatus;
import com.gr2.noc.document.model.TechnicalDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TechnicalDocumentRepository extends JpaRepository<TechnicalDocument, String> {

    List<TechnicalDocument> findAllByOrderByCreatedAtDesc();

    List<TechnicalDocument> findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String title);

    List<TechnicalDocument> findByIndexingStatusOrderByCreatedAtDesc(IndexingStatus status);

    boolean existsByTitleIgnoreCase(String title);
}
