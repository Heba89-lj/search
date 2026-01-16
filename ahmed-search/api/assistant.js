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


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question } = req.body;
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

    // 🔹 تنظيف السؤال
    const stopWords = ["ايه","ما","هل","في","على","من","عن","الى","إلى","هو","هي"];
    const qWords = question
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.includes(w));

    let bestMatch = null;
    let maxScore = 0;

    rows.forEach(row => {
      const cell = row[0].toLowerCase();
      const rowWords = cell.split(/\s+/);

      let score = 0;

      qWords.forEach(word => {
        if (
          rowWords.some(w => w.includes(word) || word.includes(w))
        ) {
          score++;
        }
      });

      if (score > maxScore) {
        maxScore = score;
        bestMatch = row;
      }
    });

    // 🔹 حد أدنى ذكي للمطابقة
    if (maxScore < 2) {
      return res.json({
        answer: "لم أتمكن من العثور على إجابة دقيقة، برجاء توضيح السؤال أكثر"
      });
    }

    res.json({
      answer: bestMatch[1]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ answer: "حدث خطأ في السيرفر" });
  }
}
