import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import ProfileMenu from "./ProfileMenu";

export default function Header() {
    const [activeIndex, setActiveIndex] = useState(-1);
    const navigate = useNavigate();
    const { isLoggedIn } = useContext(AuthContext);

    const handleMenuClick = (index, requiresLogin = false, path) => {
        if (requiresLogin && !isLoggedIn) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }
        setActiveIndex(index);
        if (path) navigate(path);
    };


    return (
        <header className={styles.header}>
            <div className={styles.top}>
                <div className={styles.top_left}>
                    <Link
                        to="/"
                        className={`${styles.home} ${activeIndex === -1 ? styles.active : ''}`}
                        onClick={() => setActiveIndex(-1)}
                    >
                        COMPILE
                    </Link>
                    <label>|</label>
                    <span
                        className={`${styles.simul_invest} ${activeIndex === 7 ? styles.simul_invest_active : ''}`}
                        onClick={() => handleMenuClick(7, true, "/simulated_trading")}
                        style={{ cursor: "pointer" }}
                    >
                        모의투자
                    </span>
                </div>

                <div className={styles.top_middle}>
                    <span
                        className={activeIndex === 0 ? styles.active : ''}
                        onClick={() => handleMenuClick(0, true, "/cryptomarketprice")}
                        style={{ cursor: "pointer" }}
                    >
                        시세
                    </span>
                    <span
                        className={activeIndex === 1 ? styles.active : ''}
                        onClick={() => handleMenuClick(1, true, "/analysis")}
                        style={{ cursor: "pointer" }}
                    >
                        분석
                    </span>
                    <span
                        className={activeIndex === 2 ? styles.active : ''}
                        onClick={() => handleMenuClick(2, true, "/compare")}
                        style={{ cursor: "pointer" }}
                    >
                        비교
                    </span>
                    <span
                        className={activeIndex === 3 ? styles.active : ''}
                        onClick={() => handleMenuClick(3, true, "/news")}
                        style={{ cursor: "pointer" }}
                    >
                        뉴스
                    </span>
                    <span
                        className={activeIndex === 6 ? styles.active : ''}
                        onClick={() => handleMenuClick(6, true, "/dictionary")}
                        style={{ cursor: "pointer" }}
                    >
                        코인용어
                    </span>
                </div>

                <div className={styles.top_right}>
                    {isLoggedIn ? (
                        <>
                            <ProfileMenu/>
                        </>
                    ) : (
                        <>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
