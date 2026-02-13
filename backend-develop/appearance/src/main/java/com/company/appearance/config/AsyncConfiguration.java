package com.company.appearance.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Configuration for enabling asynchronous method execution.
 * Used for Google Chat notifications and Google Sheets export.
 */
@Configuration
@EnableAsync
public class AsyncConfiguration {
    // Spring will use default SimpleAsyncTaskExecutor
    // For production, consider configuring a ThreadPoolTaskExecutor
}
