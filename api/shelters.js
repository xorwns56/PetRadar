// export default async function handler(req, res) {
//   const serviceKey = "f6ISl+Wv7yUWp0+IGtly6gkDGU7h8l/m5cxyxgDXZmJnwNileMGkN39UXmBU5EOHGsnukcp2jg2E9VNEkq4CQw==";
//   const encodedKey = encodeURIComponent(serviceKey);

//   const apiUrl = `https://apis.data.go.kr/1543061/abandonmentPublicService_v2/abandonmentPublic_v2?serviceKey=${encodedKey}&_type=json`;

//   try {
//     const response = await fetch(apiUrl);
//     const data = await response.json();
//     res.status(200).json(data);
//   } catch (err) {
//     res.status(500).json({ error: "API 호출 실패", detail: err.message });
//   }
// }