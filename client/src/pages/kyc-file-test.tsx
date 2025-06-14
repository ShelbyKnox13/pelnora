import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function KYCFileTestPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fileDetails, setFileDetails] = useState<any>(null);

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
      formData.append('panCardImage', file);
      formData.append('testFile', file);
      
      // Add test data to simulate real KYC submission
      formData.append('panNumber', 'TEST12345');
      formData.append('idProofType', 'aadhar');
      formData.append('idProofNumber', '123456789012');
      
      // Create a test ID proof file
      const emptyBlob = new Blob(['test'], { type: 'application/octet-stream' });
      const emptyFile = new File([emptyBlob], 'test-id.txt', { type: 'text/plain' });
      formData.append('idProofImage', emptyFile);
      
      // Log what we're sending
      console.log("Sending file:", file.name, file.type, file.size);
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
      <h1 className="text-2xl font-bold mb-6">KYC File Upload Test Tool</h1>
      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded mb-6">
        <h3 className="font-bold">JPEG Support Information</h3>
        <p>This form accepts both .jpg and .jpeg file extensions with MIME type "image/jpeg".</p>
        <p className="mt-2">If you're having trouble with JPEG files, try the following:</p>
        <ul className="list-disc pl-5 mt-1">
          <li>Ensure your file has a proper extension (.jpg or .jpeg)</li>
          <li>Try saving the image in a different format (PNG)</li>
          <li>If using a smartphone, try a different image from your gallery</li>
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
                <div>Size: {fileDetails.size.bytes} bytes ({fileDetails.size.kb}, {fileDetails.size.mb})</div>
                <div>Last modified: {fileDetails.lastModified}</div>
              </div>
            )}
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
      
      <div className="mt-8 bg-gray-50 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">File Upload Troubleshooting Guide</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Make sure your file is in JPG/JPEG, PNG, or PDF format</li>
          <li>File size should be under 2MB (your file: {fileDetails ? fileDetails.size.mb : 'N/A'})</li>
          <li>Check that both the file extension and MIME type match (your MIME type: {fileDetails ? fileDetails.type : 'N/A'})</li>
          <li>Accepted file extensions: .jpg, .jpeg, .png, .pdf</li>
          <li>Accepted MIME types: image/jpeg, image/png, application/pdf</li>
          <li>Your browser should show the file size in bytes - make sure it's less than 2,097,152 bytes</li>
          <li>Try converting your image to a different format (e.g., JPG to PNG) using an image editor</li>
        </ul>
      </div>
    </div>
  );
}