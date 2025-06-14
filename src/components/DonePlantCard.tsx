
import React from 'react';
import { FaCheckSquare, FaHistory } from 'react-icons/fa';
import type { ActivePlant } from '../utils/plantings';

interface DonePlantCardProps {
  plant: ActivePlant;
  onToggleChecklistItem: (
    plantId: string,
    checklistItemId: string,
    section: 'growing' | 'done'
  ) => void; // This prop might be considered for removal if items are fully non-interactive
  onViewDiagnosisHistory: (plantId: string) => void;
}

const DonePlantCard: React.FC<DonePlantCardProps> = ({
  plant,
  // onToggleChecklistItem, // Intentionally not used to make items non-interactive
  onViewDiagnosisHistory,
}) => {
  return (
    <div
      key={plant.id}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col gap-4"
    >
      <div className="relative">
        <img
          src={plant.imageUrl}
          alt={plant.localName}
          className="w-full h-48 object-cover rounded-md"
        />
        <div className="absolute top-2 right-2 bg-green-500 p-1 rounded-full">
          <img src="/icons/check.png" alt="Selesai" className="w-8 h-8" />
        </div>
      </div>
      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold text-[#323232]">{plant.localName}</h3>
        </div>
        <h4 className="text-md font-semibold text-[#323232] mb-2">
          Checklist Perawatan:
        </h4>
        <ul className="space-y-2 text-sm text-[#323232] mb-auto">
          {plant.checklist.length > 0 ? (
            plant.checklist.map((item) => (
              <li
                key={item.id}
                className="flex items-center" // Removed cursor-pointer
                // onClick={() => onToggleChecklistItem(plant.id, item.id, 'done')} // Removed onClick
              >
                <FaCheckSquare className="mr-2 text-[#295F4E] text-lg" />
                <span className="line-through text-gray-500">
                  {item.text}
                </span>
              </li>
            ))
          ) : (
            <li>Tidak ada checklist perawatan</li>
          )}
        </ul>

        <div className="mt-auto pt-4 flex flex-col justify-center items-center">
          {plant.diagnosisCount > 0 ? (
            <button
              onClick={() => onViewDiagnosisHistory(plant.id)}
              className="w-full bg-gray-200 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center text-sm font-semibold"
            >
              <FaHistory className="mr-2" /> Lihat Riwayat Diagnosa (
              {plant.diagnosisCount})
            </button>
          ) : (
            <div className="w-full h-full"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonePlantCard;
