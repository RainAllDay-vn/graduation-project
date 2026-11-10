package com.gr2.noc.incident.repository;

import com.gr2.noc.incident.model.Alarm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlarmRepository extends JpaRepository<Alarm, String> {

    List<Alarm> findByIncidentIdOrderByTimestampDesc(String incidentId);

    List<Alarm> findByDeviceIdOrderByTimestampDesc(String deviceId);

    List<Alarm> findByDeviceIdAndIsCurrentIncidentTrueOrderByTimestampDesc(String deviceId);
}
