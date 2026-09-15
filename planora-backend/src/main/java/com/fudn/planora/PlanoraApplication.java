package com.fudn.planora;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class PlanoraApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlanoraApplication.class, args);
    }

}
