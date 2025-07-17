import { useState, useRef } from 'react';
import { DndContext, useDraggable, DragEndEvent } from '@dnd-kit/core';

interface Position {
  x: number;
  y: number;
}

interface Dimensions {
  width: number;
  height: number;
}

interface FocalPointProps {
  position: Position;
}

const FocalPoint = ({ position }: FocalPointProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'focal-point',
  });

  const style = {
    transform: transform 
      ? `translate3d(${position.x + transform.x}px, ${position.y + transform.y}px, 0)`
      : `translate3d(${position.x}px, ${position.y}px, 0)`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="absolute w-6 h-6 -ml-3 -mt-3 bg-focal-point rounded-full border-2 border-white shadow-lg cursor-grab active:cursor-grabbing z-20 hover:scale-110 transition-transform"
    />
  );
};

interface ImageDimensionsPickerProps {
  imageUrl: string;
  containerDimensions?: Dimensions;
  mobileWidth?: number;
  tabletWidth?: number;
}

const ImageDimensionsPicker = ({
  imageUrl,
  containerDimensions = { width: 800, height: 400 },
  mobileWidth = 200,
  tabletWidth = 400,
}: ImageDimensionsPickerProps) => {
  const [focalPoint, setFocalPoint] = useState<Position>({
    x: containerDimensions.width / 2,
    y: containerDimensions.height / 2,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate container positions based on focal point
  const getMobileContainerPosition = (focalX: number): number => {
    const halfMobileWidth = mobileWidth / 2;
    
    // Keep mobile container centered on focal point
    let mobileLeft = focalX - halfMobileWidth;
    
    // Clamp to container boundaries
    mobileLeft = Math.max(0, Math.min(mobileLeft, containerDimensions.width - mobileWidth));
    
    return mobileLeft;
  };

  const getTabletContainerPosition = (focalX: number): number => {
    const halfTabletWidth = tabletWidth / 2;
    
    // Try to center tablet container on focal point
    let tabletLeft = focalX - halfTabletWidth;
    
    // Clamp to container boundaries
    tabletLeft = Math.max(0, Math.min(tabletLeft, containerDimensions.width - tabletWidth));
    
    return tabletLeft;
  };

  const mobileLeft = getMobileContainerPosition(focalPoint.x);
  const tabletLeft = getTabletContainerPosition(focalPoint.x);

  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event;
    
    if (!containerRef.current) return;

    const newX = Math.max(0, Math.min(focalPoint.x + delta.x, containerDimensions.width));
    const newY = Math.max(0, Math.min(focalPoint.y + delta.y, containerDimensions.height));

    // Check if tablet container is at boundary
    const newTabletLeft = getTabletContainerPosition(newX);
    const isTabletAtLeftBoundary = newTabletLeft === 0;
    const isTabletAtRightBoundary = newTabletLeft === containerDimensions.width - tabletWidth;

    // If tablet is at boundary, allow focal point to move beyond mobile center
    let finalX = newX;
    
    if (!isTabletAtLeftBoundary && !isTabletAtRightBoundary) {
      // Normal case: focal point stays in center of mobile container
      const newMobileLeft = getMobileContainerPosition(newX);
      finalX = newMobileLeft + mobileWidth / 2;
    }

    setFocalPoint({
      x: finalX,
      y: newY,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Image Dimensions Picker</h2>
        <p className="text-muted-foreground">
          Drag the focal point (yellow circle) to adjust mobile and tablet crops
        </p>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div
          ref={containerRef}
          className="relative mx-auto border-2 border-border rounded-lg overflow-hidden"
          style={{
            width: containerDimensions.width,
            height: containerDimensions.height,
          }}
        >
          {/* Background Image */}
          <img
            src={imageUrl}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-picker-overlay" />

          {/* Tablet Container (Blue) */}
          <div
            className="absolute top-0 h-full bg-tablet-container/60 border-2 border-tablet-container transition-all duration-200"
            style={{
              left: tabletLeft,
              width: tabletWidth,
            }}
          >
            <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-medium">
              Tablet
            </div>
          </div>

          {/* Mobile Container (Red) */}
          <div
            className="absolute top-0 h-full bg-mobile-container/60 border-2 border-mobile-container transition-all duration-200"
            style={{
              left: mobileLeft,
              width: mobileWidth,
            }}
          >
            <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-medium">
              Mobile
            </div>
          </div>

          {/* Focal Point */}
          <FocalPoint position={focalPoint} />
        </div>
      </DndContext>

      {/* Info Panel */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold mb-2 flex items-center">
            <div className="w-3 h-3 bg-focal-point rounded-full mr-2"></div>
            Focal Point
          </h3>
          <p className="text-muted-foreground">
            X: {Math.round(focalPoint.x)}, Y: {Math.round(focalPoint.y)}
          </p>
        </div>
        
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold mb-2 flex items-center">
            <div className="w-3 h-3 bg-mobile-container rounded mr-2"></div>
            Mobile Crop
          </h3>
          <p className="text-muted-foreground">
            Left: {Math.round(mobileLeft)}, Width: {mobileWidth}
          </p>
        </div>
        
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold mb-2 flex items-center">
            <div className="w-3 h-3 bg-tablet-container rounded mr-2"></div>
            Tablet Crop
          </h3>
          <p className="text-muted-foreground">
            Left: {Math.round(tabletLeft)}, Width: {tabletWidth}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageDimensionsPicker;
