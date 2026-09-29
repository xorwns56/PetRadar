package com.example.PetRadar.shelter;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SeenShelterAnimalRepository extends JpaRepository<SeenShelterAnimal, String> {

    @Query("select s.desertionNo from SeenShelterAnimal s")
    List<String> findAllDesertionNos();
}
