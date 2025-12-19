package com.g127.snapbuy.inventory.service.impl;

import com.g127.snapbuy.inventory.dto.response.InventoryTransactionResponse;
import com.g127.snapbuy.common.response.PageResponse;
import com.g127.snapbuy.inventory.entity.InventoryTransaction;
import com.g127.snapbuy.inventory.mapper.InventoryTransactionMapper;
import com.g127.snapbuy.inventory.repository.InventoryTransactionRepository;
import com.g127.snapbuy.inventory.service.InventoryTransactionService;
import com.g127.snapbuy.common.utils.VietnameseUtils;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class InventoryTransactionServiceImpl implements InventoryTransactionService {

    private final InventoryTransactionRepository transactionRepository;
    private final InventoryTransactionMapper mapper;

    @Override
    public java.util.List<InventoryTransactionResponse> getAll() {
        return transactionRepository.findAll(Sort.by(Sort.Direction.DESC, "transactionDate"))
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public PageResponse<InventoryTransactionResponse> list(int page, int size, String sort, Sort.Direction dir, UUID productId, String productName, String transactionType, String referenceType, UUID referenceId, LocalDateTime from, LocalDateTime to) {
        // Xây dựng specification cho bộ lọc database (không bao gồm productName cần xử lý dấu tiếng Việt)
        Specification<InventoryTransaction> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (productId != null) {
                predicates.add(cb.equal(root.get("product").get("productId"), productId));
            }
            // Lọc ProductName chuyển sang Java layer để hỗ trợ dấu tiếng Việt
            if (transactionType != null && !transactionType.isBlank()) {
                predicates.add(cb.equal(root.get("transactionType"), transactionType));
            }
            if (referenceType != null && !referenceType.isBlank()) {
                predicates.add(cb.equal(root.get("referenceType"), referenceType));
            }
            if (referenceId != null) {
                predicates.add(cb.equal(root.get("referenceId"), referenceId));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("transactionDate"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("transactionDate"), to));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // Nếu có productName, chúng ta cần lấy tất cả bản ghi phù hợp và lọc trong Java
        String trimmedProductName = (productName != null && !productName.isBlank()) ? productName.trim() : null;
        
        if (trimmedProductName != null) {
            // Lấy tất cả phù hợp với các tiêu chí khác, sau đó lọc theo productName trong Java
            List<InventoryTransaction> allData = transactionRepository.findAll(
                    spec, Sort.by(dir, sort)
            );
            
            // Lọc theo productName sử dụng VietnameseUtils
            List<InventoryTransaction> filteredData = allData.stream()
                .filter(t -> t.getProduct() != null && 
                    VietnameseUtils.matchesAny(trimmedProductName, 
                        t.getProduct().getProductName(), 
                        t.getProduct().getProductCode()))
                .toList();
            
            // Phân trang thủ công
            int totalElements = filteredData.size();
            int totalPages = (int) Math.ceil((double) totalElements / Math.max(1, size));
            int fromIndex = page * size;
            int toIndex = Math.min(fromIndex + size, totalElements);
            
            List<InventoryTransaction> pagedData = (fromIndex < totalElements) 
                ? filteredData.subList(fromIndex, toIndex) 
                : List.of();
            
            List<InventoryTransactionResponse> content = pagedData.stream()
                    .map(mapper::toResponse)
                    .toList();
            
            return PageResponse.<InventoryTransactionResponse>builder()
                    .content(content)
                    .totalElements(totalElements)
                    .totalPages(totalPages)
                    .size(size)
                    .number(page)
                    .first(page == 0)
                    .last(page >= totalPages - 1)
                    .empty(content.isEmpty())
                    .build();
        }
        
        // Không có bộ lọc productName - sử dụng phân trang database bình thường
        Page<InventoryTransaction> pageData = transactionRepository.findAll(
                spec, PageRequest.of(page, Math.max(1, size), dir, sort)
        );
        
        List<InventoryTransactionResponse> content = pageData.getContent().stream()
                .map(mapper::toResponse)
                .toList();
        
        return PageResponse.<InventoryTransactionResponse>builder()
                .content(content)
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .size(pageData.getSize())
                .number(pageData.getNumber())
                .first(pageData.isFirst())
                .last(pageData.isLast())
                .empty(pageData.isEmpty())
                .build();
    }
}


