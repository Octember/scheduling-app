import { format } from "date-fns";
import { useState } from "react";

function getStartEndTime(selection: { start: { row: number, col: number }, current: { row: number, col: number } }): { start: Date, end: Date } {

  if (selection.start.row > selection.current.row) {
    const startTime = calculateTimeFromRow(selection.current.row - 1)
    const endTime = calculateTimeFromRow(selection.start.row)
    return { start: startTime, end: endTime }
  }

  const startTime = calculateTimeFromRow(selection.start.row - 1)
  const endTime = calculateTimeFromRow(selection.current.row)
  return { start: startTime, end: endTime }
}

const calculateTimeFromRow = (row: number): Date => {
  const date = new Date();
  date.setHours(8 + Math.floor(row / 2));
  date.setMinutes((row % 2) * 30);
  return date;
};



interface GridSelectionProps {
  spaceCount: number;
  timeLabels: string[];
  onSelectionComplete?: (start: Date, end: Date, spaceIndex: number) => void;
}

export const GridSelection: React.FC<GridSelectionProps> = ({ spaceCount, timeLabels, onSelectionComplete }) => {
  const [selection, setSelection] = useState<{
    start: { row: number; col: number } | null;
    current: { row: number; col: number } | null;
  }>({ start: null, current: null });
  const [isSelecting, setIsSelecting] = useState(false);

  const handleMouseDown = (row: number, col: number) => {
    setIsSelecting(true);
    setSelection({ start: { row, col }, current: { row, col } });
  };

  const handleMouseMove = (row: number, col: number) => {
    if (isSelecting) {
      setSelection(prev => ({ ...prev, current: { row, col } }));
    }
  };


  const handleMouseUp = () => {
    setIsSelecting(false);
    if (selection.start && selection.current) {
      const { start, end } = getStartEndTime(selection)
      console.log(format(start, 'HH:mm'), format(end, 'HH:mm'))

      if (onSelectionComplete) {
        onSelectionComplete(start, end, selection.start.col);
      }
    }
    setSelection({ start: null, current: null });
  };

  const getGridCell = (row: number, col: number) => {
    if (!selection.start || !selection.current || !isSelecting) return '';

    const minRow = Math.min(selection.start.row, selection.current.row);
    const maxRow = Math.max(selection.start.row, selection.current.row);
    const minCol = Math.min(selection.start.col, selection.current.col);
    const maxCol = Math.max(selection.start.col, selection.current.col);

    if (row >= minRow && row <= maxRow && col >= minCol && col <= maxCol) {
      return 'bg-pink-100 opacity-50';
    }
    return '';
  };

  return (
    <div
      className="col-start-1 col-end-2 row-start-1 grid sm:pr-8"
      style={{
        gridTemplateRows: `2rem repeat(${timeLabels.length * 2}, 2rem)`,
        gridTemplateColumns: `repeat(${spaceCount}, minmax(0, 1fr))`
      }}
      onMouseUp={handleMouseUp}
    >
      {Array.from({ length: timeLabels.length * 12 }).map((_, row) =>
        Array.from({ length: spaceCount }).map((_, col) => (
          <div
            key={`${row}-${col}`}
            className={`${getGridCell(row, col)} inset-1 roundedcursor-pointer`}
            onMouseDown={() => handleMouseDown(row, col)}
            onMouseMove={() => handleMouseMove(row, col)}
          />
        ))
      )}
    </div>
  );
};