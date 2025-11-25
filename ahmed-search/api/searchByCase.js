export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { caseNumber } = req.query;

  if (!caseNumber) {
    return res.status(400).json({ success: false, message: "ادخل رقم القضية" });
  }

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

    const match = rows.find((r) => r[3]?.toString().trim() === caseNumber.toString().trim());

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
      return res.status(404).json({ success: false, message: "لم يتم العثور على بيانات لهذا الرقم" });
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

