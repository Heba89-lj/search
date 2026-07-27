export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "أدخل اسم مقدم الطلب"
    });
  }

  // const normalize = (str = "") =>
  //   str
  //     .toLowerCase()
  //     .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
  //     .replace(/\s+/g, " ")
  //     .trim();

  const normalize = (str = "") =>
  str
    .toLowerCase()
    .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[ًٌٍَُِّْ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  
  const searchName = normalize(name);

  const sheetId = process.env.SHEET_ID;
  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    const rows = data.values?.slice(1) || [];

    // البحث الجزئي في اسم مقدم الطلب (العمود الخامس = index 4)
    const matches = rows.filter(r =>
      normalize(r[4] || "").includes(searchName)
    );

    if (matches.length > 0) {
      return res.status(200).json({
        success: true,
       results: matches.map(match => ({
          number: match[0],
          year: match[1],
          applicant: match[4]
     }))
      });
    }
    return res.status(404).json({
      success: false,
      message: "لم يتم العثور على بيانات."
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "حدث خطأ في السيرفر",
      error: error.message
    });
  }
}
