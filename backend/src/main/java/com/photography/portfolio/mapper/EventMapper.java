package com.photography.portfolio.mapper;

import com.photography.portfolio.dto.request.CreateEventRequest;
import com.photography.portfolio.dto.request.UpdateEventRequest;
import com.photography.portfolio.dto.response.EventResponse;
import com.photography.portfolio.entity.Event;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface EventMapper {

    /**
     * Map Event → EventResponse.
     * downloadProtected is a derived field set manually in EventServiceImpl.
     * clientDownloadPin (the BCrypt hash) must NEVER appear in any response.
     */
    @Mapping(target = "downloadProtected", ignore = true)
    EventResponse toResponse(Event event);

    /**
     * Map CreateEventRequest → Event.
     * The plain-text PIN from the request is mapped here; EventServiceImpl
     * immediately overwrites it with the BCrypt hash before saving.
     */
    Event toEntity(CreateEventRequest request);

    void updateEventFromRequest(UpdateEventRequest request, @MappingTarget Event event);

}
