package com.photography.portfolio.mapper;

import com.photography.portfolio.dto.response.PhotoResponse;
import com.photography.portfolio.entity.Photo;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PhotoMapper {

    PhotoResponse toResponse(Photo photo);

    Photo toEntity(PhotoResponse response);

}
