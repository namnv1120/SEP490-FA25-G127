package com.g127.snapbuy.account.service;

import com.g127.snapbuy.account.dto.request.*;
import com.g127.snapbuy.account.dto.response.AccountResponse;
import com.g127.snapbuy.common.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface AccountService {
    // Admin methods removed - managed in Master DB
    AccountResponse createStaff(AccountCreateRequest req);

    AccountResponse getMyInfo();
    AccountResponse updateAccount(UUID accountId, AccountUpdateRequest req);

    void deleteAccount(UUID accountId);
    List<AccountResponse> getAccounts();
    AccountResponse getAccount(UUID id);

    AccountResponse changePassword(UUID accountId, ChangePasswordRequest req);
    void changePasswordForCurrentUser(ChangePasswordRequest req);

    AccountResponse assignRole(UUID accountId, UUID roleId);
    void unassignRole(UUID accountId, UUID roleId);

    AccountResponse updateStaffByOwner(UUID staffId, StaffOwnerUpdateRequest req);
    AccountResponse updateStaffRolesByOwner(UUID staffId, StaffRoleUpdateRequest req);
    AccountResponse getStaffByIdForOwner(UUID staffId);


    AccountResponse adminUpdateAccount(UUID accountId, AccountUpdateRequest req);

    AccountResponse toggleAccountStatus(UUID accountId);

    List<AccountResponse> getAccountsByRoleName(String roleName);

    List<AccountResponse> searchAccounts(String keyword, Boolean active, String roleName);

    PageResponse<AccountResponse> searchAccountsPaged(String keyword, Boolean active, String roleName,
                                                      Pageable pageable);

    PageResponse<AccountResponse> searchStaffAccountsPaged(String keyword, Boolean active, String roleName,
                                                                                        Pageable pageable);
}
