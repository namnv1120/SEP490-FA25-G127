package com.g127.snapbuy.mapper;

import com.g127.snapbuy.dto.request.AccountCreateRequest;
import com.g127.snapbuy.dto.request.AccountUpdateRequest;
import com.g127.snapbuy.dto.response.AccountResponse;
import com.g127.snapbuy.entity.Account;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface AccountMapper {

    @Mapping(target = "accountId", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "roles", ignore = true)
    Account toEntity(AccountCreateRequest req);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    void updateAccount(@MappingTarget Account account, AccountUpdateRequest req);

    @Mapping(target = "id", expression = "java(account.getAccountId() != null ? account.getAccountId().toString() : null)")
    @Mapping(target = "roles", expression = "java(account.getRoles() != null ? account.getRoles().stream().map(r -> r.getRoleName()).toList() : java.util.List.of())")
    @Mapping(target = "active", source = "active")
    AccountResponse toResponse(Account account);
}
