package com.photography.portfolio.service.impl;

import com.photography.portfolio.dto.response.DashboardAnalyticsResponse;
import com.photography.portfolio.dto.response.EventAnalyticsResponse;
import com.photography.portfolio.dto.response.VisitorResponse;
import com.photography.portfolio.entity.Event;
import com.photography.portfolio.entity.Visitor;
import com.photography.portfolio.exception.ResourceNotFoundException;
import com.photography.portfolio.repository.EventRepository;
import com.photography.portfolio.repository.VisitorRepository;
import com.photography.portfolio.service.VisitorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VisitorServiceImpl implements VisitorService {

    private final VisitorRepository visitorRepository;
    private final EventRepository eventRepository;

    @Override
    @Transactional
    public void trackVisit(Long eventId, String email) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        String normalizedEmail = email.trim().toLowerCase();
        LocalDateTime now = LocalDateTime.now();

        Visitor visitor = visitorRepository.findByEventIdAndEmail(event.getId(), normalizedEmail)
                .orElse(null);

        if (visitor == null) {
            visitor = Visitor.builder()
                    .eventId(event.getId())
                    .email(normalizedEmail)
                    .firstVisit(now)
                    .lastVisit(now)
                    .visitCount(1)
                    .build();
            log.info("Recording new visitor {} for event {}", normalizedEmail, event.getId());
        } else {
            visitor.setVisitCount(visitor.getVisitCount() + 1);
            visitor.setLastVisit(now);
            log.info("Updating visit count for visitor {} on event {} (now {})",
                    normalizedEmail, event.getId(), visitor.getVisitCount());
        }

        visitorRepository.save(visitor);
    }

    @Override
    @Transactional(readOnly = true)
    public EventAnalyticsResponse getEventAnalytics(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        List<Visitor> visitors = visitorRepository.findByEventIdOrderByLastVisitDesc(event.getId());
        long uniqueVisitors = visitors.size();
        long totalViews = visitorRepository.sumVisitCountByEventId(event.getId());

        List<VisitorResponse> visitorResponses = visitors.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return EventAnalyticsResponse.builder()
                .eventId(event.getId())
                .eventTitle(event.getTitle())
                .totalViews(totalViews)
                .uniqueVisitors(uniqueVisitors)
                .visitors(visitorResponses)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardAnalyticsResponse getDashboardAnalytics() {
        long totalGalleryViews = visitorRepository.sumAllVisitCount();
        long uniqueVisitors = visitorRepository.countDistinctEmail();

        return DashboardAnalyticsResponse.builder()
                .totalGalleryViews(totalGalleryViews)
                .uniqueVisitors(uniqueVisitors)
                .build();
    }

    private VisitorResponse toResponse(Visitor v) {
        return VisitorResponse.builder()
                .email(v.getEmail())
                .visitCount(v.getVisitCount())
                .firstVisit(v.getFirstVisit())
                .lastVisit(v.getLastVisit())
                .build();
    }
}
