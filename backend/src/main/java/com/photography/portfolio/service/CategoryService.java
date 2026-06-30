package com.photography.portfolio.service;

import com.photography.portfolio.dto.request.CategoryRequest;
import com.photography.portfolio.dto.request.ReorderRequest;
import com.photography.portfolio.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {

    List<CategoryResponse> getAllCategories();

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    void deleteCategory(Long id);

    void reorderCategories(ReorderRequest request);

}
