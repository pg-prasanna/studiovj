package com.photography.portfolio.mapper;

import com.photography.portfolio.dto.request.CreateAlbumRequest;
import com.photography.portfolio.dto.request.UpdateAlbumRequest;
import com.photography.portfolio.dto.response.AlbumResponse;
import com.photography.portfolio.entity.Album;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AlbumMapper {

    AlbumResponse toResponse(Album album);

    Album toEntity(CreateAlbumRequest request);

    void updateAlbumFromRequest(UpdateAlbumRequest request, @MappingTarget Album album);

}
