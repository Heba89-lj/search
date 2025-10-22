import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { number, year } = req.query;

  if (!number || !year) {
    return res.status(400).json({ success: false, message: "ادخلي رقم الفحص والسنة" });
  }

  const sheetId = process.env.SHEET_ID;
  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
    console.log("🔗 Requesting URL:", url);

    const response = await fetch(url);

    // نقرأ النص أول مرة
    const rawText = await response.text();

    // نحاول نحوله JSON لو نقدر
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.error("❌ Google API returned non-JSON:", rawText);
      return res.status(500).json({
        success: false,
        message: "رد غير صالح من Google Sheets",
        details: rawText,
      });
    }

    // لو Google رجعت خطأ واضح
    if (!response.ok || data.error) {
      console.error("❌ Google Sheets API error:", data.error || rawText);
      return res.status(500).json({
        success: false,
        message: "خطأ في الوصول إلى Google Sheet",
        details: data.error?.message || rawText,
      });
    }

    const rows = data.values?.slice(1) || [];
    const match = rows.find(
      (r) => r[1]?.toString() === number.toString() && r[2]?.toString() === year.toString()
    );

    if (match) {
      return res.status(200).json({
        success: true,
        result: {
          number: match[1],
          year: match[2],
          caseNumber: match[3],
          applicant: match[4],
          status: match[5],
          visa: match[6],
          notes: match[7],
        },
      });
    } else {
      return res.status(404).json({ success: false, message: "لم يتم العثور على بيانات لهذا الفحص" });
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
