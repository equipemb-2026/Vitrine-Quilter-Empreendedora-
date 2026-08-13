/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { QuilterPiece, FilterState, StatusFilterOption } from './types.ts';
import { fetchPieces } from './services/piecesApi.ts';
import { Header } from './components/Header.tsx';
import { SearchBar } from './components/SearchBar.tsx';
import { Filters } from './components/Filters.tsx';
import { PieceGrid } from './components/PieceGrid.tsx';
import { PieceDetailsModal } from './components/PieceDetailsModal.tsx';
import { LoadingSkeleton } from './components/LoadingSkeleton.tsx';
import { EmptyState } from './components/EmptyState.tsx';
import { ErrorState } from './components/ErrorState.tsx';
import { NoticeBanner } from './components/NoticeBanner.tsx';
import { Footer } from './components/Footer.tsx';

const DEFAULT_COURSE_OPTIONS = [
  'Comunidade Master Quilter',
  'Quilter de Sucesso',
  'Quilterflix',
  'Quilting Livre para Iniciantes',
  'Quilting com Uso de Réguas',
];

export default function App() {
  const [pieces, setPieces] = useState<QuilterPiece[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState<boolean>(false);

  // Modal de Detalhes
  const [selectedPiece, setSelectedPiece] = useState<QuilterPiece | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Estado dos Filtros
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    statusFilter: 'all',
    selectedCourse: null,
    selectedState: null,
    sortBy: 'featured',
  });

  // Carrega as peças da API
  const loadPieces = useCallback(async (isRefresh: boolean = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetchPieces(isRefresh);
      if (response.success && Array.isArray(response.pieces)) {
        setPieces(response.pieces);
        setIsMock(Boolean(response.isMock));
      } else {
        throw new Error(response.error || 'Falha ao carregar as peças');
      }
    } catch (err: any) {
      setError(err.message || 'Não foi possível carregar as peças da vitrine.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPieces();
  }, [loadPieces]);

  // Opções dinâmicas de cursos
  const courseOptions = useMemo(() => {
    const coursesSet = new Set<string>(DEFAULT_COURSE_OPTIONS);
    pieces.forEach((p) => {
      p.courses?.forEach((c) => coursesSet.add(c));
    });
    return Array.from(coursesSet).filter(Boolean);
  }, [pieces]);

  // Opções dinâmicas de estados
  const stateOptions = useMemo(() => {
    const statesSet = new Set<string>();
    pieces.forEach((p) => {
      if (p.state) statesSet.add(p.state.trim().toUpperCase());
    });
    return Array.from(statesSet).sort();
  }, [pieces]);

  // Manipuladores de Filtro
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      statusFilter: 'all',
      selectedCourse: null,
      selectedState: null,
      sortBy: 'featured',
    });
  };

  const hasActiveFilters = Boolean(
    filters.searchQuery.trim() !== '' ||
    filters.statusFilter !== 'all' ||
    filters.selectedCourse !== null ||
    filters.selectedState !== null ||
    filters.sortBy !== 'featured'
  );

  // Filtragem e Ordenação no Frontend
  const filteredPieces = useMemo(() => {
    return pieces
      .filter((piece) => {
        // Busca textual (título ou autora)
        if (filters.searchQuery.trim() !== '') {
          const query = filters.searchQuery.toLowerCase().trim();
          const matchTitle = (piece.title || '').toLowerCase().includes(query);
          const matchAuthor = (piece.author || '').toLowerCase().includes(query);
          const matchCity = (piece.city || '').toLowerCase().includes(query);
          const matchId = (piece.id || '').toLowerCase().includes(query);
          if (!matchTitle && !matchAuthor && !matchCity && !matchId) {
            return false;
          }
        }

        // Filtro de Status
        if (filters.statusFilter === 'available' && piece.status !== 'Disponível') {
          return false;
        }
        if (filters.statusFilter === 'master' && !piece.master) {
          return false;
        }

        // Filtro por Curso
        if (filters.selectedCourse) {
          if (!piece.courses || !piece.courses.includes(filters.selectedCourse)) {
            return false;
          }
        }

        // Filtro por Estado
        if (filters.selectedState) {
          if ((piece.state || '').toUpperCase() !== filters.selectedState.toUpperCase()) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-asc') {
          return (a.price || 0) - (b.price || 0);
        }
        if (filters.sortBy === 'price-desc') {
          return (b.price || 0) - (a.price || 0);
        }
        if (filters.sortBy === 'name-asc') {
          return (a.author || '').localeCompare(b.author || '', 'pt-BR');
        }
        // 'featured': mantém a ordem da vitrine
        return 0;
      });
  }, [pieces, filters]);

  // Abertura do modal
  const handleOpenDetails = (piece: QuilterPiece) => {
    setSelectedPiece(piece);
    setIsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 selection:bg-rose-100 selection:text-rose-900">
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Cabeçalho */}
        <Header
          totalPieces={pieces.length}
          isMock={isMock}
          onRefresh={() => loadPieces(true)}
          isRefreshing={refreshing}
        />

        {/* Barra de Busca e Filtros */}
        <section id="search-and-filters-section" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SearchBar
              value={filters.searchQuery}
              onChange={(value) => handleFilterChange({ searchQuery: value })}
              onClear={() => handleFilterChange({ searchQuery: '' })}
            />
          </div>

          <Filters
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            courseOptions={courseOptions}
            stateOptions={stateOptions}
            totalResults={filteredPieces.length}
            hasActiveFilters={hasActiveFilters}
          />
        </section>

        {/* Grade de Peças ou Estados de Carregamento/Vazio */}
        <main id="main-content" className="pb-8">
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorState
              message={error}
              onRetry={() => loadPieces(false)}
            />
          ) : filteredPieces.length === 0 ? (
            <EmptyState
              hasActiveFilters={hasActiveFilters}
              onResetFilters={handleResetFilters}
            />
          ) : (
            <PieceGrid
              pieces={filteredPieces}
              onOpenDetails={handleOpenDetails}
            />
          )}
        </main>

        {/* Banner Informativo de Apoio */}
        <section id="info-section">
          <NoticeBanner />
        </section>
      </div>

      {/* Modal de Detalhes da Peça */}
      <PieceDetailsModal
        piece={selectedPiece}
        isOpen={isModalOpen}
        onClose={handleCloseDetails}
      />

      {/* Rodapé */}
      <Footer />
    </div>
  );
}
