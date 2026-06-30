package com.photography.portfolio.repository;

import com.photography.portfolio.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("SELECT e FROM Event e WHERE e.status = 'PUBLISHED' ORDER BY e.eventDate DESC")
    List<Event> findAllPublished();

    @Query("SELECT e FROM Event e WHERE e.featured = true ORDER BY e.eventDate DESC")
    List<Event> findAllFeatured();

    @Query("SELECT e FROM Event e WHERE e.eventDate BETWEEN :startDate AND :endDate ORDER BY e.eventDate DESC")
    List<Event> findEventsBetweenDates(LocalDateTime startDate, LocalDateTime endDate);

    Optional<Event> findByTitle(String title);

    List<Event> findByCategoryId(Long categoryId);

}
