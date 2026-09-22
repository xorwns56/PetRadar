import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_CENTER,
  NEIGHBORHOOD_LEVEL,
  PINPOINT_LEVEL,
  getCurrentPosition,
  loadKakaoMap,
} from "../../lib/kakaoMap";
import Button from "../ui/Button";

const LocationMap = ({ init, onSelect }) => {
  const [map, setMap] = useState(null);
  const markerRef = useRef(null);
  const isInit = useRef(false);
  const placesRef = useRef(null);

  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState(null); // null=검색 전, []=결과 없음
  const [searching, setSearching] = useState(false);

  const dropMarker = (targetMap, latlng) => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    const markerImage = new window.kakao.maps.MarkerImage(
      "/orangeMarker.png",
      new window.kakao.maps.Size(40, 40),
      { offset: new window.kakao.maps.Point(20, 40) }
    );

    const newMarker = new window.kakao.maps.Marker({
      position: latlng,
      image: markerImage,
    });

    newMarker.setMap(targetMap);
    markerRef.current = newMarker;

    onSelect?.({ lat: latlng.getLat(), lng: latlng.getLng() });
  };

  useEffect(() => {
    // SDK가 도착하기 전에 언마운트되면 결과를 버린다
    let cancelled = false;
    loadKakaoMap()
      .then(() => {
        if (cancelled) return;
        const container = document.getElementById("locationMap");

        // 동네가 보이는 배율로 시작한다. 중심은 곧 현재 위치로 옮겨간다(아래)
        const created = new window.kakao.maps.Map(container, {
          center: new window.kakao.maps.LatLng(
            DEFAULT_CENTER.lat,
            DEFAULT_CENTER.lng
          ),
          level: NEIGHBORHOOD_LEVEL,
        });
        setMap(created);

        // 장소 검색기. libraries=services에 이미 들어 있어 추가 로딩이 없다
        placesRef.current = new window.kakao.maps.services.Places();

        // 현재 위치로 지도를 옮긴다. 위치 조회는 비동기라 우선 기본 좌표로 띄운 뒤 이동시킨다.
        // 마커는 찍지 않는다 — 실종 장소는 지금 있는 곳과 다를 수 있으므로 사용자가 직접 고르게 한다.
        // 수정 화면(init)은 저장된 위치를 보여줘야 하므로 건너뛴다.
        if (!init) {
          getCurrentPosition().then((here) => {
            // 수정 화면은 init이 뒤늦게 도착한다. 그 사이 응답이 오더라도
            // 저장된 위치가 이미 적용됐다면 덮어쓰지 않는다
            if (cancelled || !here || isInit.current) return;
            created.setCenter(new window.kakao.maps.LatLng(here.lat, here.lng));
          });
        }

        window.kakao.maps.event.addListener(created, "click", (mouseEvent) => {
          dropMarker(created, mouseEvent.latLng);
        });
      })
      .catch((error) => console.error(error));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isInit.current && init && map) {
      const latlng = new window.kakao.maps.LatLng(init.lat, init.lng);
      dropMarker(map, latlng);
      isInit.current = true;
      map.setCenter(latlng);
      map.setLevel(PINPOINT_LEVEL);
    }
  }, [init, map]);

  /* 주소가 아니라 키워드로 찾는다.
     실종 장소를 도로명주소로 기억하는 사람은 드물고 "배곧 한울공원",
     "시흥 롯데마트"처럼 근처 건물·지명으로 기억한다.
     Geocoder.addressSearch는 정식 주소만 받지만 Places는 둘 다 받는다 */
  const onSearch = (e) => {
    e.preventDefault();
    const query = keyword.trim();
    if (!query || !placesRef.current) return;

    setSearching(true);
    placesRef.current.keywordSearch(query, (data, status) => {
      setSearching(false);
      if (status === window.kakao.maps.services.Status.OK) {
        setResults(data.slice(0, 5));
      } else {
        setResults([]);
      }
    });
  };

  const onPickResult = (place) => {
    const latlng = new window.kakao.maps.LatLng(place.y, place.x);
    map.setCenter(latlng);
    map.setLevel(PINPOINT_LEVEL);
    dropMarker(map, latlng);
    setResults(null);
    setKeyword(place.place_name);
  };

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={onSearch} className="flex gap-2">
        <label className="sr-only" htmlFor="location-search">
          장소 검색
        </label>
        <input
          id="location-search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="장소나 주소로 찾기 (예: 배곧 한울공원)"
          className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3.5 text-sm text-ink transition-colors focus:border-brand focus:outline-none"
        />
        <Button htmlType="submit" variant="secondary" disabled={searching}>
          {searching ? "찾는 중…" : "검색"}
        </Button>
      </form>

      {results !== null &&
        (results.length === 0 ? (
          <p className="px-1 text-xs text-ink-muted">
            검색 결과가 없어요. 지도를 직접 눌러 위치를 찍어주세요.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-line bg-surface">
            {results.map((place) => (
              <li key={place.id} className="border-b border-line last:border-0">
                <button
                  type="button"
                  onClick={() => onPickResult(place)}
                  className="block w-full cursor-pointer px-3.5 py-2.5 text-left transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
                >
                  <span className="block truncate text-sm font-semibold text-ink">
                    {place.place_name}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-ink-muted">
                    {place.road_address_name || place.address_name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ))}

      {/* 검색창은 상자 밖, 지도만 테두리 안 */}
      <div
        id="locationMap"
        className="h-64 w-full overflow-hidden rounded-xl border border-line sm:h-72"
      ></div>
    </div>
  );
};

export default LocationMap;
