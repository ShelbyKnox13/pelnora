import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Upload, 
  X 
} from 'lucide-react';

// KYC Status types
export enum KYCStatus {
  NOT_SUBMITTED = 'not_submitted',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

type KYCVerificationModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  allowClose?: boolean;
  onKYCSubmitted?: () => void;
};

export function KYCVerificationModal({
  isOpen,
  onClose,
  allowClose = false,
  onKYCSubmitted
}: KYCVerificationModalProps) {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [panNumber, setPanNumber] = useState('');
  const [idProofType, setIdProofType] = useState('aadhar');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [panCardFile, setPanCardFile] = useState<File | null>(null);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<KYCStatus>(KYCStatus.NOT_SUBMITTED);

  // Check KYC status when component mounts or user changes
  useEffect(() => {
    if (user) {
      // Determine KYC status based on user data
      if (user.panCardImage && user.panNumber) {
        if (user.kycStatus === 'approved') {
          setKycStatus(KYCStatus.APPROVED);
        } else if (user.kycStatus === 'rejected') {
          setKycStatus(KYCStatus.REJECTED);
        } else {
          setKycStatus(KYCStatus.PENDING);
        }
      } else {
        setKycStatus(KYCStatus.NOT_SUBMITTED);
      }

      // Prefill form if data exists
      if (user.panNumber) setPanNumber(user.panNumber);
      if (user.idProofType) setIdProofType(user.idProofType);
      if (user.idProofNumber) setIdProofNumber(user.idProofNumber);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!panNumber || !idProofType || !idProofNumber || !panCardFile) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields and upload PAN Card document",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create form data for file uploads
      const formData = new FormData();
      formData.append('panNumber', panNumber);
      formData.append('idProofType', idProofType);
      formData.append('idProofNumber', idProofNumber);
      formData.append('panCardImage', panCardFile);
      // Only append ID proof if it exists
      if (idProofFile) {
        formData.append('idProofImage', idProofFile);
      }

      // Submit KYC data
      const response = await apiRequest('POST', '/api/kyc/submit', formData, {
        isFormData: true,
        headers: {
          'x-user-id': user?.id?.toString() || ''
        }
      });
      
      if (response.ok) {
        toast({
          title: "KYC submitted successfully",
          description: "Your KYC documents are under verification",
        });
        setKycStatus(KYCStatus.PENDING);
        if (onKYCSubmitted) onKYCSubmitted();
        refreshUser(); // Refresh user data
      } else {
        const errorData = await response.json();
        toast({
          title: "Failed to submit KYC",
          description: errorData.error || "Please try again later",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error submitting KYC",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render different content based on KYC status
  const renderContent = () => {
    switch (kycStatus) {
      case KYCStatus.APPROVED:
        return (
          <div className="text-center p-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Congratulations!</h3>
            <p className="text-gray-600 mb-6">Your KYC is approved. You can now update your bank details and request withdrawals.</p>
            {allowClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-dark text-base font-medium text-white hover:bg-purple sm:w-auto sm:text-sm"
              >
                Close
              </button>
            )}
          </div>
        );
      
      case KYCStatus.PENDING:
        return (
          <div className="text-center p-6">
            <Clock className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">KYC Under Verification</h3>
            <p className="text-gray-600 mb-6">Your KYC documents are being verified. This process may take up to 12 hours. Once your KYC is approved, you can update your bank details and request withdrawals.</p>
            <div className="flex justify-center space-x-4">
              <a 
                href="/dashboard" 
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-dark text-base font-medium text-white hover:bg-purple sm:text-sm"
              >
                Back to Dashboard
              </a>
              {allowClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        );
      
      case KYCStatus.REJECTED:
        return (
          <div className="text-center p-6">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">KYC Rejected</h3>
            <p className="text-gray-600 mb-2">Your KYC verification was rejected for the following reason:</p>
            <p className="text-red-600 font-medium mb-6">{user?.kycRejectionReason || "Please resubmit with correct information and documents."}</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 text-left">
                  PAN Number
                </label>
                <input
                  type="text"
                  id="panNumber"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="idProofType" className="block text-sm font-medium text-gray-700 text-left">
                  ID Proof Type
                </label>
                <select
                  id="idProofType"
                  value={idProofType}
                  onChange={(e) => setIdProofType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  required
                >
                  <option value="aadhar">Aadhar Card</option>
                  <option value="voter">Voter ID</option>
                  <option value="driving">Driving License</option>
                  <option value="passport">Passport</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="idProofNumber" className="block text-sm font-medium text-gray-700 text-left">
                  ID Proof Number
                </label>
                <input
                  type="text"
                  id="idProofNumber"
                  value={idProofNumber}
                  onChange={(e) => setIdProofNumber(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="panCardFile" className="block text-sm font-medium text-gray-700 text-left">
                  PAN Card (Image/PDF)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="panCardFile"
                        className="relative cursor-pointer rounded-md bg-white font-medium text-purple-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 hover:text-purple-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="panCardFile"
                          name="panCardFile"
                          type="file"
                          className="sr-only"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => setPanCardFile(e.target.files?.[0] || null)}
                          required
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 2MB</p>
                    {panCardFile && (
                      <p className="text-xs text-green-500">Selected: {panCardFile.name}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="idProofFile" className="block text-sm font-medium text-gray-700 text-left">
                  ID Proof (Image/PDF) (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="idProofFile"
                        className="relative cursor-pointer rounded-md bg-white font-medium text-purple-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 hover:text-purple-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="idProofFile"
                          name="idProofFile"
                          type="file"
                          className="sr-only"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => setIdProofFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 2MB</p>
                    {idProofFile && (
                      <p className="text-xs text-green-500">Selected: {idProofFile.name}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4 pt-4">
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-dark text-base font-medium text-white hover:bg-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:w-auto sm:text-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Resubmit KYC"}
                </button>
                <a 
                  href="/dashboard" 
                  className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:w-auto sm:text-sm"
                >
                  Back to Dashboard
                </a>
              </div>
            </form>
          </div>
        );
      
      default:
        // NOT_SUBMITTED or any other state
        return (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">KYC Verification</h3>
            <p className="text-gray-600 mb-6 text-center">Please complete your KYC verification to enable withdrawals.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700">
                  PAN Number
                </label>
                <input
                  type="text"
                  id="panNumber"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="idProofType" className="block text-sm font-medium text-gray-700">
                  ID Proof Type
                </label>
                <select
                  id="idProofType"
                  value={idProofType}
                  onChange={(e) => setIdProofType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  required
                >
                  <option value="aadhar">Aadhar Card</option>
                  <option value="voter">Voter ID</option>
                  <option value="driving">Driving License</option>
                  <option value="passport">Passport</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="idProofNumber" className="block text-sm font-medium text-gray-700">
                  ID Proof Number
                </label>
                <input
                  type="text"
                  id="idProofNumber"
                  value={idProofNumber}
                  onChange={(e) => setIdProofNumber(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="panCardFile" className="block text-sm font-medium text-gray-700">
                  PAN Card (Image/PDF)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="panCardFile"
                        className="relative cursor-pointer rounded-md bg-white font-medium text-purple-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 hover:text-purple-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="panCardFile"
                          name="panCardFile"
                          type="file"
                          className="sr-only"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => setPanCardFile(e.target.files?.[0] || null)}
                          required
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 2MB</p>
                    {panCardFile && (
                      <p className="text-xs text-green-500">Selected: {panCardFile.name}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="idProofFile" className="block text-sm font-medium text-gray-700">
                  ID Proof (Image/PDF) (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="idProofFile"
                        className="relative cursor-pointer rounded-md bg-white font-medium text-purple-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 hover:text-purple-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="idProofFile"
                          name="idProofFile"
                          type="file"
                          className="sr-only"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => setIdProofFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 2MB</p>
                    {idProofFile && (
                      <p className="text-xs text-green-500">Selected: {idProofFile.name}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-dark text-base font-medium text-white hover:bg-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:w-auto sm:text-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit KYC"}
                </button>
                
                <a 
                  href="/dashboard" 
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:w-auto sm:text-sm"
                >
                  Back to Dashboard
                </a>
              </div>
            </form>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={allowClose ? onClose : undefined}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>KYC Verification</DialogTitle>
          <DialogDescription>
            Complete your KYC verification to enable withdrawals
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}