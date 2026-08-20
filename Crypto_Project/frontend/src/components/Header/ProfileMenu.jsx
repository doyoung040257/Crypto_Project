import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import profileImg from "../../assets/images/profile.png";
import { AuthContext } from "../../context/AuthContext";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const {logout} = useContext(AuthContext);

  const handleLogout = () => {
      logout(); // Context에서 sessionStorage 초기화 + 상태 변경
      alert("로그아웃 되었습니다.");
      navigate("/");
  };  

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {/* 프로필 이미지 */}
      <img
        src={profileImg}
        alt="profile"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(prev => !prev);
        }}
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          cursor: "pointer"
        }}
      />

      {/* 드롭다운 */}
      {open && (
        <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
          <div className={styles.menuItem} onClick={() => {setOpen(false); navigate("/Mypage/:userId")}}>포트폴리오</div>
          {/* <div className={styles.menuItem} onClick={() => {setOpen(false); navigate("dictionary")}}>코인 용어사전</div> */}
          <div className={`${styles.menuItem} ${styles.logout}`} onClick={() => {setOpen(false); handleLogout(); }}>로그아웃</div>
        </div>
      )}
    </div>
  );
}
