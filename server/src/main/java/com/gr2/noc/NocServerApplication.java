package com.gr2.noc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NocServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(NocServerApplication.class, args);
	}

}
