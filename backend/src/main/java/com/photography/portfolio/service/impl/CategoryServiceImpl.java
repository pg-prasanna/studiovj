package com.photography.portfolio.service.impl;

import com.photography.portfolio.dto.request.CategoryRequest;
import com.photography.portfolio.dto.request.ReorderRequest;
import com.photography.portfolio.dto.response.CategoryResponse;
import com.photography.portfolio.entity.Category;
import com.photography.portfolio.exception.ResourceNotFoundException;
import com.photography.portfolio.repository.CategoryRepository;
import com.photography.portfolio.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    private CategoryResponse toResponse(Category c) {
        return CategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .displayOrder(c.getDisplayOrder())
                .build();
    }

    private String slugify(String name) {
        return name.trim().toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-");
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = Category.builder()
                .name(request.getName())
                .slug(slugify(request.getName()))
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .build();
        Category saved = categoryRepository.save(category);
        log.info("Category created: {}", saved.getId());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        if (request.getName() != null) {
            category.setName(request.getName());
            category.setSlug(slugify(request.getName()));
        }
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }
        Category saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        categoryRepository.delete(category);
        log.info("Category deleted: {}", id);
    }

    @Override
    @Transactional
    public void reorderCategories(ReorderRequest request) {
        List<Long> ids = request.getOrderedIds();
        for (int i = 0; i < ids.size(); i++) {
            final int index = i;
            final Long categoryId = ids.get(i);
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
            category.setDisplayOrder(index);
            categoryRepository.save(category);
        }
    }
}
