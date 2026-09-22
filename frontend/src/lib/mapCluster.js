/**
 * 화면 픽셀 거리를 기준으로 가까운 좌표들을 묶는다.
 *
 * 위경도 거리가 아니라 픽셀 거리로 묶는 이유는, 겹쳐 보이는지는 배율에
 * 달려 있기 때문이다. 같은 두 지점이 확대하면 멀찍이 떨어지고 축소하면
 * 포개진다. 그래서 배율이 바뀔 때(idle)마다 다시 계산한다.
 *
 * @param map    kakao.maps.Map
 * @param items  [{ position: kakao.maps.LatLng, ... }]
 * @param radius 이 픽셀 안에 들어오면 한 묶음으로 본다
 * @returns [{ items: [...], position: kakao.maps.LatLng }]
 */
export function clusterByPixel(map, items, { radius = 64 } = {}) {
  if (items.length === 0) return [];

  const projection = map.getProjection();
  const points = items.map((item) => {
    const p = projection.pointFromCoords(item.position);
    return { item, x: p.x, y: p.y, taken: false };
  });

  const groups = [];
  for (const seed of points) {
    if (seed.taken) continue;
    seed.taken = true;

    const members = [seed];
    for (const other of points) {
      if (other.taken) continue;
      if (Math.hypot(seed.x - other.x, seed.y - other.y) <= radius) {
        other.taken = true;
        members.push(other);
      }
    }

    // 묶음은 구성원의 무게중심에 놓는다. 씨앗 위치에 놓으면
    // 묶음이 한쪽으로 치우쳐 보인다
    const cx = members.reduce((sum, m) => sum + m.x, 0) / members.length;
    const cy = members.reduce((sum, m) => sum + m.y, 0) / members.length;

    groups.push({
      items: members.map((m) => m.item),
      position: projection.coordsFromPoint(
        new window.kakao.maps.Point(cx, cy)
      ),
    });
  }

  return groups;
}
