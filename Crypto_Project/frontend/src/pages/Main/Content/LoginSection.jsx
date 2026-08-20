import { useNavigate } from "react-router-dom"
import styles from "../Main.module.css"
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect, useState } from "react";

export default function LoginSection(){

    const navigate = useNavigate();
    const { isLoggedIn, userName, userId, logout } = useContext(AuthContext);

    // 서버에서 가져온 값 저장
    const [balance, setBalance] = useState(0);
    const [totalPortfolio, setTotalPortfolio] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);


    // 총 자산 계산
    const totalAssets = (balance || 0) + (totalPortfolio?.totalEvaluation || 0);

    const handleLogout = () => {
        logout(); // Context에서 sessionStorage 초기화 + 상태 변경
        alert("로그아웃 되었습니다.");
        navigate("/");
    };

    // 로그인 상태일 때 balance와 totalPortfolio 가져오기
    useEffect(() => {
        if (!isLoggedIn || !userId) return;

        const fetchData = async () => {
            try {
                // 1️⃣ balance 조회
                const balanceRes = await fetch(`http://localhost:8080/api/trades/users/${userId}`);
                if(balanceRes.ok){
                    const balanceData = await balanceRes.json();
                    setBalance(balanceData.balance || 0);
                }

                // 2️⃣ 총 포트폴리오 조회
                const totalPortfolioRes = await fetch(`http://localhost:8080/api/totalportfolio/${userId}`);
                if(totalPortfolioRes.ok){
                    const totalData = await totalPortfolioRes.json();
                    setTotalPortfolio(totalData);
                }
            } catch (error) {
                console.error("유저 자산 조회 실패:", error);
            }
        };

        fetchData();
    }, [isLoggedIn, userId]);

    return(
        <div className={styles.loginBox}>
            { !isLoggedIn && (
                <>
                    <p>여기는 로그인 박스입니다.</p>
                    <button type="button"
                            className={styles.loginBtn}
                            onClick={() => navigate("/login")}>로그인버튼</button>
                    <div className={styles.loginBottomBtn}>
                        <button onClick={() => navigate("/findpassword")}>비밀번호 찾기</button>
                        <label>|</label>
                        <button onClick={() => navigate("/signup")}>회원가입</button>
                    </div>
                </>
            )}

            {isLoggedIn && (
                <>
                    <div className={styles.loginState}>
                        <div className={styles.userImage}>이미지</div>
                        <div className={styles.userInfo}>
                            <div className={styles.userName}>
                                <label>{userName} </label>
                            </div>
                            <div 
                            className={styles.userBalance}
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                            >
                            <p style={{ fontWeight: 'bold', cursor: 'default' }}>
                                총 자산: {totalAssets.toLocaleString()} KRW
                            </p>

                            {showTooltip && (
                                <div className={styles.tooltip}>
                                거래 가능: {balance?.toLocaleString() || 0} KRW<br/>
                                평가 금액: {totalPortfolio?.totalEvaluation?.toLocaleString() || 0} KRW
                                </div>
                            )}
                            </div>
                        </div>
                    </div>

                    <div style={{
                        height: '1px',
                        backgroundColor: '#dee2e6',
                        width: '100%',
                        visibility: 'visible',
                        border: 'none',
                        padding: '0',
                        margin: '0'
                    }}>  
                    </div>

                    <div className={styles.logoutBottomBtn}>
                        <button onClick={() => navigate(`/Mypage/${userId}`)}>내 정보</button>
                        <div style={{
                            width: '1px',
                            backgroundColor: '#dee2e6',
                            height: '100%',
                            visibility: 'visible',
                            border: 'none',
                            padding: '0',
                            margin: '0'
                        }}>  
                        </div>
                        <button onClick={() => handleLogout()}>로그아웃</button>
                    </div>
                </>
            )}
        </div>
    )
}
