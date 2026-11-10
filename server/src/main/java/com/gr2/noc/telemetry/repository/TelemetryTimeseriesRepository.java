package com.gr2.noc.telemetry.repository;

import com.gr2.noc.telemetry.model.TelemetryTimeseriesPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface TelemetryTimeseriesRepository extends JpaRepository<TelemetryTimeseriesPoint, Long> {

    List<TelemetryTimeseriesPoint> findByDeviceIdAndMetricNameAndTimestampBetweenOrderByTimestampAsc(
            String deviceId, String metricName, Instant start, Instant end
    );

    List<TelemetryTimeseriesPoint> findByDeviceIdAndTimestampBetweenOrderByTimestampAsc(
            String deviceId, Instant start, Instant end
    );
}
