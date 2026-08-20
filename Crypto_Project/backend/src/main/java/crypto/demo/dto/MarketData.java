package crypto.demo.dto;

public class MarketData {
    private String marketCap;
    private String volume24h;
    private double priceChange24h;

    // 기본 생성자 (필수)
    public MarketData() {}

    // Getter/Setter는 이전과 동일
    public String getMarketCap() { return marketCap; }
    public void setMarketCap(String marketCap) { this.marketCap = marketCap; }
    public String getVolume24h() { return volume24h; }
    public void setVolume24h(String volume24h) { this.volume24h = volume24h; }
    public double getPriceChange24h() { return priceChange24h; }
    public void setPriceChange24h(double priceChange24h) { this.priceChange24h = priceChange24h; }
}