package com.fudn.planora.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    @JsonAlias({"email", "username", "account", "identifier"})
    private String email;
    private String password;
}
