export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { nationalId } = req.query;

  if (!nationalId) {
    return res.status(400).json({ success: false, message: "ادخلي الرقم القومي أو جواز السفر" });
  }




// 🔥 Normalize قوي جدًا يتعامل مع جواز السفر المختلط
const normalize = (str = "") =>
  str
    .toLowerCase()                           // توحيد الحروف
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))  // تحويل الأرقام العربية
    .replace(/[^a-z0-9]/gi, "")              // إزالة أي شيء غير حرف إنجليزي أو رقم
    .normalize("NFKD")                       // إزالة أشكال Unicode الغريبة
    .trim();

  
  const nid = normalize(nationalId);

  const sheetId = process.env.SHEET_ID;
  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
    const response = await fetch(url);
    const rawText = await response.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "رد غير صالح من Google Sheets",
        details: rawText,
      });
    }

    const rows = data.values?.slice(1) || [];

    // 🔍 البحث في العمود الذي يحتوي على الرقم القومي أو جواز السفر
    const match = rows.find((r) => normalize(r[2]) === nid);

    if (match) {
      return res.status(200).json({
        success: true,
        result: {
          number: match[0],
          year: match[1],
          caseNumber: match[3],
          applicant: match[4],
          status: match[5],
          visa: match[6],
          notes: match[7],
        },
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على بيانات لهذا الرقم",
      });
    }
  } catch (error) {
    console.error("🔥 Error fetching Google Sheet:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ في السيرفر",
      error: error.message,
    });
  }
}



