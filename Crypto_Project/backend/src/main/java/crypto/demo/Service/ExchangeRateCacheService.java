package crypto.demo.Service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExchangeRateCacheService {

    private final ExchangeService exchangeService;

    // ✅ 전역 환율 캐시
    private double cachedUsdToKrw = 0.0;

    // 서버 시작 시 1회 초기화
    @Scheduled(initialDelay = 0, fixedRate = Long.MAX_VALUE)
    public void init() {
        refreshRate();
    }

    // 5분마다 환율 갱신
    @Scheduled(fixedRate = 300000)
    public void refreshRate() {
        double rate = exchangeService.getUsdToKrw();
        if (rate > 0) {
            cachedUsdToKrw = rate;
            System.out.println("💱 환율 갱신: USD → KRW = " + cachedUsdToKrw);
        }
    }

    // 다른 서비스에서 호출
    public double getUsdToKrw() {
        return cachedUsdToKrw;
    }
}
