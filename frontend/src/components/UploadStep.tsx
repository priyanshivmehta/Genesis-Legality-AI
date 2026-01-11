/* — SAME IMPORTS — */
import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, X } from 'lucide-react';

interface UploadStepProps {
  onComplete: (fileName: string, fileSize: number, file: File) => void;
  loading: boolean;
}

export default function UploadStep({ onComplete }: UploadStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [modal, setModal] = useState<null | 'about' | 'features'>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') handleFileSelect(droppedFile);
  };
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setTimeout(() => onComplete(selectedFile.name, selectedFile.size, selectedFile), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFileSelect(selectedFile);
  };
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-5 border-b bg-white shadow-sm">
        <div className="text-3xl font-bold tracking-tight text-blue-600">
          Clause<span className="text-gray-900">AI</span>
        </div>
        <div className="flex space-x-8 text-gray-600 text-[1.05rem] font-medium">
          <button onClick={() => setModal('about')} className="hover:text-blue-600 transition">About</button>
          <button onClick={() => setModal('features')} className="hover:text-blue-600 transition">Features</button>
        </div>
      </nav>

      {/* HERO */}
      <div className="flex flex-col items-center text-center mt-16 px-6 mb-10">
        <h1 className="text-[3.4rem] font-bold text-gray-900 tracking-tight mb-4 leading-[1.15]">
          Understand Contracts <span className="text-blue-600">Effortlessly</span>
        </h1>
        <p className="text-[1.15rem] text-gray-700 max-w-2xl leading-relaxed">
          Upload any NDA or business contract and let our AI highlight hidden risks and obligations within seconds.
        </p>
        <p className="mt-2 text-[0.95rem] text-gray-500">Powered by legal-grade AI models.</p>
      </div>

      {/* UPLOAD */}
      <div className="flex items-center justify-center px-4 pb-20">
        <div className="max-w-2xl w-full">

          <div className="text-center mb-8">
            <h2 className="text-[1.65rem] font-semibold text-gray-900 mb-2">
              Upload your contract
            </h2>
            <p className="text-[0.95rem] text-gray-600">
              Supports PDF files up to 10MB
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                isDragging ? 'border-blue-500 bg-blue-50'
                : file ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileInputChange}
              />

              {!file ? (
                <>
                  <Upload className="w-14 h-14 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-[1.15rem] font-medium text-gray-900 mb-2">
                    Drop your PDF here
                  </h3>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-[1.05rem]"
                  >
                    Choose File
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-3">
                    {uploadProgress === 100
                      ? <CheckCircle2 className="w-10 h-10 text-green-600" />
                      : <FileText className="w-10 h-10 text-gray-600" />}
                    <div className="text-left">
                      <p className="font-medium text-gray-900 text-[1rem]">{file.name}</p>
                      <p className="text-[0.9rem] text-gray-600">{formatFileSize(file.size)}</p>
                    </div>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <p className="text-[0.9rem] text-gray-600">Uploading... {uploadProgress}%</p>
                    </div>
                  )}

                  {uploadProgress === 100 && (
                    <p className="text-[0.95rem] font-medium text-green-600">Upload complete</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white shadow-xl rounded-lg max-w-lg w-full p-7 relative">
            <button className="absolute top-3 right-3" onClick={() => setModal(null)}>
              <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
            </button>

            {modal === 'about' && (
              <>
                <h3 className="text-[1.6rem] font-semibold mb-3">About ClauseAI</h3>
                <p className="text-[1.05rem] text-gray-700 leading-relaxed">
                  ClauseAI highlights risk areas, obligations, deadlines, compliance issues and legal inconsistencies inside contracts using AI — helping users make informed decisions before signing.
                </p>
              </>
            )}

            {modal === 'features' && (
              <>
                <h3 className="text-[1.6rem] font-semibold mb-3">Features</h3>
                <ul className="text-[1.05rem] text-gray-700 space-y-2 leading-relaxed">
                  <li>• AI clause detection</li>
                  <li>• Risk scoring</li>
                  <li>• Obligation extraction</li>
                  <li>• Compliance checks</li>
                  <li>• Timeline & deadline analysis</li>
                  <li>• Supports NDAs & vendor agreements</li>
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
