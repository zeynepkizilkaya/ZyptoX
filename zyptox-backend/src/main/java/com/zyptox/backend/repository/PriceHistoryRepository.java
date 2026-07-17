package com.zyptox.backend.repository;

import com.zyptox.backend.entity.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {
    Optional<PriceHistory> findTopByAssetSymbolOrderByRecordedAtDesc(String assetSymbol);
    List<PriceHistory> findByAssetSymbolOrderByRecordedAtDesc(String assetSymbol);
}
