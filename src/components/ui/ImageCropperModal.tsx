'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import Button from '@/components/ui/Button';

interface Props {
  src: string;
  aspect: number;
  title: string;
  onCrop: (blob: Blob) => void;
  onCancel: () => void;
}

function getCroppedImg(imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }): Promise<Blob> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.92);
    };
    image.src = imageSrc;
  });
}

export default function ImageCropperModal({ src, aspect, title, onCrop, onCancel }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((_: any, areaPixels: any) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;
    setLoading(true);
    try {
      const blob = await getCroppedImg(src, croppedAreaPixels);
      onCrop(blob);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onCancel}>
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-dark text-lg">{title}</h3>
          <button onClick={onCancel} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
            <i className="fas fa-xmark text-sm" />
          </button>
        </div>

        <div className="relative w-full aspect-square bg-gray-100">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            cropShape={aspect === 1 ? 'round' : 'rect'}
          />
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <i className="fas fa-search-minus text-gray-400 text-xs" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
            <i className="fas fa-search-plus text-gray-400 text-xs" />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
            <Button loading={loading} onClick={handleCrop} className="flex-1">Crop & Save</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
