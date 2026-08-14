/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { QuilterPiece, FilterState } from './types.ts';
import { fetchPieces, extractErrorMessage } from './services/piecesApi.ts';
import { getSessionCachedPieces, saveSessionCachedPieces } from './utils/sessionCache.ts';
import { normalizeSearchText } from './utils/normalizeUtils.ts';
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
  // Inicialização com cache de sessão para renderização instantânea
  const [pieces, setPieces] = useState<QuilterPiece[]>(() => {
    const cached = getSessionCachedPieces();
    return cached && cached.length > 0 ? cached : [];
  });

  // initialLoading é true APENAS quando não temos nenhum dado na tela ainda
  const [initialLoading, setInitialLoading] = useState<boolean>(() => {
    const cached = getSessionCachedPieces();
    return !cached || cached.length === 0;
  });

  // refreshing é true quando já temos peças exibidas e estamos atualizando em segundo plano
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal de Detalhes
  const [selectedPiece, setSelectedPiece] = useState<QuilterPiece | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Controle de requisição ativa para evitar race conditions e StrictMode issues
  const abortControllerRef = useRef<AbortController | null>(null);
  const isFetchingRef = useRef<boolean>(false);
  const reqIdRef = useRef<number>(0);

  // Estado dos Filtros
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    statusFilter: 'all',
    selectedCourse: null,
    selectedState: null,
    sortBy: 'featured',
  });

  // Carrega as peças da API com proteção contra race conditions, retry automático e fallback resiliente
  const loadPieces = useCallback(async (isManualRefresh: boolean = false) => {
    if (isFetchingRef.current && !isManualRefresh) return;

    // Incrementa identificador sequencial para descartar respostas desatualizadas
    const currentReqId = ++reqIdRef.current;

    // Cancela requisição anterior se ainda estiver em andamento
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    isFetchingRef.current = true;

    // Ajusta o estado de carregamento de forma limpa
    if (pieces.length === 0) {
      setInitialLoading(true);
    } else {
      setRefreshing(true);
    }

    setError(null);

    try {
      // Chama a API com retry automático interno de 2 tentativas
      const response = await fetchPieces(isManualRefresh, controller.signal);

      // Se outra requisição foi disparada enquanto aguardávamos, descarta esta resposta
      if (currentReqId !== reqIdRef.current) return;

      if (response.success && Array.isArray(response.pieces)) {
        setPieces(response.pieces);
        saveSessionCachedPieces(response.pieces);
        setError(null);
      } else {
        throw new Error('Não foi possível carregar a vitrine.');
      }
    } catch (err: unknown) {
      // Ignora erros se a requisição foi abortada intencionalmente
      if (currentReqId !== reqIdRef.current || controller.signal.aborted) {
        return;
      }

      const errorMsg = extractErrorMessage(err);
      console.warn('[Vitrine] Falha no carregamento:', errorMsg);

      // REGRA CRÍTICA: Se já existirem peças exibidas na tela, NUNCA as apague nem mostre tela branca/erro
      setPieces((currentPieces) => {
        if (currentPieces.length === 0) {
          setError(errorMsg);
        }
        return currentPieces;
      });
    } finally {
      if (currentReqId === reqIdRef.current) {
        setInitialLoading(false);
        setRefreshing(false);
        isFetchingRef.current = false;
      }
    }
  }, []);

  // Executa no carregamento inicial da aplicação
  useEffect(() => {
    loadPieces(false);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadPieces]);

  // Opções dinâmicas de cursos
  const courseOptions = useMemo(() => {
    const coursesSet = new Set<string>(DEFAULT_COURSE_OPTIONS);
    pieces.forEach((p) => {
      p.courses?.forEach((c) => {
        if (c && c.trim()) coursesSet.add(c.trim());
      });
    });
    return Array.from(coursesSet).filter(Boolean);
  }, [pieces]);

  // Opções dinâmicas de estados
  const stateOptions = useMemo(() => {
    const statesSet = new Set<string>();
    pieces.forEach((p) => {
      if (p.state && p.state.trim()) {
        statesSet.add(p.state.trim().toUpperCase());
      }
    });
    return Array.from(statesSet).sort();
  }, [pieces]);

  // Manipuladores de Filtro
  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      statusFilter: 'all',
      selectedCourse: null,
      selectedState: null,
      sortBy: 'featured',
    });
  }, []);

  const hasActiveFilters = Boolean(
    filters.searchQuery.trim() !== '' ||
    filters.statusFilter !== 'all' ||
    filters.selectedCourse !== null ||
    filters.selectedState !== null ||
    filters.sortBy !== 'featured'
  );

  // Filtragem e Ordenação 100% no Frontend (zero chamadas HTTP ao filtrar ou buscar)
  const filteredPieces = useMemo(() => {
    const normalizedQuery = normalizeSearchText(filters.searchQuery);

    return pieces
      .filter((piece) => {
        // Busca textual com suporte a acentos
        if (normalizedQuery !== '') {
          const matchTitle = normalizeSearchText(piece.title).includes(normalizedQuery);
          const matchAuthor = normalizeSearchText(piece.author).includes(normalizedQuery);
          const matchCity = normalizeSearchText(piece.city).includes(normalizedQuery);
          const matchId = normalizeSearchText(piece.id).includes(normalizedQuery);
          const matchDescription = normalizeSearchText(piece.description).includes(normalizedQuery);
          
          if (!matchTitle && !matchAuthor && !matchCity && !matchId && !matchDescription) {
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
        // 'featured': preserva a ordem da vitrine
        return 0;
      });
  }, [pieces, filters]);

  // Abertura do modal
  const handleOpenDetails = useCallback((piece: QuilterPiece) => {
    setSelectedPiece(piece);
    setIsModalOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 selection:bg-rose-100 selection:text-rose-900">
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Cabeçalho visível imediatamente */}
        <Header
          totalPieces={pieces.length}
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
          {initialLoading ? (
            <LoadingSkeleton />
          ) : error && pieces.length === 0 ? (
            <ErrorState
              message={error}
              onRetry={() => loadPieces(false)}
              isRetrying={initialLoading || refreshing}
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

      {/* Modal de Detalhes da Peça: Montado apenas quando aberto */}
      {isModalOpen && selectedPiece && (
        <PieceDetailsModal
          piece={selectedPiece}
          isOpen={isModalOpen}
          onClose={handleCloseDetails}
        />
      )}

      {/* Rodapé */}
      <Footer />
    </div>
  );
}


