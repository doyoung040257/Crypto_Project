import { Link } from "react-router-dom";
import TradingViewChart from "../../../components/TradingView/TradingViewChart";
import styles from "../Main.module.css"

export default function CoinChartSection() {
  return (
    <div>
      <div className={styles.sectionTitle}>
        <label>코인 차트</label>
      </div>

      <div className={styles.coinchart}>
        <TradingViewChart
          symbol="BINANCE:BTCUSDT"
          chartType="area"
        />
      </div>
    </div>
  );
}
