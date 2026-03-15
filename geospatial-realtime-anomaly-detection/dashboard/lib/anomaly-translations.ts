/**
 * แปล anomaly type จากภาษาอังกฤษเป็นภาษาไทย สำหรับแสดงใน tooltip
 */
export function translateAnomalyToThai(anomalyType: string): string {
  const spatialMatch = anomalyType.match(/^spatial: jumped ([\d.]+) km in 1 sec$/);
  if (spatialMatch) {
    return `ตำแหน่ง: กระโดด ${spatialMatch[1]} กม. ใน 1 วินาที`;
  }

  const speedMatch = anomalyType.match(/^speed: ([\d.]+) km\/h exceeds ([\d.]+) km\/h$/);
  if (speedMatch) {
    return `ความเร็ว: ${speedMatch[1]} กม./ชม. เกินจำกัด ${speedMatch[2]} กม./ชม.`;
  }

  const idlingMatch = anomalyType.match(/^idling: stationary ([\d.]+) min$/);
  if (idlingMatch) {
    return `จอดนิ่ง: ค้างที่เดิม ${idlingMatch[1]} นาที`;
  }

  if (anomalyType === "ml: isolation forest outlier") {
    return "ML: ค่าผิดปกติ (Isolation Forest)";
  }

  return anomalyType;
}

/**
 * แปลรายการ anomaly types ทั้งหมดและรวมเป็นข้อความสำหรับ tooltip
 */
export function translateAnomalyTypesToTooltip(anomalyTypes: string[]): string {
  return anomalyTypes.map(translateAnomalyToThai).join("\n");
}

/**
 * แปล anomaly types เป็น array ภาษาไทย สำหรับแสดงในรายการ (เช่น AlertToast)
 */
export function getTranslatedAnomalyTypes(anomalyTypes: string[]): string[] {
  return anomalyTypes.map(translateAnomalyToThai);
}
