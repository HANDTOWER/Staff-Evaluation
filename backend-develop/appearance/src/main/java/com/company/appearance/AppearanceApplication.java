// AppearanceApplication class definition
package com.company.appearance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.context.properties.ConfigurationPropertiesScan;


@ConfigurationPropertiesScan
/**
 * AppearanceApplication provides application functionality.
 */
@SpringBootApplication
public class AppearanceApplication {

	/**
	 * Starts the Spring Boot application.
	 * @param args the args value
	 */
	public static void main(String[] args) {
		SpringApplication.run(AppearanceApplication.class, args);
	}

}
