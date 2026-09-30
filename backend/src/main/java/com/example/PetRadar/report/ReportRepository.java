package com.example.PetRadar.report;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    Page<Report> findByMissingId(Long missingId, Pageable pageable);

    /**
     * 한 사람이 남긴 제보 전부 (회원 탈퇴 정리용).
     *
     * 남의 글에 남긴 제보는 User에도 Missing에도 매달려 있지 않아 cascade가
     * 닿지 않는다. 그대로 두면 report.user_id가 사라진 사용자를 가리켜
     * FK 제약에 걸렸다.
     */
    List<Report> findByUserId(Long userId);
}
