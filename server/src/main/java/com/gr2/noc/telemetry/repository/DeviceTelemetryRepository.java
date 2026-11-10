package com.gr2.noc.telemetry.repository;

import com.gr2.noc.telemetry.model.DeviceTelemetrySnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeviceTelemetryRepository extends JpaRepository<DeviceTelemetrySnapshot, Long> {

    Optional<DeviceTelemetrySnapshot> findTopByDeviceIdOrderByCollectedAtDesc(String deviceId);
}
