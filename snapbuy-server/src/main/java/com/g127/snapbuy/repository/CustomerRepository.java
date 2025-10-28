package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {

    boolean existsByPhone(String phone);

    @Query("""
        SELECT c FROM Customer c
        WHERE LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(c.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
    List<Customer> searchByKeyword(@Param("keyword") String keyword);

    Customer getCustomerByPhone(String phone);
}

