package com.helpdesk.repository;

import com.helpdesk.model.PatternLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface PatternLogRepository extends MongoRepository<PatternLog, String> {
    List<PatternLog> findByPatternType(String patternType);
    List<PatternLog> findByCreatedAtBetween(OffsetDateTime start, OffsetDateTime end);
}
