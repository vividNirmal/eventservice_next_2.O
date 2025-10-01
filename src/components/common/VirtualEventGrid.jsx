import { memo, useMemo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';

const VirtualEventGrid = memo(({ events, onEdit, onClick, itemHeight = 250, itemWidth = 350 }) => {
  const containerHeight = Math.min(800, Math.ceil(events.length / 3) * itemHeight);
  const containerWidth = '100%';
  
  const columnCount = 3; // lg:grid-cols-3
  const rowCount = Math.ceil(events.length / columnCount);

  const EventItem = memo(({ columnIndex, rowIndex, style }) => {
    const eventIndex = rowIndex * columnCount + columnIndex;
    const event = events[eventIndex];
    
    if (!event) return <div style={style} />;
    
    return (
      <div style={style} className="p-2">
        <EventCard
          event={event}
          onEdit={onEdit}
          onClick={onClick}
        />
      </div>
    );
  });
  
  EventItem.displayName = 'EventItem';

  // Only use virtual scrolling for large lists
  if (events.length < 20) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <EventCard
            key={event._id}
            event={event}
            onEdit={onEdit}
            onClick={onClick}
          />
        ))}
      </div>
    );
  }

  return (
    <Grid
      columnCount={columnCount}
      columnWidth={itemWidth}
      height={containerHeight}
      rowCount={rowCount}
      rowHeight={itemHeight}
      width={containerWidth}
      className="virtual-grid"
    >
      {EventItem}
    </Grid>
  );
});

VirtualEventGrid.displayName = 'VirtualEventGrid';

export default VirtualEventGrid;
