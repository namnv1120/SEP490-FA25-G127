package com.g127.snapbuy.mapper;

import com.g127.snapbuy.dto.AccountDto;
import com.g127.snapbuy.entity.Account;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface AccountMapper {

    @Mapping(target = "roles", ignore = true)
    Account toEntity(AccountDto dto);

    @Mapping(target = "id", expression = "java(account.getAccountId() != null ? account.getAccountId().toString() : null)")
    @Mapping(
            target = "roles",
            expression = "java(account.getRoles() != null ? account.getRoles().stream().map(r -> r.getRoleName()).toList() : java.util.List.of())"
    )
    AccountDto toDto(Account account);

    @Mapping(target = "roles", ignore = true)
    void updateAccount(@MappingTarget Account account, AccountDto dto);
}
