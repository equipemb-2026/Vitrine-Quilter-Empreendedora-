import React from 'react';
import { QuilterPiece } from '../types.ts';
import { PieceCard } from './PieceCard.tsx';

interface PieceGridProps {
  pieces: QuilterPiece[];
  onOpenDetails: (piece: QuilterPiece) => void;
}

export const PieceGrid: React.FC<PieceGridProps> = ({ pieces, onOpenDetails }) => {
  return (
    <div
      id="pieces-grid"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
    >
      {pieces.map((piece) => (
        <PieceCard
          key={piece.id}
          piece={piece}
          onOpenDetails={onOpenDetails}
        />
      ))}
    </div>
  );
};
