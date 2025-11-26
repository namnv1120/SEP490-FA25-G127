package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.entity.PosSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PosSettingsRepository extends JpaRepository<PosSettings, UUID> {
    
    // Lấy settings theo account (chủ cửa hàng)
    Optional<PosSettings> findByAccount(Account account);
    
    // Lấy settings theo accountId
    Optional<PosSettings> findByAccount_AccountId(UUID accountId);
    
    // Lấy settings của chủ cửa hàng (account có role "Chủ cửa hàng")
    @Query("""
        select distinct ps from PosSettings ps
        join ps.account a
        join a.roles r
        where r.roleName = 'Chủ cửa hàng'
        order by ps.updatedDate desc
    """)
    List<PosSettings> findShopOwnerSettingsList();
}

