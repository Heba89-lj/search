// ده كود تطابق حرفى
// export default async function handler(req, res) {

//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   let body = "";
//   req.on("data", chunk => body += chunk.toString());

//   req.on("end", async () => {
//     try {
//       const { question } = JSON.parse(body);
//       if (!question) {
//         return res.json({ answer: "اكتب سؤالك أولاً" });
//       }

//       const sheetId = process.env.FAQ_SHEET_ID;
//       const apiKey = process.env.FAQ_API_KEY;

//       const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
//       const response = await fetch(url);
//       const data = await response.json();

//       if (!data.values) {
//         return res.json({ answer: "لا توجد بيانات" });
//       }

//       const rows = data.values.slice(1);

//       const found = rows.find(row =>
//         question.includes(row[0])
//       );

//       res.json({
//         answer: found ? found[1] : "من فضلك راجع السؤال أو تواصل مع الدعم"
//       });

//     } catch (err) {
//       res.status(500).json({ answer: "حدث خطأ في السيرفر" });
//     }
//   });

// }


// دالة لتطبيع الكلمات العربية (إزالة التشكيل، ال التعريف، نهايات الجمع، الرموز)
function normalizeArabic(text) {
  return text
    .toLowerCase()
    .replace(/[ًٌٍَُِّْ]/g, "")          // إزالة التشكيل
    .replace(/^ال/g, "")                 // إزالة ال التعريف
    .replace(/(ات|ون|ين|ة|ه|ي)$/g, "")  // إزالة نهايات الجمع والمفرد
    .replace(/[^ء-ي\s]/g, "")           // إزالة أي رموز
    .trim();
}

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = "";
  req.on("data", chunk => body += chunk.toString());

  req.on("end", async () => {
    try {
      const { question } = JSON.parse(body);

      if (!question) {
        return res.json({ answer: "اكتب سؤالك أولاً" });
      }

      const sheetId = process.env.FAQ_SHEET_ID;
      const apiKey = process.env.FAQ_API_KEY;

      // رابط Google Sheets API
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.values) {
        return res.json({ answer: "لا توجد بيانات" });
      }

      const rows = data.values.slice(1); // تخطي رأس الشيت

      // تطبيع كلمات المستخدم
      const userWords = normalizeArabic(question)
        .split(/\s+/)
        .filter(w => w.length > 1); // تجاهل الكلمات القصيرة جدًا

      let found = null;

      // البحث في كل صف
      rows.some(row => {
        // تقسيم المرادفات على "|" لكل صف وتطبيعها
        const sheetVariants = row[0]
          .split("|")
          .map(v => normalizeArabic(v).split(/\s+/));

        // البحث عن أي كلمة من المستخدم داخل أي مرادف في الشيت
        const match = sheetVariants.some(variantWords =>
          userWords.some(uWord =>
            variantWords.some(sWord =>
              sWord.includes(uWord) || uWord.includes(sWord)
            )
          )
        );

        if (match) {
          found = row; // حفظ الصف المطابق
          return true; // إيقاف البحث بعد أول تطابق
        }
      });

      res.json({
        answer: found
          ? found[1] // الرد من العمود الثاني
          : "من فضلك راجع السؤال أو تواصل مع الدعم"
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ answer: "حدث خطأ في السيرفر" });
    }
  });
}
