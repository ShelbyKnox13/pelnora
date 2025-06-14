import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function KYCSizeTestPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fileDetails, setFileDetails] = useState<any>(null);
  const [uploadOption, setUploadOption] = useState<string>('regular');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    
    if (selectedFile) {
      // Log and set detailed file information
      const details = {
        name: selectedFile.name,
        type: selectedFile.type,
        size: {
          bytes: selectedFile.size,
          kb: (selectedFile.size / 1024).toFixed(2) + ' KB',
          mb: (selectedFile.size / (1024 * 1024)).toFixed(4) + ' MB'
        },
        lastModified: new Date(selectedFile.lastModified).toISOString()
      };
      
      console.log("File details:", details);
      setFileDetails(details);
      setFile(selectedFile);
    } else {
      setFile(null);
      setFileDetails(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to test",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult('');

    try {
      // Create FormData with both field names to test which one works
      const formData = new FormData();
      
      // Add fake data to simulate real KYC submission
      formData.append('panNumber', 'TEST12345');
      formData.append('idProofType', 'aadhar');
      formData.append('idProofNumber', '123456789012');
      
      if (uploadOption === 'regular') {
        formData.append('panCardImage', file);
        formData.append('idProofImage', file);
      } else if (uploadOption === 'arraybuffer') {
        // Convert to ArrayBuffer and back to Blob
        const arrayBuffer = await file.arrayBuffer();
        const newBlob = new Blob([arrayBuffer], { type: file.type });
        const newFile = new File([newBlob], file.name, { type: file.type });
        formData.append('panCardImage', newFile);
        formData.append('idProofImage', newFile);
      } else if (uploadOption === 'base64') {
        // Create a new file from base64
        const reader = new FileReader();
        
        // Create a Promise to handle the FileReader asynchronously
        const readAsDataURLPromise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        const base64Data = await readAsDataURLPromise;
        
        // Create a new blob from the base64 data
        const base64Response = await fetch(base64Data);
        const newBlob = await base64Response.blob();
        
        // Create a new file with the blob
        const newFile = new File([newBlob], file.name, { type: file.type });
        
        formData.append('panCardImage', newFile);
        formData.append('idProofImage', newFile);
      }
      
      // Log what we're sending
      console.log("Sending file:", file.name, file.type, file.size, "bytes");
      console.log("Form data keys:", [...formData.keys()]);
      
      // Try the main KYC submission endpoint
      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = await response.text();
      }
      
      if (response.ok) {
        setResult(`SUCCESS: ${JSON.stringify(responseData, null, 2)}`);
        toast({
          title: "File uploaded successfully",
          description: "Your file was accepted by the server",
        });
      } else {
        setResult(`ERROR (${response.status}): ${JSON.stringify(responseData, null, 2)}`);
        toast({
          title: "Upload failed",
          description: `Server returned: ${response.status} - ${typeof responseData === 'string' ? responseData : JSON.stringify(responseData)}`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setResult(`EXCEPTION: ${error.message}`);
      toast({
        title: "Upload error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">KYC File Size Test Tool</h1>
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded mb-6">
        <h3 className="font-bold">File Size Test Tool</h3>
        <p>This specialized tool helps diagnose issues with file size validation.</p>
        <p className="mt-2">It can try uploading your file in different ways:</p>
        <ul className="list-disc pl-5 mt-1">
          <li><strong>Regular</strong>: Standard file upload</li>
          <li><strong>ArrayBuffer</strong>: Converts the file to binary and back, which can help with some size encoding issues</li>
          <li><strong>Base64</strong>: Converts to base64 format first, which can bypass certain size validation issues</li>
        </ul>
      </div>
      
      <div className="bg-white shadow-md rounded p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test File Upload
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              accept=".jpg,.jpeg,.png,.pdf"
            />
            {fileDetails && (
              <div className="mt-2 text-sm text-green-600">
                <div>File name: {fileDetails.name}</div>
                <div>MIME type: {fileDetails.type}</div>
                <div>Size: <strong>{fileDetails.size.bytes} bytes</strong> ({fileDetails.size.kb}, {fileDetails.size.mb})</div>
                <div>Last modified: {fileDetails.lastModified}</div>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Method
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  name="uploadOption" 
                  value="regular" 
                  checked={uploadOption === 'regular'} 
                  onChange={() => setUploadOption('regular')}
                  className="form-radio h-4 w-4 text-purple-600"
                />
                <span className="ml-2 text-gray-700">Regular</span>
              </label>
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  name="uploadOption" 
                  value="arraybuffer" 
                  checked={uploadOption === 'arraybuffer'} 
                  onChange={() => setUploadOption('arraybuffer')}
                  className="form-radio h-4 w-4 text-purple-600"
                />
                <span className="ml-2 text-gray-700">ArrayBuffer</span>
              </label>
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  name="uploadOption" 
                  value="base64" 
                  checked={uploadOption === 'base64'} 
                  onChange={() => setUploadOption('base64')}
                  className="form-radio h-4 w-4 text-purple-600"
                />
                <span className="ml-2 text-gray-700">Base64</span>
              </label>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || !file}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-dark hover:bg-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Uploading..." : "Test Upload"}
          </button>
        </form>
      </div>
      
      {result && (
        <div className={`p-4 rounded ${result.startsWith('SUCCESS') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">File Size Requirements</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Maximum file size: <strong>2MB (2,097,152 bytes)</strong></li>
            <li>Minimum file size: None specified</li>
            <li>Your file size: <strong>{fileDetails ? fileDetails.size.bytes + ' bytes' : 'N/A'}</strong></li>
            <li>The server validates file size based on the raw bytes received</li>
            <li>Some browsers may report slightly different file sizes than what the server receives</li>
          </ul>
        </div>
        
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Common Size Issues</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>File metadata may add to the total size when uploaded</li>
            <li>Some JPEG files have extra metadata that increases size</li>
            <li>Network encoding can sometimes affect the file size calculation</li>
            <li>Try uploading with different methods to bypass potential size validation issues</li>
            <li>If your file is rejected for being too large but it's clearly under 2MB, try reducing it further or using a different file format</li>
          </ul>
        </div>
      </div>
    </div>
  );
}