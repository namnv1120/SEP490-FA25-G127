package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.AccountDto;
import com.g127.snapbuy.dto.request.ChangePasswordRequest;

import java.util.List;
import java.util.UUID;

public interface AccountService {
    AccountDto createAccount(AccountDto dto);
    AccountDto getMyInfo();
    AccountDto updateAccount(UUID accountId, AccountDto dto);
    void deleteAccount(UUID accountId);
    List<AccountDto> getAccounts();
    AccountDto getAccount(UUID id);
    AccountDto changePassword(UUID accountId, ChangePasswordRequest req);
    void changePasswordForCurrentUser(ChangePasswordRequest req);

    AccountDto assignRole(UUID accountId, UUID roleId);
}
