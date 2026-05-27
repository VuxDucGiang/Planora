package com.fudn.planora;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.Scanner;

public class BcryptGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("============================================");
        System.out.println("       BCRYPT HASH UTILITY TOOL             ");
        System.out.println("============================================");
        System.out.println("1. Generate BCrypt Hash from raw password");
        System.out.println("2. Verify raw password against BCrypt Hash");
        System.out.println("3. Exit");
        System.out.print("Choose option (1-3): ");
        
        try {
            String option = scanner.nextLine().trim();
            if ("1".equals(option)) {
                System.out.print("Enter raw password to hash: ");
                String raw = scanner.nextLine();
                String hash = encoder.encode(raw);
                System.out.println("\nGenerated BCrypt Hash:\n" + hash);
            } else if ("2".equals(option)) {
                System.out.print("Enter raw password: ");
                String raw = scanner.nextLine();
                System.out.print("Enter BCrypt Hash to compare: ");
                String hash = scanner.nextLine().trim();
                
                try {
                    boolean isMatch = encoder.matches(raw, hash);
                    System.out.println("\nVerification result: " + (isMatch ? "MATCH (VALID) \u2705" : "DOES NOT MATCH (INVALID) \u274C"));
                } catch (Exception e) {
                    System.out.println("\nError: Invalid BCrypt hash format! \u274C (" + e.getMessage() + ")");
                }
            } else {
                System.out.println("Exiting...");
            }
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        } finally {
            scanner.close();
        }
    }
}

