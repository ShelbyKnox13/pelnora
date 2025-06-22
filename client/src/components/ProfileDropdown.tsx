import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";

// Create a global event emitter for bank details dialog
const bankDetailsEventEmitter = {
  listeners: new Set<() => void>(),
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },
  emit() {
    this.listeners.forEach(listener => listener());
  }
};

export const openBankDetailsDialog = () => {
  bankDetailsEventEmitter.emit();
};

export const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [showBankDetailsDialog, setShowBankDetailsDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showKYCDialog, setShowKYCDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    bankName: user?.bankName || "",
    accountNumber: user?.accountNumber || "",
    ifscCode: user?.ifscCode || "",
  });
  const [kycDetails, setKycDetails] = useState({
    panNumber: user?.panNumber || "",
    idProofType: user?.idProofType || "",
    idProofNumber: user?.idProofNumber || "",
  });
  const [showKYCConfirmation, setShowKYCConfirmation] = useState(false);
  const [panCardImage, setPanCardImage] = useState<File | null>(null);
  const [panCardPreview, setPanCardPreview] = useState<string | null>(null);

  // Update bank details when user data changes
  useEffect(() => {
    setBankDetails({
      bankName: user?.bankName || "",
      accountNumber: user?.accountNumber || "",
      ifscCode: user?.ifscCode || "",
    });
    setKycDetails({
      panNumber: user?.panNumber || "",
      idProofType: user?.idProofType || "",
      idProofNumber: user?.idProofNumber || "",
    });
  }, [user]);

  // Subscribe to bank details dialog events
  useEffect(() => {
    const unsubscribe = bankDetailsEventEmitter.subscribe(() => {
      setShowBankDetailsDialog(true);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleBankDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowPreviewDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setIsLoading(true);
    setShowPreviewDialog(false);

    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bankDetails),
      });

      if (!response.ok) {
        throw new Error("Failed to update bank details");
      }

      // Update local user data after successful update
      if (user) {
        Object.assign(user, bankDetails);
      }

      toast({
        title: "Success",
        description: "Bank details updated successfully",
        className: "toast-top",
      });
      setShowBankDetailsDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bank details",
        variant: "destructive",
        className: "toast-top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
        className: "toast-top",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
        className: "toast-top",
      });
    }
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/[^0-9]/g, '');
    setBankDetails(prev => ({ ...prev, accountNumber: value }));
  };

  const handlePanCardSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPanCardImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPanCardPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKYCSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate PAN number format
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(kycDetails.panNumber)) {
        toast({
          title: "Invalid PAN Number",
          description: "Please enter a valid PAN number in the format ABCDE1234F",
          variant: "destructive",
          className: "toast-top",
        });
        setIsLoading(false);
        return;
      }

      // Validate ID proof number based on type
      if (kycDetails.idProofType === 'aadhar' && !/^\d{12}$/.test(kycDetails.idProofNumber)) {
        toast({
          title: "Invalid Aadhar Number",
          description: "Please enter a valid 12-digit Aadhar number",
          variant: "destructive",
          className: "toast-top",
        });
        setIsLoading(false);
        return;
      }

      // Check if PAN card image is uploaded
      if (!panCardImage) {
        toast({
          title: "PAN Card Image Required",
          description: "Please upload a clear image of your PAN card",
          variant: "destructive",
          className: "toast-top",
        });
        setIsLoading(false);
        return;
      }

      // Show confirmation dialog
      setShowKYCConfirmation(true);
      setIsLoading(false);
    } catch (error) {
      console.error("KYC validation error:", error);
      toast({
        title: "Error",
        description: "Failed to validate KYC details",
        variant: "destructive",
        className: "toast-top",
      });
      setIsLoading(false);
    }
  };

  const handleKYCConfirmation = async () => {
    setIsLoading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("panNumber", kycDetails.panNumber);
      formData.append("idProofType", kycDetails.idProofType);
      formData.append("idProofNumber", kycDetails.idProofNumber);
      if (panCardImage) {
        formData.append("panCardImage", panCardImage);
      }

      const response = await fetch(`/api/users/${user?.id}`, {
        method: "PATCH",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update KYC details");
      }

      // Update local user data
      if (user) {
        Object.assign(user, { 
          ...kycDetails, 
          kycStatus: true 
        });
      }

      toast({
        title: "KYC Details Submitted",
        description: "Your KYC details have been submitted for verification. This process typically takes 24-48 hours.",
        className: "toast-top",
      });

      // Reset form and close dialogs
      setKycDetails({
        panNumber: "",
        idProofType: "",
        idProofNumber: "",
      });
      setPanCardImage(null);
      setPanCardPreview(null);
      setShowKYCConfirmation(false);
      setShowBankDetailsDialog(false);
    } catch (error: any) {
      console.error("KYC submission error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit KYC details",
        variant: "destructive",
        className: "toast-top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
            <div className="h-8 w-8 rounded-full bg-gold flex items-center justify-center text-black font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowBankDetailsDialog(true)}>
            {user?.bankName ? "Update Bank Details" : "Add Bank Details"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowKYCDialog(true)}>
            {user?.kycStatus ? "Update KYC Details" : "Complete KYC"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showBankDetailsDialog} onOpenChange={setShowBankDetailsDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bank Details</DialogTitle>
            <DialogDescription>
              {user?.bankName 
                ? "Update your bank details for withdrawals"
                : "Add your bank details to enable withdrawals"}
            </DialogDescription>
            <div className="mt-2 text-center">
              <p className="text-lg font-bold uppercase text-purple-dark">{user?.name}</p>
            </div>
          </DialogHeader>
          <form onSubmit={handleBankDetailsSubmit} className="space-y-4">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                placeholder="Enter bank name"
                required
              />
            </div>
            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={bankDetails.accountNumber}
                onChange={handleAccountNumberChange}
                placeholder="Enter account number (digits only)"
                required
                pattern="[0-9]*"
                inputMode="numeric"
              />
            </div>
            <div>
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input
                id="ifscCode"
                value={bankDetails.ifscCode}
                onChange={(e) => setBankDetails(prev => ({ ...prev, ifscCode: e.target.value }))}
                placeholder="Enter IFSC code"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-gold hover:bg-gold-light text-black border-2 border-gold hover:border-gold-light font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Preview Details"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Bank Details</DialogTitle>
            <DialogDescription>
              Please verify your bank details before submitting
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Bank Name</p>
              <p className="text-sm text-gray-500">{bankDetails.bankName}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Account Holder Name</p>
              <p className="text-sm text-gray-500">{user?.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Account Number</p>
              <p className="text-sm text-gray-500">{bankDetails.accountNumber}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">IFSC Code</p>
              <p className="text-sm text-gray-500">{bankDetails.ifscCode}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreviewDialog(false)}
              className="mr-2"
            >
              Edit Details
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              className="bg-gold hover:bg-gold-light text-black border-2 border-gold hover:border-gold-light font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Confirm & Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showKYCDialog} onOpenChange={setShowKYCDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>KYC Verification</DialogTitle>
            <DialogDescription>
              Please provide your KYC details for verification
            </DialogDescription>
            <div className="mt-2 text-center">
              <p className="text-lg font-bold uppercase text-purple-dark">{user?.name}</p>
            </div>
          </DialogHeader>
          <form onSubmit={handleKYCSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">PAN Number</label>
              <input
                type="text"
                value={kycDetails.panNumber}
                onChange={(e) => setKycDetails(prev => ({ ...prev, panNumber: e.target.value.toUpperCase() }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                placeholder="ABCDE1234F"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Upload PAN Card Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePanCardSelect}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-50 file:text-purple-700
                  hover:file:bg-purple-100"
                required
              />
              {panCardPreview && (
                <div className="mt-2">
                  <img
                    src={panCardPreview}
                    alt="PAN Card Preview"
                    className="max-w-xs rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ID Proof Type</label>
              <select
                value={kycDetails.idProofType}
                onChange={(e) => setKycDetails(prev => ({ ...prev, idProofType: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                required
              >
                <option value="">Select ID Proof Type</option>
                <option value="aadhar">Aadhar Card</option>
                <option value="passport">Passport</option>
                <option value="driving_license">Driving License</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ID Proof Number</label>
              <input
                type="text"
                value={kycDetails.idProofNumber}
                onChange={(e) => setKycDetails(prev => ({ ...prev, idProofNumber: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                placeholder={kycDetails.idProofType === "aadhar" ? "12-digit Aadhar number" : "ID Proof Number"}
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBankDetailsDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-dark hover:bg-purple text-white border-2 border-purple-dark hover:border-purple font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit KYC"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showKYCConfirmation} onOpenChange={setShowKYCConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm KYC Submission</DialogTitle>
            <DialogDescription>
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    Please note that once submitted, you cannot modify your KYC details. Any corrections will require admin approval.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Your KYC Details:</h4>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-500">PAN Number:</dt>
                      <dd className="font-medium">{kycDetails.panNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">ID Proof Type:</dt>
                      <dd className="font-medium">{kycDetails.idProofType}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">ID Proof Number:</dt>
                      <dd className="font-medium">{kycDetails.idProofNumber}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowKYCConfirmation(false)}
            >
              Review Again
            </Button>
            <Button
              onClick={handleKYCConfirmation}
              disabled={isLoading}
              className="bg-purple-dark hover:bg-purple text-white border-2 border-purple-dark hover:border-purple font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isLoading ? "Submitting..." : "Confirm & Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
