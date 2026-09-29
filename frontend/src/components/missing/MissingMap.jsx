import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DEFAULT_CENTER,
  OVERVIEW_LEVEL,
  loadKakaoMap,
} from "../../lib/kakaoMap";
import { useGeolocation } from "../../hooks/useGeolocation";
import MapLocationNotice from "./MapLocationNotice";
import { clusterByPixel } from "../../lib/mapCluster";
import "./MissingMap.css";

const MissingMap = ({ missingList, onVisibleCountChange }) => {
  const mapRef = useRef(null); // 카카오 지도 객체
  const overlaysRef = useRef([]); // 지금 지도에 올라가 있는 오버레이들
  const containerRef = useRef(null);
  const nav = useNavigate();
  // 마커는 지도가 만든 DOM이라 클릭 핸들러가 첫 렌더의 nav를 붙든다
  const navRef = useRef(nav);
  navRef.current = nav;
  const [mapLoaded, setMapLoaded] = useState(false);
  const { position, status, request } = useGeolocation();

  /** 사진 마커 하나 */
  const createPetOverlay = useCallback(
    (item) => {
      const outer = document.createElement("div");
      outer.className = "custom-marker-outer-wrapper";
      // 고리가 전부 같은 박자로 뛰면 화면이 깜빡이는 것처럼 보인다
      outer.style.setProperty("--ping-delay", `${Math.random() * 2.4}s`);

      const wrapper = document.createElement("div");
      wrapper.className = "custom-marker-wrappers";

      const imgWrapper = document.createElement("div");
      imgWrapper.className = "custom-marker-img-wrapper";

      const img = document.createElement("img");
      img.className = "custom-marker-images";
      img.src = item.pet.petImage || "/image-default.png";
      img.alt = "";

      imgWrapper.appendChild(img);
      wrapper.appendChild(imgWrapper);
      outer.appendChild(wrapper);

      // 상세는 별도 화면이다. 실종 글은 남에게 보내서 보게 하는 것이라
      // 글마다 주소가 있어야 한다
      wrapper.addEventListener("click", () => navRef.current(`/missing/${item.pet.id}`));

      return new window.kakao.maps.CustomOverlay({
        position: item.position,
        content: outer,
        yAnchor: 1,
      });
    },
    []
  );

  /** 겹쳐 있는 마커들을 대신하는 묶음 */
  const createClusterOverlay = useCallback((group) => {
    const count = group.items.length;

    const el = document.createElement("div");
    el.className = "custom-marker-cluster";
    // 많이 묶일수록 조금씩 키워 규모가 눈에 보이게 한다
    el.style.setProperty("--cluster-size", `${Math.min(44 + count * 3, 66)}px`);
    el.textContent = count > 99 ? "99+" : String(count);
    el.title = `이 근처에 ${count}건`;

    el.addEventListener("click", () => {
      const map = mapRef.current;
      if (!map) return;
      // 두 단계 당기면 대부분의 묶음이 갈라진다.
      // anchor를 주면 누른 자리가 화면 밖으로 밀려나지 않는다
      map.setLevel(Math.max(1, map.getLevel() - 2), {
        anchor: group.position,
      });
    });

    return new window.kakao.maps.CustomOverlay({
      position: group.position,
      content: el,
      yAnchor: 0.5,
    });
  }, []);

  /** 현재 배율 기준으로 묶어서 다시 그린다 */
  const renderOverlays = useCallback(() => {
    const map = mapRef.current;
    if (!map || !window.kakao?.maps) return;

    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];

    const items = (missingList || [])
      .filter(
        (pet) =>
          pet.petMissingPoint &&
          pet.petMissingPoint.lat != null &&
          pet.petMissingPoint.lng != null
      )
      .map((pet) => ({
        pet,
        position: new window.kakao.maps.LatLng(
          pet.petMissingPoint.lat,
          pet.petMissingPoint.lng
        ),
      }));

    clusterByPixel(map, items).forEach((group) => {
      const overlay =
        group.items.length === 1
          ? createPetOverlay(group.items[0])
          : createClusterOverlay(group);
      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    });

    // 지금 화면에 들어와 있는 건수를 알린다.
    // 전체 건수는 "내 주변"을 보여주는 지도 옆에서 의미가 없다
    const bounds = map.getBounds();
    onVisibleCountChange?.(
      items.filter((item) => bounds.contain(item.position)).length
    );
  }, [missingList, createPetOverlay, createClusterOverlay, onVisibleCountChange]);

  useEffect(() => {
    // SDK가 도착하기 전에 언마운트되면 결과를 버린다
    let cancelled = false;
    loadKakaoMap()
      .then(() => {
        if (cancelled) return;

        // 이 지도는 전체 신고를 늘어놓는 게 아니라 "내 주변에 실종된 아이가
        // 있는가"를 보여준다. 그래서 마커에 범위를 맞추지 않고 현재 위치를
        // 중심에 둔다. 위치를 못 받으면 기본 좌표로 남는다
        const map = new window.kakao.maps.Map(containerRef.current, {
          center: new window.kakao.maps.LatLng(
            DEFAULT_CENTER.lat,
            DEFAULT_CENTER.lng
          ),
          level: OVERVIEW_LEVEL,
        });
        mapRef.current = map;
        setMapLoaded(true);
      })
      .catch((error) => console.error(error));
    return () => {
      cancelled = true;
    };
  }, []);

  // 위치는 늦게 올 수 있다 — 권한 팝업을 한참 뒤에 허용하거나 "내 위치로"를
  // 눌렀을 때. 도착하는 시점에 옮기므로 새로고침이 필요 없다
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !position) return;
    mapRef.current.setCenter(
      new window.kakao.maps.LatLng(position.lat, position.lng)
    );
  }, [mapLoaded, position]);

  // 배율·중심이 바뀌면 묶음이 달라지므로 다시 그린다
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    renderOverlays();
    window.kakao.maps.event.addListener(map, "idle", renderOverlays);
    return () => {
      window.kakao.maps.event.removeListener(map, "idle", renderOverlays);
    };
  }, [mapLoaded, renderOverlays]);

  return (
    <>
      {/* 높이는 부모가 정한다. 350px로 고정해두면 부모가 그보다 작을 때
          지도 아래쪽이 잘려 그 영역의 마커를 볼 수 없다 */}
      <div className="relative size-full">
        <div id="missingMap" ref={containerRef} className="size-full"></div>
        <MapLocationNotice status={status} onRetry={request} />
      </div>
    </>
  );
};

export default MissingMap;
