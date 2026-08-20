package crypto.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import crypto.demo.Service.ExchangeRateCacheService;
import crypto.demo.Service.ExchangeService;
import crypto.demo.dto.ExchangeRateDTO;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/exchange")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ExchangeController {

    private final ExchangeRateCacheService exchangeRateCacheService;

    private final ExchangeService exchangeService;
  

    @GetMapping("/usd-krw")
    public ExchangeRateDTO usdToKrw() {
        double rate = exchangeRateCacheService.getUsdToKrw();
        return new ExchangeRateDTO(rate); // ✅ DTO 반환 메서드 호출
    }


    @GetMapping("/test-rate")
    public double test() {
        return exchangeRateCacheService.getUsdToKrw();
    }
}       