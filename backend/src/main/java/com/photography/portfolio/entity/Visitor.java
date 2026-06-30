package com.photography.portfolio.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "visitors", uniqueConstraints = {
        @UniqueConstraint(name = "uq_visitor_event_email", columnNames = {"event_id", "email"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Visitor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(name = "first_visit", nullable = false)
    private LocalDateTime firstVisit;

    @Column(name = "last_visit", nullable = false)
    private LocalDateTime lastVisit;

    @Column(name = "visit_count", nullable = false)
    @Builder.Default
    private Integer visitCount = 1;

}
