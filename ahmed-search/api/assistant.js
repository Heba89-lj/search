import fetch from "node-fetch";

export default async function handler(req, res) {
  const { question } = req.body;

  // متغيرات البيئة على Vercel
  const sheetId = process.env.FAQ_SHEET_ID;
  const apiKey = process.env.FAQ_API_KEY;

  if (!sheetId || !apiKey) {
    return res.status(500).json({ error: "API key or Sheet ID missing" });
  }

  try {
    // جلب الشيت
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.values) return res.status(404).json({ answer: "لا توجد بيانات." });

    const rows = data.values.slice(1); // تجاهل رأس الأعمدة

    // البحث عن أي كلمة مفتاحية موجودة في السؤال
    const found = rows.find(row =>
      row[0].split(",").some(k => question.includes(k.trim()))
    );

    res.status(200).json({
      answer: found ? found[1] : "يرجى توضيح السؤال أو مراجعة صفحة الاستعلام."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ أثناء جلب البيانات." });
  }
}
