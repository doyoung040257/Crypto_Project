import styles from "./Main.module.css";
import CoinChartSection from "./Content/CoinChartSection";
import CoinListSection from "./Content/CoinListSection";
import LoginSection from "./Content/LoginSection";
import NewsSection from "./Content/NewsSection";

export default function Main() {
    
    return (
        <div className={styles.body}>
            <div className={styles.top}>
                <div className={styles.coinLable}>
                    {/* <label>BTC:$87,506.50 ▲ 0.04%</label>
                    <label>ETH: $2,967.71 ▲ 0.11%</label>
                    <label>김프: ▲ 1.04% 1,342,619원</label> */}
                </div>
            </div>
            <div className={styles.middle}>
                <div className={styles.left}>
                    <div className={styles.News}>
                        <NewsSection/>
                    </div>
                    <div className={styles.Coin}>
                        <CoinChartSection/>
                    </div>    
                </div>
                <div style={{ width: '1px',
                              backgroundColor: '#dee2e6',
                              height: '600px',
                              visibility: 'visible',
                              border: 'none',
                              padding: '0',
                              margin: '0'
                              }}></div>
                <div className={styles.right}>
                    <div className={styles.Login}>
                        <LoginSection/>
                    </div>
                    <div className={styles.coinList}>
                        <CoinListSection/>
                    </div>
                </div>
            </div>
        </div>
    );
}
