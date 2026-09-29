import { useCallback, useEffect, useRef, useState } from "react";
import {
  CITY_LEVEL,
  NATIONWIDE_CENTER,
  NATIONWIDE_LEVEL,
  loadKakaoMap,
} from "../../lib/kakaoMap";
import { clusterByPixel } from "../../lib/mapCluster";

/**
 * 보호소 위치 지도.
 *
 * 마커는 전국 것을 다 찍되, 목록에 무엇을 보여줄지는 "지금 화면에 보이는
 * 범위"가 정한다(onVisibleChange). 반경을 몇 km로 할지 미리 정하지 않아도
 * 사용자가 지도를 끌고 확대하는 행동이 곧 범위 지정이 된다.
 *
 * 겹치는 마커는 묶는다. 수도권은 1km 안에 이웃이 있는 곳이 70곳 중 41곳이고,
 * 위치를 못 받아 전국에서 시작하면 183곳이 한 화면에 들어온다.
 * 겹침은 위경도가 아니라 배율에 달린 문제라, 배율이 바뀔 때마다 다시 묶는다.
 *
 * 좌표는 공공데이터포털 동물보호센터 정보에 함께 오므로 그대로 쓴다.
 */
const ShelterMap = ({
  shelters,
  center,
  selectedId,
  highlightedId,
  onSelect,
  onHover,
  onVisibleChange,
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  /* 지도는 SDK가 도착한 뒤에야 생긴다. 이걸 state로 알리지 않으면
     지도보다 먼저 준비된 값(현재 위치 등)을 쓰는 effect가 한 번 헛돌고
     다시 실행될 일이 없어 영영 반영되지 않는다 */
  const [mapReady, setMapReady] = useState(false);

  /** 지금 지도에 얹혀 있는 것 전부. 다시 그릴 때 통째로 걷어낸다 */
  const overlaysRef = useRef([]);
  /** 묶이지 않고 홀로 선 보호소만. 강조와 이동에 쓴다 */
  const markersRef = useRef(new Map());
  /** 묶인 보호소 → 그 묶음의 DOM. 묶여 있어도 짚은 티가 나게 한다 */
  const clusterOfRef = useRef(new Map());
  const hereRef = useRef(null);

  // 최신 값을 이벤트 핸들러가 보게 한다. 지도는 한 번만 만들고 계속 쓰므로
  // 핸들러가 첫 렌더의 값을 붙들면 갱신이 반영되지 않는다
  const sheltersRef = useRef(shelters);
  sheltersRef.current = shelters;
  const onVisibleChangeRef = useRef(onVisibleChange);
  onVisibleChangeRef.current = onVisibleChange;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onHoverRef = useRef(onHover);
  onHoverRef.current = onHover;
  const focusRef = useRef({ highlightedId, selectedId });
  focusRef.current = { highlightedId, selectedId };

  /** 지금 보이는 범위에 들어오는 보호소를 알려준다 */
  const reportVisible = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = map.getBounds();
    onVisibleChangeRef.current?.(
      sheltersRef.current.filter(
        (s) =>
          s.lat != null &&
          s.lng != null &&
          bounds.contain(new window.kakao.maps.LatLng(s.lat, s.lng))
      )
    );
  }, []);

  /* 옆 목록에서 짚고 있는 보호소의 마커를 키워 앞으로 꺼낸다.
     마커가 자주 겹치는데, 목록과 지도가 이렇게 연결돼 있으면 골라낼 수 있다 */
  const applyFocus = useCallback(() => {
    const { highlightedId: hi, selectedId: sel } = focusRef.current;

    markersRef.current.forEach(({ overlay, marker }, id) => {
      const on = id === hi || id === sel;
      marker.classList.toggle("scale-150", on);
      marker.classList.toggle("drop-shadow-lg", on);
      overlay.setZIndex(on ? 10 : 1);
    });

    // 묶여 있는 보호소를 짚었으면 그 묶음을 대신 밝힌다
    const focused = new Set(
      [hi, sel]
        .filter(Boolean)
        .map((id) => clusterOfRef.current.get(id))
        .filter(Boolean)
    );
    clusterOfRef.current.forEach((el) =>
      el.classList.toggle("is-focused", focused.has(el))
    );
  }, []);

  const createMarker = useCallback((shelter, position) => {
    // select-none이 없으면 지도를 끌 때 마커가 선택돼 파란 테두리가 씌워진다
    const marker = document.createElement("div");
    marker.className =
      "flex size-10 cursor-pointer items-center justify-center transition duration-200 select-none hover:scale-125";

    const img = document.createElement("img");
    img.src = "/orangeMarker.png";
    img.alt = "";
    // 이미지는 기본이 드래그 가능이라, 지도를 끌면 이미지가 끌려 나온다
    img.draggable = false;
    img.className = "pointer-events-none size-full object-contain";
    marker.appendChild(img);

    marker.addEventListener("click", () => onSelectRef.current?.(shelter));
    // 지도에서 마커를 짚으면 옆 목록의 같은 항목이 밝아진다
    marker.addEventListener("mouseenter", () =>
      onHoverRef.current?.(shelter.careRegNo)
    );
    marker.addEventListener("mouseleave", () => onHoverRef.current?.(null));

    const overlay = new window.kakao.maps.CustomOverlay({
      position,
      content: marker,
      yAnchor: 1,
    });
    markersRef.current.set(shelter.careRegNo, { overlay, marker, coords: position });
    return overlay;
  }, []);

  /** 겹쳐 있는 보호소들을 대신하는 묶음 */
  const createCluster = useCallback((group) => {
    const count = group.items.length;
    const el = document.createElement("div");
    el.className = "custom-marker-cluster";
    // 한 묶음을 여러 보호소가 가리킨다
    group.items.forEach(({ shelter }) =>
      clusterOfRef.current.set(shelter.careRegNo, el)
    );
    // 많이 묶일수록 조금씩 키워 규모가 눈에 보이게 한다
    el.style.setProperty("--cluster-size", `${Math.min(44 + count * 3, 66)}px`);
    el.textContent = count > 99 ? "99+" : String(count);
    el.title = `이 근처에 보호소 ${count}곳`;

    el.addEventListener("click", () => {
      const map = mapRef.current;
      if (!map) return;
      // 두 단계 당기면 대부분의 묶음이 갈라진다.
      // anchor를 주면 누른 자리가 화면 밖으로 밀려나지 않는다
      map.setLevel(Math.max(1, map.getLevel() - 2), { anchor: group.position });
    });

    return new window.kakao.maps.CustomOverlay({
      position: group.position,
      content: el,
      yAnchor: 0.5,
    });
  }, []);

  /** 현재 배율 기준으로 묶어서 다시 그린다 */
  const draw = useCallback(() => {
    const map = mapRef.current;
    if (!map || !window.kakao?.maps) return;

    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];
    markersRef.current = new Map();
    clusterOfRef.current = new Map();

    const items = sheltersRef.current
      .filter((s) => s.lat != null && s.lng != null)
      .map((shelter) => ({
        shelter,
        position: new window.kakao.maps.LatLng(shelter.lat, shelter.lng),
      }));

    clusterByPixel(map, items).forEach((group) => {
      const overlay =
        group.items.length === 1
          ? createMarker(group.items[0].shelter, group.items[0].position)
          : createCluster(group);
      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    });

    applyFocus();
    reportVisible();
  }, [createMarker, createCluster, applyFocus, reportVisible]);

  useEffect(() => {
    let cancelled = false;
    loadKakaoMap()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const map = new window.kakao.maps.Map(containerRef.current, {
          // 위치를 알면 내 동네에서, 모르면 전국에서 시작한다
          center: new window.kakao.maps.LatLng(
            center?.lat ?? NATIONWIDE_CENTER.lat,
            center?.lng ?? NATIONWIDE_CENTER.lng
          ),
          level: center ? CITY_LEVEL : NATIONWIDE_LEVEL,
        });
        mapRef.current = map;
        // 배율이 바뀌면 묶음이 달라지므로, 멈출 때마다 통째로 다시 그린다
        window.kakao.maps.event.addListener(map, "idle", draw);
        draw();
        setMapReady(true);
      })
      .catch((error) => console.error("카카오맵 스크립트 로드 실패", error));
    return () => {
      cancelled = true;
      const map = mapRef.current;
      if (map) window.kakao.maps.event.removeListener(map, "idle", draw);
    };
    // 지도는 한 번만 만든다. 시작 위치가 늦게 도착하는 경우는 아래에서 따로 옮긴다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 목록이 도착하거나 바뀌면 다시 그린다
  useEffect(() => {
    draw();
  }, [shelters, draw, mapReady]);

  // 짚는 대상만 바뀐 경우는 다시 그릴 것 없이 강조만 옮긴다
  useEffect(() => {
    applyFocus();
  }, [highlightedId, selectedId, applyFocus, mapReady]);

  // 위치 허용이 늦으면 지도를 만든 뒤에 좌표가 온다. 그때 한 번 옮겨 준다
  const movedToCenter = useRef(false);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !center || movedToCenter.current) return;
    movedToCenter.current = true;
    map.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng));
    map.setLevel(CITY_LEVEL);
  }, [center, mapReady]);

  // 목록에서 보호소를 고르면 지도도 따라 움직인다.
  // 묶음 안에 들어가 있으면 홀로 선 마커가 없어 이동할 자리도 없다
  useEffect(() => {
    const map = mapRef.current;
    const target = selectedId && markersRef.current.get(selectedId);
    if (!map || !target) return;
    map.panTo(target.coords);
  }, [selectedId, mapReady]);

  /* 현재 위치 점.
     보호소 마커가 주황이라 색을 달리하고, 퍼지는 고리를 둬서 "내가 여기"임을
     한눈에 알 수 있게 한다. 지도가 문서에 직접 꽂는 DOM이라 JSX가 아니지만
     클래스 문자열이 소스에 그대로 있으므로 Tailwind가 찾아낸다 */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !center) return;

    hereRef.current?.setMap(null);
    const dot = document.createElement("div");
    dot.className =
      "pointer-events-none relative flex size-4 items-center justify-center select-none";
    dot.innerHTML =
      '<span class="absolute inline-flex size-full animate-ping rounded-full bg-here opacity-60"></span>' +
      '<span class="relative inline-flex size-3 rounded-full border-2 border-white bg-here shadow"></span>';

    const overlay = new window.kakao.maps.CustomOverlay({
      position: new window.kakao.maps.LatLng(center.lat, center.lng),
      content: dot,
      zIndex: 5,
    });
    overlay.setMap(map);
    hereRef.current = overlay;

    return () => overlay.setMap(null);
  }, [center, mapReady]);

  // 높이는 쓰는 쪽이 정한다
  return <div ref={containerRef} className="size-full" />;
};

export default ShelterMap;
