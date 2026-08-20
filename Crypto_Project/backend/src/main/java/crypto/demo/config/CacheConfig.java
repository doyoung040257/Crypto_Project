// backend/src/main/java/crypto/demo/config/CacheConfig.java

package crypto.demo.config; // 패키지 경로는 환경에 맞게 조정해 주세요.

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching // 💡 이 설정 파일에서 캐싱을 활성화합니다.
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        
        // 🚨 핵심 수정: 비동기 캐시 모드를 true로 설정하여 WebClient(Mono)를 지원합니다.
        cacheManager.setAsyncCacheMode(true); 
        
        return cacheManager;
    }
}