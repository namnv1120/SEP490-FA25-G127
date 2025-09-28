package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.AccountCreateRequest;
import com.g127.snapbuy.dto.request.AccountUpdateRequest;
import com.g127.snapbuy.dto.request.ChangePasswordRequest;
import com.g127.snapbuy.dto.response.AccountResponse;

import java.util.List;
import java.util.UUID;

public interface AccountService {
    AccountResponse createAccount(AccountCreateRequest req);        // Admin -> Shop Owner
    AccountResponse createShopOwner(AccountCreateRequest req);      // alias
    AccountResponse createStaff(AccountCreateRequest req);          // Shop Owner -> Staff

    AccountResponse getMyInfo();
    AccountResponse updateAccount(UUID accountId, AccountUpdateRequest req);
    void deleteAccount(UUID accountId);
    List<AccountResponse> getAccounts();
    AccountResponse getAccount(UUID id);

    AccountResponse changePassword(UUID accountId, ChangePasswordRequest req);
    void changePasswordForCurrentUser(ChangePasswordRequest req);

    AccountResponse assignRole(UUID accountId, UUID roleId);
}
