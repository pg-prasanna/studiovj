package com.photography.portfolio.repository;

import com.photography.portfolio.entity.Album;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlbumRepository extends JpaRepository<Album, Long> {

    @Query("SELECT a FROM Album a WHERE a.event.id = :eventId ORDER BY a.displayOrder ASC")
    List<Album> findByEventIdOrderByDisplayOrder(@Param("eventId") Long eventId);

    @Query("SELECT a FROM Album a WHERE a.event.id = :eventId AND a.albumName = :albumName")
    Optional<Album> findByEventIdAndAlbumName(@Param("eventId") Long eventId, @Param("albumName") String albumName);

    @Query("SELECT COUNT(a) FROM Album a WHERE a.event.id = :eventId")
    Integer countByEventId(@Param("eventId") Long eventId);

}
