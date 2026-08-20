import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Main from './pages/Main/Main';
import styles from "./App.module.css";
import Analysis from './pages/Analysis';
import Compare from './pages/Compare';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Simulated_Trading from './pages/Simulated_Trading/Simulated_Trading';
import MyPage from './pages/MyPage/MyPage';
import CoinDetail from './pages/Coin/CoinDetail';
import CryptoMarketPrice from './pages/Coin/CryptoMarketPrice';
import DictionaryPage from './pages/Dictionary/DictionaryPage'; // 추가
import { AuthProvider } from './context/AuthContext';
import News from './pages/News/News';
import FindPassword from './pages/Login/FindPassword/FindPassword';
import ResetPassword from './pages/Login/ResetPassword/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className={styles.wrapper}>
          <Header />

          <main className={styles.mainContent}>
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/simulated_trading" element={<Simulated_Trading />} />
              <Route path="/Mypage/:userId" element={<MyPage />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/cryptomarketprice" element={<CryptoMarketPrice />} />
              <Route path="/coin/:id" element={<CoinDetail />} />
              <Route path="/news" element={<News/>}/>  
              <Route path="/dictionary" element={<DictionaryPage />} />
              <Route path="/findpassword" element={<FindPassword />} />
              <Route path="/resetpassword" element={<ResetPassword />} />
          </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
