package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.AccountDto;
import java.util.List;
import java.util.UUID;

public interface AccountService {
    AccountDto createAccount(AccountDto dto);
    AccountDto getMyInfo();
    AccountDto updateAccount(UUID accountId, AccountDto dto);
    void deleteAccount(UUID accountId);
    List<AccountDto> getAccounts();
    AccountDto getAccount(UUID id);
    AccountDto changePassword(UUID accountId, String oldPassword, String newPassword);
    AccountDto assignRole(UUID accountId, UUID roleId);
    void changePasswordForCurrentUser(String oldPassword, String newPassword);
}
