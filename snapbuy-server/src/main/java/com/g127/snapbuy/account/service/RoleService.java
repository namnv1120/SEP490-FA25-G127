package com.g127.snapbuy.account.service;

import com.g127.snapbuy.account.dto.request.RoleCreateRequest;
import com.g127.snapbuy.account.dto.request.RoleUpdateRequest;
import com.g127.snapbuy.common.response.PageResponse;
import com.g127.snapbuy.account.dto.response.RoleResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoleService {

    RoleResponse createRole(RoleCreateRequest req);

    List<RoleResponse> getAllRoles(Optional<Boolean> activeFilter);

    RoleResponse getRoleById(UUID roleId);

    RoleResponse updateRole(UUID roleId, RoleUpdateRequest req);

    void deleteRole(UUID roleId);

    RoleResponse toggleRoleStatus(UUID roleId);

    PageResponse<RoleResponse> searchRolesPaged(String keyword, Boolean active, Pageable pageable);
}
