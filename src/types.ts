export type PieceStatus = 'Disponível' | 'Reservada' | 'Vendida';

export interface PieceImages {
  front: string;
  back?: string;
  detail?: string;
}

export interface QuilterPiece {
  id: string;
  author: string;
  title: string;
  description: string;
  size: string;
  price: number;
  city: string;
  state: string;
  cep?: string;
  master: boolean;
  courses: string[];
  payments: string[];
  shipping: string[];
  status: PieceStatus;
  images: PieceImages;
  whatsapp: string;
  publishedAt?: string;
}

export interface ApiPiecesResponse {
  success: boolean;
  pieces: QuilterPiece[];
  isMock?: boolean;
  total?: number;
  error?: string;
  warning?: string;
}

export type StatusFilterOption = 'all' | 'available' | 'master';

export interface FilterState {
  searchQuery: string;
  statusFilter: StatusFilterOption;
  selectedCourse: string | null;
  selectedState: string | null;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'name-asc';
}
