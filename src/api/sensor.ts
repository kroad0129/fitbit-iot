export async function fetchSensorData() {
    const url = "https://uug2wtk3g0.execute-api.ap-northeast-2.amazonaws.com/monitoring/sensor";

    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
        console.error("[sensor] 네트워크 오류:", res.status);
        return { temperature: 0, humidity: 0, gasDetection: "안전", heartRate: 70, stressLevel: 35 };
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
        console.warn("[sensor] 받은 데이터 없음:", data);
        return { temperature: 0, humidity: 0, gasDetection: "안전", heartRate: 70, stressLevel: 35 };
    }

    const item = data[0];
    return {
        temperature: Number(item.temperature) || 0,
        humidity: Number(item.humidity) || 0,
        gasDetection: item.gas_detected === 1 ? "위험" : "안전",
        heartRate: Number(item.heart_rate) || 70,
        stressLevel: 35
    };
}
