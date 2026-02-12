// export default async function handler(req, res) {
//   const { search } = req.query;

//   if (!search) {
//     return res.status(400).json({ message: "Missing search value" });
//   }

//   const SHEET_ID = process.env.SHEET_ID;
//   const API_KEY = process.env.GOOGLE_API_KEY;

//   const range = "Sheet1!A1:Z1000";

//   try {
//     const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
//     const response = await fetch(url);
//     const data = await response.json();

//     const rows = data.values;

//     if (!rows || rows.length === 0) {
//       return res.status(404).json({ message: "No Data Found" });
//     }

//     const headers = rows[0];

//     // 🔹 دالة تنضيف النص
//     function normalize(text) {
//       return text
//         ?.toString()
//         .toLowerCase()
//         .trim()
//         .replace(/\s+/g, "")
//         .replace(/[أإآ]/g, "ا")
//         .replace(/ة/g, "ه")
//         .replace(/ى/g, "ي")
//         .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
//     }

//     const normalizedSearch = normalize(search);

//     // 🔹 العمود رقم 9 (index = 8)
//     const columnIndex = 8;

//     const records = rows.slice(1).map(row => {
//       let obj = {};
//       headers.forEach((header, i) => {
//         obj[header] = row[i];
//       });
//       return obj;
//     });

//     const result = records.find(row =>
//       normalize(row[headers[columnIndex]]) === normalizedSearch
//     );

//     if (result) {
//       return res.status(200).json(result);
//     } else {
//       return res.status(404).json({ message: "Not Found" });
//     }

//   } catch (error) {
//     return res.status(500).json({ message: "Server Error", error: error.message });
//   }
// }



export default async function handler(req, res) {
  const { search } = req.query;

  if (!search) {
    return res.status(400).json({ message: "Missing search value" });
  }

  const SHEET_ID = process.env.SHEET_ID;
 const API_KEY = process.env.GOOGLE_API_KEY;
  const range = "Sheet1!A1:Z1000";

  function normalize(text) {
    return text
      ?.toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    const rows = data.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No Data Found" });
    }

    const headers = rows[0];

    const records = rows.slice(1).map(row => {
      let obj = {};
      // 🔹 هنا بنأخذ أول 8 أعمدة فقط
      headers.slice(0, 8).forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });

    const normalizedSearch = normalize(search);

    // 🔹 البحث في العمود التاسع "كود القضية"
    const codeColumnIndex = 8; // العمود التاسع
    const result = rows.slice(1)
      .find(row => normalize(row[codeColumnIndex]) === normalizedSearch);

    if (!result) {
      return res.status(404).json({ message: "Not Found" });
    }

    // 🔹 تحويل الصف الناتج لأول 8 أعمدة فقط
    let output = {};
    headers.slice(0, 8).forEach((header, i) => {
      output[header] = result[i];
    });

    return res.status(200).json(output);

  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
}

