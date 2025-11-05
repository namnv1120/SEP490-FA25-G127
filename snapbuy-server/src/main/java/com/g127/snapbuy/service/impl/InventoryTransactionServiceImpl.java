package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.response.InventoryTransactionResponse;
import com.g127.snapbuy.entity.InventoryTransaction;
import com.g127.snapbuy.mapper.InventoryTransactionMapper;
import com.g127.snapbuy.repository.InventoryTransactionRepository;
import com.g127.snapbuy.service.InventoryTransactionService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
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
    public Page<InventoryTransactionResponse> list(int page, int size, String sort, Sort.Direction dir, UUID productId, String transactionType, String referenceType, UUID referenceId, LocalDateTime from, LocalDateTime to) {
        Specification<InventoryTransaction> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (productId != null) {
                predicates.add(cb.equal(root.get("product").get("productId"), productId));
            }
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

        Page<InventoryTransaction> pageData = transactionRepository.findAll(
                spec, PageRequest.of(page, Math.max(1, size), dir, sort)
        );
        return pageData.map(mapper::toResponse);
    }
}


