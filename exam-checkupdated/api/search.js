import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { number, year } = req.query;

  if (!number || !year) {
    return res.status(400).json({ success: false, message: "ادخلي رقم الفحص والسنة" });
  }

  const sheetId = process.env.SHEET_ID;      // ENV variable على Vercel
  const apiKey = process.env.GOOGLE_API_KEY; // ENV variable على Vercel

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`
    );

    if (!response.ok) {
      return res.status(500).json({ success: false, message: "خطأ في الوصول للـ Sheet" });
    }

    const data = await response.json();

    // ✅ أهم تعديل: تخطي الصف الأول لأنه يحتوي على عناوين الأعمدة
    const rows = data.values.slice(1); 

    // ابحث في الصفوف
    // عدل الأعمدة حسب ترتيب الشيت عندك
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
    } else {
      return res.status(404).json({ success: false, message: "لم يتم العثور على بيانات لهذا الفحص" });
    }
 } catch (error) {
  console.error("Error fetching Google Sheet:", error);

  // ✅ تعديل لإظهار تفاصيل الخطأ في الـ Logs والـ Response
  return res.status(500).json({
    success: false,
    message: "حدث خطأ في السيرفر",
    error: error.message, // يطبع الرسالة الحقيقية للخطأ
  });
}

}




