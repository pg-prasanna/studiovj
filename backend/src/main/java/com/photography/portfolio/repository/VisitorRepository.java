package com.photography.portfolio.repository;

import com.photography.portfolio.entity.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VisitorRepository extends JpaRepository<Visitor, Long> {

    Optional<Visitor> findByEventIdAndEmail(Long eventId, String email);

    List<Visitor> findByEventIdOrderByLastVisitDesc(Long eventId);

    long countByEventId(Long eventId);

    @Query("SELECT COALESCE(SUM(v.visitCount), 0) FROM Visitor v WHERE v.eventId = :eventId")
    long sumVisitCountByEventId(@Param("eventId") Long eventId);

    @Query("SELECT COALESCE(SUM(v.visitCount), 0) FROM Visitor v")
    long sumAllVisitCount();

    @Query("SELECT COUNT(DISTINCT v.email) FROM Visitor v")
    long countDistinctEmail();

}
