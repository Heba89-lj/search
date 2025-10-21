import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { number, year } = req.query;
    const sheetId = process.env.SHEET_ID;
    const apiKey = process.env.GOOGLE_API_KEY;

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`
      );
      const data = await response.json();
      const rows = data.values || [];

      // أول صف عادة بيكون العناوين فبنبدأ من الصف الثاني
      const match = rows.find(
        (r, i) => i > 0 && r[1] === number && r[2] === year
      );

      if (match) {
        res.status(200).json({
          success: true,
          result: {
            name: match[0],
            number: match[1],
            year: match[2],
          },
        });
      } else {
        res.status(404).json({ success: false });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
