package com.flowpilot.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
public class DataSeeder implements CommandLineRunner {

    @Override
    public void run(String... args) {
        // No demo data
    }
}
