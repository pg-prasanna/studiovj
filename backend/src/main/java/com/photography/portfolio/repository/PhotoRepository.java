package com.photography.portfolio.repository;

import com.photography.portfolio.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {

    @Query("SELECT p FROM Photo p WHERE p.album.id = :albumId ORDER BY p.displayOrder ASC")
    List<Photo> findByAlbumIdOrderByDisplayOrder(@Param("albumId") Long albumId);

    @Query("SELECT p FROM Photo p WHERE p.album.id = :albumId")
    List<Photo> findByAlbumId(@Param("albumId") Long albumId);

    Optional<Photo> findByCloudinaryPublicId(String cloudinaryPublicId);

    @Query("SELECT COUNT(p) FROM Photo p WHERE p.album.id = :albumId")
    Integer countByAlbumId(@Param("albumId") Long albumId);

    @Query("SELECT p FROM Photo p WHERE p.album.event.id = :eventId")
    List<Photo> findAllByEventId(@Param("eventId") Long eventId);

}
