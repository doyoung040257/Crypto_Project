package crypto.demo.dto;

public class AnalysisRequest {
    private String coinId;
    private MarketData marketData;

    // 기본 생성자 (필수)
    public AnalysisRequest() {} 

    // Getter/Setter는 이전과 동일
    public String getCoinId() { return coinId; }
    public void setCoinId(String coinId) { this.coinId = coinId; }
    public MarketData getMarketData() { return marketData; }
    public void setMarketData(MarketData marketData) { this.marketData = marketData; }
}