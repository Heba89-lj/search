export default async function handler(req, res) {
  const { number, year } = req.query;

  const fakeData = [
    { number: '123', year: '2024', name: 'هبة محمد' },
    { number: '456', year: '2025', name: 'أحمد علي' },
  ];

  const result = fakeData.find(
    (item) => item.number === number && item.year === year
  );

  if (result) {
    res.status(200).json({ success: true, result });
  } else {
    res.status(404).json({ success: false });
  }
}

