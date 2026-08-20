package crypto.demo.Service;


import org.springframework.stereotype.Service;


@Service
public class CryptoService {

    // TradingView용 심볼 변환 및 차트 URL 생성


    public String getTradingViewChartUrl(String symbol) {
        if (symbol == null || symbol.isEmpty()) {
            return "";
        }
    

    // 예: BINANCE:BTCUSDT 형태로 변환
        String tradingViewSymbol = "BINANCE:" + symbol.toUpperCase() + "USDT";

        // 실제로는 TradingView Embed URL이나 필요한 JSON 데이터를 반환
        return "https://s.tradingview.com/widgetembed/?symbol=" + tradingViewSymbol + "&interval=1D";
    }
    
}
