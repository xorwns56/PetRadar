package com.example.PetRadar.report;

import com.example.PetRadar.image.ImageStorageService;
import com.example.PetRadar.missing.Missing;
import com.example.PetRadar.missing.MissingRepository;
import com.example.PetRadar.notification.NotificationService;
import com.example.PetRadar.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;
import com.example.PetRadar.global.error.NotFoundException;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final ReportRepository reportRepository;
    private final MissingRepository missingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ImageStorageService imageStorageService;

    @Value("${app.image.base-url}")
    private String imageBaseUrl;

    public ReportDTO findReportById(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new NotFoundException("제보를 찾을 수 없습니다."));
        return ReportDTO.from(report, imageBaseUrl);
    }

    public Page<ReportDTO> getReportsByMissingId(Long missingId, Pageable pageable) {
        Page<Report> reportPage = reportRepository.findByMissingId(missingId, pageable);
        List<ReportDTO> reportDTOList = reportPage.stream()
                .map(report -> ReportDTO.from(report, imageBaseUrl))
                .collect(Collectors.toList());
        return new PageImpl<>(reportDTOList, pageable, reportPage.getTotalElements());
    }

    public void createReport(Long userId, Long missingId, ReportRequest request, MultipartFile image) {
        Report report = request.toEntity();
        report.setUser(userRepository.getReferenceById(userId));
        Missing missing = missingRepository.findById(missingId)
                .orElseThrow(() -> new NotFoundException("제보할 실종 신고를 찾을 수 없습니다."));
        report.setMissing(missing);
        // 이미지는 파일로 저장하고 DB에는 키만 남긴다
        report.setPetImage(imageStorageService.store(image));
        reportRepository.save(report);
        // 어느 제보인지 남겨야 알림에 사진과 제목을 띄울 수 있다
        notificationService.createNotificationToUser(
                userId, missing.getUser().getId(), "report", missingId,
                String.valueOf(report.getId()));
    }
}
