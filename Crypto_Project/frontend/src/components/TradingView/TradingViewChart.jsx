import React, { useEffect, useRef } from "react";

function TradingViewChart({ symbol, chartType = "candle" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!symbol || !containerRef.current) return;

    // 기존 차트 제거 (페이지 이동 시 중복 방지)
    containerRef.current.innerHTML = "";

    // 차트 타입 매핑
    const styleMap = {
      candle: "1", // 캔들차트
      area: "3",   // 영역차트
      line: "4",
    };

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;

    script.onload = () => {
      if (!window.TradingView) return;

      new window.TradingView.widget({
        width: "100%",
        height: 500,
        symbol: symbol,
        interval: "30",
        timezone: "Asia/Seoul",
        theme: "light",
        style: styleMap[chartType] || "1", // ⭐ 여기서 분기
        locale: "kr",
        container_id: containerRef.current.id,
        hide_top_toolbar: chartType === "area", // 메인에서는 깔끔하게
        enable_publishing: false,
      });
    };

    containerRef.current.appendChild(script);
  }, [symbol, chartType]);

  return (
    <div
      id={`tv_chart_${symbol}_${chartType}`}
      ref={containerRef}
      style={{ width: "100%", height: "500px" }}
    />
  );
}

export default TradingViewChart;
