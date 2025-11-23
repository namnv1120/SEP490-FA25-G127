package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.*;
import com.g127.snapbuy.dto.response.AccountResponse;

import java.util.List;
import java.util.UUID;

public interface AccountService {
    AccountResponse createAccount(AccountCreateRequest req);
    AccountResponse createShopOwner(AccountCreateRequest req);
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

    com.g127.snapbuy.dto.response.PageResponse<AccountResponse> searchAccountsPaged(String keyword, Boolean active, String roleName,
                                                                                    org.springframework.data.domain.Pageable pageable);

    com.g127.snapbuy.dto.response.PageResponse<AccountResponse> searchStaffAccountsPaged(String keyword, Boolean active, String roleName,
                                                                                        org.springframework.data.domain.Pageable pageable);
}
