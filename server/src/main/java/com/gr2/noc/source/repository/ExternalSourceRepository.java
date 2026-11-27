package com.gr2.noc.source.repository;

import com.gr2.noc.source.enums.SourceStatus;
import com.gr2.noc.source.enums.SourceType;
import com.gr2.noc.source.model.ExternalSource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExternalSourceRepository extends JpaRepository<ExternalSource, String> {

    List<ExternalSource> findAllByOrderByCreatedAtAsc();

    List<ExternalSource> findByTypeAndStatusNotOrderByCreatedAtAsc(SourceType type, SourceStatus status);

    boolean existsByNameIgnoreCase(String name);
}
