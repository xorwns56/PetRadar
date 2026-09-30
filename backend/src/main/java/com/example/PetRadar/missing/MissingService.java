package com.example.PetRadar.missing;

import com.example.PetRadar.image.ImageStorageService;
import com.example.PetRadar.notification.NotificationService;
import com.example.PetRadar.search.MissingSearchService;
import com.example.PetRadar.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;
import com.example.PetRadar.global.error.NotFoundException;
import com.example.PetRadar.global.error.ForbiddenException;

@Service
@RequiredArgsConstructor
public class MissingService {
    private final MissingRepository missingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ImageStorageService imageStorageService;
    private final MissingSearchService searchService;

    @Value("${app.image.base-url}")
    private String imageBaseUrl;

    public Page<MissingDTO> getMissingList(String searchInput, Pageable pageable) {
        return missingRepository.findByTitleContainingIgnoreCase(searchInput, pageable)
                .map(missing -> MissingDTO.from(missing, imageBaseUrl));
    }

    /**
     * 지도가 쓸 전체 목록.
     *
     * 지도는 화면에 들어오는 것을 스스로 골라 그리므로 페이지로 자르면
     * 마커가 임의로 빠진다. 대신 좌표가 있는 글만 넘겨 쓸데없는 양을 줄인다.
     * 글이 크게 늘면 이 자리를 "보이는 범위" 질의로 바꿔야 한다.
     */
    public List<MissingDTO> getMissingPoints() {
        return missingRepository.findAllWithUser().stream()
                .filter(m -> m.getLatitude() != null && m.getLongitude() != null)
                .map(missing -> MissingDTO.from(missing, imageBaseUrl))
                .collect(Collectors.toList());
    }

    public List<MissingDTO> getMissingList(Long userId, Sort sort){
        return missingRepository.findByUserIdWithUser(userId, sort).stream()
                .map(missing -> MissingDTO.from(missing, imageBaseUrl))
                .collect(Collectors.toList());
    }

    public MissingDTO getMissingDetail(Long id) {
        Missing missing = missingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("실종 신고를 찾을 수 없습니다."));
        return MissingDTO.from(missing, imageBaseUrl);
    }

    public void createMissing(long userId, MissingRequest request, MultipartFile image) {
        Missing missing = request.toEntity();
        missing.setUser(userRepository.getReferenceById(userId));
        // 이미지는 파일로 저장하고 DB에는 키만 남긴다
        String imageKey = imageStorageService.store(image);
        missing.setPetImage(imageKey);
        try {
            missingRepository.save(missing);
        } catch (RuntimeException e) {
            // 글이 남지 않으면 그 파일은 아무도 가리키지 않는 채로 볼륨에 쌓인다.
            // 지울 수 있는 건 여기뿐이다 — 키가 DB에 없으니 나중에 찾아낼 방법이 없다
            imageStorageService.delete(imageKey);
            throw e;
        }
        searchService.index(missing);
        notificationService.createNotificationToAllUsers(userId,"missing", missing.getId());
    }

    public void updateMissing(Long id, MissingRequest request, long userId, MultipartFile image) {
        Missing existingMissing = missingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("실종 신고를 찾을 수 없습니다."));
        if (!existingMissing.getUser().getId().equals(userId)) {
            throw new ForbiddenException("본인이 등록한 신고만 수정할 수 있습니다.");
        }
        request.applyTo(existingMissing);

        // 새 이미지를 올린 경우에만 교체한다
        String previousKey = existingMissing.getPetImage();
        String newKey = null;
        if (image != null && !image.isEmpty()) {
            newKey = imageStorageService.store(image);
            existingMissing.setPetImage(newKey);
        }

        try {
            missingRepository.save(existingMissing);
        } catch (RuntimeException e) {
            // 방금 올린 것만 지운다. 이전 파일은 DB가 아직 가리키고 있다
            imageStorageService.delete(newKey);
            throw e;
        }

        // 교체가 실제로 반영된 뒤에 지운다.
        // 예전에는 save() 앞에서 지워, 저장이 실패하면 글은 그대로인데 사진만 사라졌다
        if (newKey != null) {
            imageStorageService.delete(previousKey);
        }
        searchService.index(existingMissing);
    }

    @Transactional
    public void deleteMissing(Long missingId, Long userId) {
        Missing missing = missingRepository.findById(missingId)
                .orElseThrow(() -> new NotFoundException("실종 신고를 찾을 수 없습니다."));
        if (!missing.getUser().getId().equals(userId)) {
            throw new ForbiddenException("본인이 등록한 신고만 삭제할 수 있습니다.");
        }
        purge(missing);
    }

    /**
     * 한 사용자의 실종 글을 전부 지운다 (회원 탈퇴).
     *
     * User의 cascade에 맡기면 이 경로를 타지 않아 색인과 이미지 파일이 남았다 —
     * 탈퇴로 사라진 글이 검색 결과에는 계속 뜨고, 눌러 들어가면 404가 났다.
     * 소유자 검증은 부르는 쪽이 이미 본인 계정임을 알고 있으므로 하지 않는다.
     */
    @Transactional
    public void deleteAllByUser(Long userId) {
        missingRepository.findByUserIdWithUser(userId, Sort.unsorted()).forEach(this::purge);
    }

    /**
     * 글 한 건을 지울 때 함께 정리해야 할 것들.
     *
     * 행만 지우면 남는 것이 둘이다 — 검색 색인과 업로드된 파일. 지우는 자리가
     * 둘(본인 삭제, 회원 탈퇴)이라 한쪽만 고치면 다시 어긋나므로 여기 모아 둔다.
     */
    private void purge(Missing missing) {
        // 달린 제보는 Missing의 cascade가 행을 지우지만, 파일까지 지워주지는 않는다
        missing.getReports().forEach(report -> imageStorageService.delete(report.getPetImage()));
        imageStorageService.delete(missing.getPetImage());
        missingRepository.delete(missing);
        searchService.delete(missing.getId());
    }
}
