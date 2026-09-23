import Button from "../ui/Button";

/**
 * 지도가 지금 어디를 기준으로 보여주고 있는지 알린다.
 *
 * 기본 좌표(서울시청)를 말없이 띄우면 사용자는 그게 자기 주변인 줄 안다.
 * 상태마다 할 말과 할 수 있는 일이 다르다 — 아직 안 정했으면 허용을 부탁하고,
 * 차단됐으면 푸는 법을 알리고, 그냥 실패한 거면 다시 시도하게 한다.
 */
const MapLocationNotice = ({ status, onRetry }) => {
  if (status === "granted") return null;

  // 차단·실패는 영구 상태다. 지도를 계속 가릴 이유가 없으니 위쪽에 작게 알린다
  if (status === "blocked" || status === "unavailable") {
    return (
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-3">
        <div className="pointer-events-auto flex max-w-full items-center gap-1.5 rounded-full bg-surface/95 px-3 py-1.5 text-xs shadow-card backdrop-blur-sm">
          {status === "blocked" ? (
            // 한 번 차단하면 사이트가 팝업을 다시 띄울 수 없다.
            // 눌러도 아무 일이 없을 버튼 대신 무엇을 하면 되는지만 말한다.
            // 사용자가 설정에서 허용하면 useGeolocation이 change로 받아 바로 반영한다
            <span className="truncate text-ink-muted">
              위치 권한을 허용하면 지금 계신 곳을 보여드려요
            </span>
          ) : (
            <>
              <span className="truncate text-ink-muted">
                위치를 가져오지 못했어요
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 shrink-0 px-2"
                onClick={onRetry}
              >
                다시 시도
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // 아직 정해지지 않은 동안은 지도를 덮어 눈에 띄게 한다.
  // pointer-events-none이라 어두워 보여도 지도는 그대로 끌고 확대할 수 있다 —
  // 팝업을 무시하면 이 상태가 끝나지 않으므로 막아서는 안 된다
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/30 p-4">
      <div className="flex items-center gap-2.5 rounded-full bg-surface px-4 py-2.5 text-sm shadow-card">
        <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-line border-t-brand" />
        <span className="font-semibold break-keep text-ink">
          {status === "prompt"
            ? "위치를 허용하면 지금 계신 곳을 보여드려요"
            : "내 위치를 찾는 중…"}
        </span>
      </div>
    </div>
  );
};

export default MapLocationNotice;
