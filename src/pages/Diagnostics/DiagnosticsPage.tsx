'use client';

import type React from 'react';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStethoscope, FaSearch, FaExclamationCircle } from 'react-icons/fa';

import DiagnosisHistory from '../../components/DiagnosisHistory';
import PlantSelector from '../../components/PlantSelectorDiagnostics';
import ImageUploader from '../../components/ImageUploader';
import PredictionResultDialog from '../../components/PredictionResultDialog';

import {
  diagnosisApi,
  type PredictionData,
  type ApiError,
} from '../../lib/api/diagnosis';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';

type PlantType = 'cabai' | 'tomat' | 'selada' | null;

const DiagnosticsPage = () => {
  const navigate = useNavigate();
  const [selectedPlant, setSelectedPlant] = useState<PlantType>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [predictionResult, setPredictionResult] =
    useState<PredictionData | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  const plants = [
    {
      id: 'cabai' as const,
      name: 'Cabai',
      icon: '🌶️',
      color: 'bg-red-100 hover:bg-red-200 border-red-300',
      selectedColor: 'bg-red-500 text-white',
    },
    {
      id: 'tomat' as const,
      name: 'Tomat',
      icon: '🍅',
      color: 'bg-red-100 hover:bg-red-200 border-red-300',
      selectedColor: 'bg-red-500 text-white',
    },
    {
      id: 'selada' as const,
      name: 'Selada',
      icon: '🥬',
      color: 'bg-green-100 hover:bg-green-200 border-green-300',
      selectedColor: 'bg-green-500 text-white',
    },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal adalah 5MB');
        return;
      }
      setIsUploading(true);
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setIsUploading(false);
        alert('Gagal membaca file gambar.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleTakePhoto = () => {
    setIsUploading(true);
    setUploadedFileName('camera_capture.jpg');
    setTimeout(() => {
      setUploadedImage('/img/placeholder-plant.jpg');
      setIsUploading(false);
    }, 1500);
  };

  const handleEditImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUploadedImage(null);
    setUploadedFileName('');
    setIsUploading(false);
  };

  const handleStartDiagnosis = async () => {
    if (!selectedPlant || !fileInputRef.current?.files?.[0]) {
      alert('Pilih tanaman dan unggah foto terlebih dahulu');
      return;
    }

    setIsPredicting(true);
    setPredictionError(null);
    setPredictionResult(null);

    try {
      const file = fileInputRef.current.files[0];
      const response = await diagnosisApi.predict(selectedPlant, file);

      if (response.status === 200 && response.data) {
        setPredictionResult(response.data);
        setIsResultDialogOpen(true);
      } else {
        setPredictionError(
          response.message || 'Gagal mendapatkan hasil diagnosa.'
        );
      }
    } catch (error: any) {
      const apiErr = error as ApiError;
      console.error('Prediction error:', apiErr);
      setPredictionError(
        apiErr.message || 'Gagal melakukan diagnosa. Silakan coba lagi.'
      );
    } finally {
      setIsPredicting(false);
    }
  };

  const handleNavigateToFullResult = () => {
    if (predictionResult && uploadedImage) {
      const queryParams = new URLSearchParams();
      queryParams.append('diseaseId', predictionResult.disease.id);
      queryParams.append('plantType', predictionResult.tanaman);
      queryParams.append('confidence', predictionResult.confidence.toString());
      queryParams.append('image', encodeURIComponent(uploadedImage));

      navigate(`/diagnostics-result?${queryParams.toString()}`);
      setIsResultDialogOpen(false);
    }
  };

  const handleViewDetailHistory = (diagnosisId: string) => {
    console.log('Viewing diagnosis detail from history:', diagnosisId);
    alert(`Menampilkan detail diagnosa ${diagnosisId} dari history`);
  };

  const handleFilterHistory = () => {
    console.log('Opening filter options for history');
    alert('Filter options: Tanggal, Jenis Penyakit, Status');
  };

  const canStartDiagnosis =
    selectedPlant && uploadedImage && !isUploading && !isPredicting;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-[#d8ede3] py-6">
        <div className="container mx-auto px-2">
          <div className="bg-white rounded-lg shadow-sm p-8 mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                Diagnosa Penyakit Tanaman
              </h1>
              <FaStethoscope className="text-green-600 text-2xl" />
            </div>

            <p className="text-gray-600 mb-8">
              Unggah foto tanaman Anda yang sakit untuk mendapatkan diagnosa
              awal dan saran penanganan.
            </p>

            <PlantSelector
              plants={plants}
              selectedPlant={selectedPlant}
              onSelectPlant={setSelectedPlant}
            />

            <ImageUploader
              uploadedImage={uploadedImage}
              isUploading={isUploading}
              uploadedFileName={uploadedFileName}
              fileInputRef={fileInputRef}
              onFileUpload={handleFileUpload}
              onUploadClick={handleUploadClick}
              onTakePhoto={handleTakePhoto}
              onEditImage={handleEditImage}
            />

            {predictionError && !isResultDialogOpen && (
              <Alert variant="destructive" className="mb-6">
                <FaExclamationCircle className="h-4 w-4" />
                <AlertTitle>Error Diagnosa</AlertTitle>
                <AlertDescription>{predictionError}</AlertDescription>
              </Alert>
            )}

            <div className="text-center">
              <button
                onClick={handleStartDiagnosis}
                disabled={!canStartDiagnosis || isPredicting}
                className={`py-3 px-8 rounded-md font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 mx-auto ${
                  canStartDiagnosis && !isPredicting
                    ? 'bg-green-700 text-white hover:bg-green-800 hover:scale-105 shadow-lg cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FaSearch />
                {isPredicting
                  ? 'Mendiagnosa...'
                  : isUploading
                  ? 'Menunggu Upload...'
                  : 'Mulai Diagnosa'}
              </button>

              {!selectedPlant && !isPredicting && (
                <p className="text-sm text-red-500 mt-2">
                  Pilih jenis tanaman terlebih dahulu.
                </p>
              )}
              {selectedPlant &&
                !uploadedImage &&
                !isUploading &&
                !isPredicting && (
                  <p className="text-sm text-red-500 mt-2">
                    Unggah foto tanaman untuk memulai diagnosa.
                  </p>
                )}
            </div>
          </div>

          <div className="mt-10">
            <DiagnosisHistory
              onViewDetail={handleViewDetailHistory}
              onFilter={handleFilterHistory}
            />
          </div>
        </div>
      </main>

      <PredictionResultDialog
        isOpen={isResultDialogOpen}
        onOpenChange={setIsResultDialogOpen}
        predictionResult={predictionResult}
        uploadedImage={uploadedImage}
        isPredicting={isPredicting}
        predictionError={predictionError}
        onNavigateToFullResult={handleNavigateToFullResult}
      />
    </div>
  );
};

export default DiagnosticsPage;
