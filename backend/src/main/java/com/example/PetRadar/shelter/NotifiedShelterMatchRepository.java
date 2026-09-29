package com.example.PetRadar.shelter;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NotifiedShelterMatchRepository extends JpaRepository<NotifiedShelterMatch, Long> {

    boolean existsByMissingIdAndDesertionNo(Long missingId, String desertionNo);
}
