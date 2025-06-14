import { useState } from 'react';
import { useToast } from '../hooks/use-toast';

export default function KYCDebugPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    
    if (selectedFile) {
      console.log("File details:", {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        lastModified: new Date(selectedFile.lastModified).toISOString()
      });
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
      // Create a simple FormData object
      const formData = new FormData();
      
      // Send it as both 'testFile' and 'panCardImage' to test different field names
      formData.append('testFile', file);
      formData.append('panCardImage', file);
      
      // Log what we're sending
      console.log("Sending file:", file.name, file.type, file.size);
      
      // Make a simple test request
      const response = await fetch('/api/kyc/test-upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      const responseData = await response.text();
      
      if (response.ok) {
        setResult(`SUCCESS: ${responseData}`);
        toast({
          title: "File uploaded successfully",
          description: "Your file was accepted by the server",
        });
      } else {
        setResult(`ERROR (${response.status}): ${responseData}`);
        toast({
          title: "Upload failed",
          description: `Server returned: ${response.status} - ${responseData}`,
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
      <h1 className="text-2xl font-bold mb-6">KYC File Upload Debug Tool</h1>
      
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
            {file && (
              <div className="mt-2 text-sm text-green-600">
                Selected: {file.name} ({file.type}, {Math.round(file.size / 1024)} KB)
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
        <h2 className="text-lg font-semibold mb-2">File Upload Tips</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Make sure your file is in JPG, JPEG, PNG, or PDF format</li>
          <li>File size should be under 2MB</li>
          <li>Check that both the file extension and MIME type match</li>
          <li>Some image editing apps might save files in unexpected formats</li>
          <li>Try a different file if you continue to have issues</li>
        </ul>
      </div>
    </div>
  );
}