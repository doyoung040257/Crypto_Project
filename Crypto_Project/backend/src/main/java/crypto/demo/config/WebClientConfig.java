// backend/src/main/java/crypto/demo/config/WebClientConfig.java

package crypto.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient.Builder webClientBuilder() {
        // DataBufferLimitException (256KB 한계)을 해결하기 위해 최대 버퍼 크기를 10MB로 증가
        final int maxBufferSize = 10 * 1024 * 1024; 
        
        final ExchangeStrategies strategies = ExchangeStrategies.builder()
                // 이 라인이 버퍼 크기를 10MB로 설정합니다.
                .codecs(codecs -> codecs.defaultCodecs().maxInMemorySize(maxBufferSize))
                .build();
        
        // 커스텀 설정을 WebClient.Builder에 적용합니다.
        return WebClient.builder().exchangeStrategies(strategies);
    }
}