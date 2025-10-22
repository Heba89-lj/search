import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { number, year } = req.query;

  if (!number || !year) {
    return res.status(400).json({ success: false, message: "ادخلي رقم الفحص والسنة" });
  }

  const sheetId = process.env.SHEET_ID;        // من ENV variables على Vercel
  const apiKey = process.env.GOOGLE_API_KEY;   // من ENV variables على Vercel

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`
    );

    if (!response.ok) {
      return res.status(500).json({ success: false, message: "خطأ في الوصول للـ Sheet" });
    }

    const data = await response.json();
    const rows = data.values;

    // ابحث في الصفوف
    // افترضنا الأعمدة:
    // 0 = الاسم، 1 = رقم الفحص، 2 = السنة، 3 = رقم القضية، 4 = مقدم الطلب، 5 = حالة الفحص، 6 = ملاحظات
    const match = rows.find(
      (r) => r[1].toString() === number.toString() && r[2].toString() === year.toString()
    );

    if (match) {
      return res.status(200).json({
        success: true,
        result: {
          number: match[1],        // رقم الفحص
          year: match[2],          // السنة
          caseNumber: match[3],    // رقم القضية
          applicant: match[4],     // اسم مقدم الطلب
          status: match[5],        // حالة الطلب
          visa: match[6],          // التأشيرات
          notes: match[7],         // ملاحظات
        },
      });
    }
    else {
      return res.status(404).json({ success: false, message: "لم يتم العثور على بيانات لهذا الفحص" });
    }
  } catch (error) {
    console.error("Error fetching Google Sheet:", error);
    return res.status(500).json({ success: false, message: "حدث خطأ في السيرفر" });
  }
}



