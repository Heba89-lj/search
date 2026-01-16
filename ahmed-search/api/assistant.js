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


// 🔹 دالة تطبيع عربي بسيطة
function normalizeArabic(text) {
  return text
    .toLowerCase()
    .replace(/[ًٌٍَُِّْ]/g, "")          // إزالة التشكيل
    .replace(/^ال/g, "")                // إزالة ال التعريف
    .replace(/(ات|ون|ين|ة|ه|ي)$/g, "")  // جمع ونهايات
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

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.values) {
        return res.json({ answer: "لا توجد بيانات" });
      }

      const rows = data.values.slice(1);

      // 🔹 تطبيع سؤال المستخدم
      const userWords = normalizeArabic(question)
        .split(/\s+/)
        .filter(w => w.length > 2);

      let found = null;

      rows.some(row => {
        const sheetWords = normalizeArabic(row[0])
          .split(/\s+/);

        const match = userWords.some(uWord =>
          sheetWords.some(sWord =>
            sWord.includes(uWord) || uWord.includes(sWord)
          )
        );

        if (match) {
          found = row;
          return true; // وقف البحث
        }
      });

      res.json({
        answer: found
          ? found[1]
          : "من فضلك راجع السؤال أو تواصل مع الدعم"
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ answer: "حدث خطأ في السيرفر" });
    }
  });

}
