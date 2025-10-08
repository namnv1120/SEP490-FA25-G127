package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.OrderDetail;
import com.g127.snapbuy.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, UUID> {

    List<OrderDetail> findByOrder(Order order);
}
