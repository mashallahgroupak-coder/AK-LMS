import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { getCachedAccessToken, loginWithGoogle, auth } from '../firebase';
import { 
  Cloud, Search, RefreshCw, FileText, FileVideo, FileCode, FileSpreadsheet, 
  ExternalLink, Download, UploadCloud, Trash2, CheckCircle2, AlertCircle, Link2, Eye, FolderOpen, AlertTriangle
} from 'lucide-react';

interface GoogleDriveLibraryProps {
  courses: Course[];
  onUpdateCourse: (course: Course) => void;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
  createdTime?: string;
}

export const GoogleDriveLibrary: React.FC<GoogleDriveLibraryProps> = ({
  courses,
  onUpdateCourse
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(getCachedAccessToken());
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorString, setErrorString] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('All');
  
  // Selection/Link state
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [linkingFileId, setLinkingFileId] = useState<string | null>(null);
  
  // Local upload state
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Sync state on mount and authenticate state check
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      const token = getCachedAccessToken();
      setAccessToken(token);
    });
    return () => unsub();
  }, []);

  // Fetch file directory on token presence
  useEffect(() => {
    if (accessToken) {
      fetchDriveFiles();
    } else {
      setFiles([]);
    }
  }, [accessToken]);

  const handleAuthorize = async () => {
    setLoading(true);
    setErrorString(null);
    try {
      await loginWithGoogle();
      const token = getCachedAccessToken();
      setAccessToken(token);
    } catch (err: any) {
      console.error(err);
      setErrorString("Authorization was unsuccessful or closed by administrative user. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDriveFiles = async () => {
    if (!accessToken) return;
    setLoading(true);
    setErrorString(null);
    try {
      // Query parameters for files, prioritizing PDFs, presentations, videos, Word, and Excel
      let query = "trashed = false";
      if (searchQuery.trim() !== "") {
        query += ` and name contains '${searchQuery.replace(/'/g, "\\'")}'`;
      }
      
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
          query
        )}&pageSize=35&fields=nextPageToken,files(id,name,mimeType,size,webViewLink,createdTime)&orderBy=modifiedTime%20desc`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Token is expired, clear and ask user to reauth
          setAccessToken(null);
          throw new Error("Google access token has expired. Please re-authenticate your Google Drive access.");
        }
        const errJson = await response.json();
        throw new Error(errJson?.error?.message || "Google Drive connection error.");
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (err: any) {
      setErrorString(err.message || "Failed to retrieve documents directory from G-Drive");
    } finally {
      setLoading(false);
    }
  };

  // Upload handler to Google Drive
  const handleFileUploadToDrive = async (uploadedFile: File) => {
    if (!accessToken) {
      setErrorString("Authenticate first to upload files.");
      return;
    }
    
    // Check sizes per specifications in prompt:
    // videos: 500MB, ppts: 100MB, pdf: 100MB, Word: 50MB, Excel: 50MB
    const sizeInMB = uploadedFile.size / (1024 * 1024);
    const lowerName = uploadedFile.name.toLowerCase();
    
    let isVideo = lowerName.endsWith('.mp4') || lowerName.endsWith('.mov') || lowerName.endsWith('.avi');
    let isPPT = lowerName.endsWith('.ppt') || lowerName.endsWith('.pptx');
    let isPDF = lowerName.endsWith('.pdf');
    let isWord = lowerName.endsWith('.doc') || lowerName.endsWith('.docx');
    let isExcel = lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx');

    if (isVideo && sizeInMB > 500) {
      alert("⚠️ File upload error: Video file exceeds maximum limits (500 MB).");
      return;
    }
    if (isPPT && sizeInMB > 100) {
      alert("⚠️ File upload error: Presentation exceeds maximum limits (100 MB).");
      return;
    }
    if (isPDF && sizeInMB > 100) {
      alert("⚠️ File upload error: PDF file exceeds maximum limits (100 MB).");
      return;
    }
    if (isWord && sizeInMB > 50) {
      alert("⚠️ File upload error: Word document exceeds maximum limits (50 MB).");
      return;
    }
    if (isExcel && sizeInMB > 50) {
      alert("⚠️ File upload error: Spreadsheet exceeds maximum limits (50 MB).");
      return;
    }

    setUploading(true);
    setUploadPercent(15);
    setUploadStatus("Uploading to Artistic Garments G-Suite Workspace Drive...");

    try {
      const metadata = {
        name: uploadedFile.name,
        mimeType: uploadedFile.type
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', uploadedFile);

      setUploadPercent(40);

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,size',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: form
        }
      );

      if (!response.ok) {
        throw new Error("Unable to transmit archive to Google Cloud storage.");
      }

      setUploadPercent(85);
      const data = await response.json();
      
      setUploadPercent(100);
      setUploadStatus("Completed successfully!");
      
      // Auto-refresh file lists
      await fetchDriveFiles();

      // If user selected a course, automatically link this uploaded file to that syllabus!
      if (selectedCourseId) {
        const foundCrs = courses.find(c => c.id === selectedCourseId);
        if (foundCrs) {
          linkDocumentToCourse(foundCrs, {
            id: data.id,
            name: data.name,
            mimeType: data.mimeType,
            size: data.size,
            webViewLink: data.webViewLink
          });
        }
      }

      setTimeout(() => {
        setUploading(false);
        setUploadStatus(null);
      }, 2500);

    } catch (err: any) {
      console.error(err);
      setErrorString("Upload aborted: " + err.message);
      setUploading(false);
    }
  };

  // Perform linking file metadata with local course
  const linkDocumentToCourse = (course: Course, file: DriveFile) => {
    // We add links onto our Course schema under `driveAttachments` field
    const existing = (course as any).driveAttachments || [];
    
    // Check duplication
    if (existing.some((att: any) => att.fileId === file.id)) {
      alert(`This G-Drive resource is already linked to standard curriculum '${course.name}'.`);
      return;
    }

    const updatedAttachments = [
      ...existing,
      {
        fileId: file.id,
        fileName: file.name,
        mimeType: file.mimeType,
        webViewLink: file.webViewLink,
        size: file.size ? parseInt(file.size) : undefined,
        linkedAt: new Date().toISOString()
      }
    ];

    const updatedCourse: Course = {
      ...course,
      driveAttachments: updatedAttachments
    } as any;

    onUpdateCourse(updatedCourse);
    alert(`✔️ Success: Dynamic link established between G-Drive file '${file.name}' and LMS Course [${course.id}]!`);
    setLinkingFileId(null);
  };

  const handleRemoveLinkFromCourse = (course: Course, fileId: string) => {
    const confirmRemove = window.confirm(`Remove this asset attachment from '${course.name}'? The actual file is safe and will not be deleted from Google Drive.`);
    if (!confirmRemove) return;

    const existing = (course as any).driveAttachments || [];
    const updated = existing.filter((att: any) => att.fileId !== fileId);

    const updatedCourse: Course = {
      ...course,
      driveAttachments: updated
    } as any;

    onUpdateCourse(updatedCourse);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUploadToDrive(e.dataTransfer.files[0]);
    }
  };

  // File type icon resolver
  const getFileIcon = (mime: string) => {
    if (mime.includes('video')) return <FileVideo className="w-5 h-5 text-purple-500 shrink-0" />;
    if (mime.includes('pdf')) return <FileText className="w-5 h-5 text-rose-500 shrink-0" />;
    if (mime.includes('spreadsheet') || mime.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-emerald-500 shrink-0" />;
    if (mime.includes('presentation') || mime.includes('powerpoint')) return <FileCode className="w-5 h-5 text-amber-500 shrink-0" />;
    if (mime.includes('document') || mime.includes('word')) return <FileText className="w-5 h-5 text-blue-500 shrink-0" />;
    return <FolderOpen className="w-5 h-5 text-slate-400 shrink-0" />;
  };

  // Format size bytes
  const formatBytes = (bytesStr?: string) => {
    if (!bytesStr) return "N/A size";
    const bytes = parseInt(bytesStr);
    if (isNaN(bytes)) return "N/A size";
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Filter local file items by category
  const filteredFiles = files.filter(f => {
    if (contentTypeFilter === 'All') return true;
    if (contentTypeFilter === 'Videos') return f.mimeType.includes('video');
    if (contentTypeFilter === 'PDFs') return f.mimeType.includes('pdf');
    if (contentTypeFilter === 'Presentations') return f.mimeType.includes('presentation') || f.mimeType.includes('powerpoint');
    if (contentTypeFilter === 'Spreadsheets') return f.mimeType.includes('excel') || f.mimeType.includes('spreadsheet');
    if (contentTypeFilter === 'Documents') return f.mimeType.includes('word') || f.mimeType.includes('doc');
    return true;
  });

  return (
    <div className="space-y-6" id="google-drive-library-panel">
      {/* Upper header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-lg border border-slate-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-blue-500/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-xl">
          <span className="text-[10px] bg-indigo-500 text-white font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full mb-1 inline-block">Official G-Suite Workspace</span>
          <h2 className="text-xl font-bold font-sans flex items-center gap-2">
            <Cloud className="w-6 h-6 text-indigo-300 shrink-0" />
            <span>Google Drive Learning Asset Library</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Connected dynamically to the company's shared drive folders. Administrators can store documents, slides, checklists, videos, or course materials in Google Drive and link them securely to any digital syllabus.
          </p>
        </div>

        {currentUser ? (
          <div className="shrink-0 flex flex-col items-start md:items-end gap-1.5 z-10 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 block animate-pulse"></span>
              <span className="text-[11px] text-emerald-400 font-bold truncate">Google Authenticated</span>
            </div>
            <p className="text-[10.5px] text-slate-350 truncate max-w-[200px]">{currentUser.email}</p>
            {!accessToken && (
              <button 
                onClick={handleAuthorize}
                className="mt-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-black rounded-lg text-[10.5px] tracking-wide uppercase transition-colors shrink-0"
              >
                🔑 Authorize Drive Scopes
              </button>
            )}
          </div>
        ) : (
          <div className="shrink-0 z-10">
            <button 
              onClick={handleAuthorize}
              className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg hover:shadow-indigo-900/40"
            >
              🌐 Connect Google Workspace
            </button>
          </div>
        )}
      </div>

      {errorString && (
        <div className="bg-rose-50 border border-rose-150 p-4 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
          <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Google Driver Service Notification:</p>
            <p className="mt-0.5">{errorString}</p>
          </div>
        </div>
      )}

      {/* Main operational panel */}
      {accessToken ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: G-Drive Assets Browser Grid */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="text-xs font-bold font-sans text-slate-400 uppercase tracking-wider">
                  Company Directory: Browse Google Drive
                </h3>
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                  <button 
                    onClick={fetchDriveFiles}
                    className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    title="Synchronize directories"
                  >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    <span>Sync Folder</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search G-Drive names (e.g. PPT, video)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchDriveFiles()}
                    className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 shrink-0">
                  {['All', 'Videos', 'Presentations', 'PDFs', 'Spreadsheets', 'Documents'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setContentTypeFilter(tag)}
                      className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                        contentTypeFilter === tag 
                          ? 'bg-slate-900 text-white' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-650'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic folder results view */}
              {loading && files.length === 0 ? (
                <div className="py-20 text-center space-y-2">
                  <RefreshCw className="w-8 h-8 text-indigo-500 shrink-0 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Requesting company shared directory metadata...</p>
                </div>
              ) : filteredFiles.length > 0 ? (
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {filteredFiles.map(file => {
                    const isLinked = courses.some(c => 
                      ((c as any).driveAttachments || []).some((att: any) => att.fileId === file.id)
                    );
                    
                    return (
                      <div 
                        key={file.id} 
                        className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50/55 transition-colors"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          {getFileIcon(file.mimeType)}
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 leading-snug truncate" title={file.name}>
                              {file.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                              <span>{formatBytes(file.size)}</span>
                              <span>•</span>
                              <span>Mod: {file.createdTime ? new Date(file.createdTime).toLocaleDateString('en-US') : 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          {isLinked && (
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full font-bold font-sans mr-2 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              Linked
                            </span>
                          )}

                          {file.webViewLink && (
                            <a 
                              href={file.webViewLink} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-705 rounded-lg transition-all"
                              title="Preview in Google Workspace Viewport"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => {
                              setLinkingFileId(file.id);
                              if (courses.length > 0) {
                                setSelectedCourseId(courses[0].id);
                              }
                            }}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-805 text-indigo-700 text-[10.5px] font-extrabold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Link2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Link Course</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                  <Cloud className="w-10 h-10 text-slate-250 shrink-0 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-bold">No files found matching search filters.</p>
                  <p className="text-[10px] text-slate-350 mt-0.5">Try searching different keywords or upload a new file on the right side.</p>
                </div>
              )}
            </div>

            {/* Existing attachment mapping report */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] space-y-4">
              <h3 className="text-xs font-bold font-sans text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span>🔗</span>
                <span>Active E-Learning Material Mapping Ledger</span>
              </h3>
              
              <div className="space-y-3">
                {courses.filter(c => ((c as any).driveAttachments || []).length > 0).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 rounded-xl border border-slate-100">
                    No active Google Drive assets have been assigned to courses yet. Try linking a file above!
                  </p>
                ) : (
                  <div className="space-y-3.5">
                    {courses.filter(c => ((c as any).driveAttachments || []).length > 0).map(crs => (
                      <div key={crs.id} className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-2">
                        <div className="flex justify-between items-center bg-slate-900 text-white p-2 rounded-lg text-xs font-bold">
                          <span>🌐 {crs.name}</span>
                          <span className="font-mono text-[9px] bg-indigo-500 px-2 py-0.5 rounded uppercase">
                            {crs.id}
                          </span>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {((crs as any).driveAttachments || []).map((att: any) => (
                            <div key={att.fileId} className="py-2.5 flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                {getFileIcon(att.mimeType || '')}
                                <span className="font-medium text-slate-700 truncate max-w-[280px]" title={att.fileName}>
                                  {att.fileName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {att.webViewLink && (
                                  <a 
                                    href={att.webViewLink} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-indigo-600 hover:text-indigo-805 font-bold flex items-center gap-1 text-[10.5px]"
                                  >
                                    <span>Read Asset</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                <button
                                  onClick={() => handleRemoveLinkFromCourse(crs, att.fileId)}
                                  className="text-red-600 hover:text-red-750 p-1 rounded hover:bg-red-50 cursor-pointer"
                                  title="Unlink attachment"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: G-Drive Files Upload Center & Quick Linker */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Direct Upload Form Widget */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] space-y-4">
              <div>
                <h3 className="text-xs font-black font-sans text-slate-800 uppercase tracking-wider">
                  📥 Fast Upload Drive Drawer
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Direct files transmission to Google Workspace without storage size compromises.
                </p>
              </div>

              {/* Course context mapping selector for uploading */}
              <div className="space-y-1">
                <label className="text-[11.5px] font-bold text-slate-655 block">
                  Autolink Course Assignment (Optional)
                </label>
                <select
                  value={selectedCourseId}
                  onChange={e => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-205 rounded-xl text-xs outline-none focus:border-indigo-500 cursor-pointer text-slate-800"
                >
                  <option value="">-- No Direct Link (Upload Only) --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
                  ))}
                </select>
                <p className="text-[9.5px] text-slate-450 italic mt-0.5">
                  If selected, uploading a file will automatically attach it to this curriculum syllabus!
                </p>
              </div>

              {/* Upload Drag Card Area */}
              <div 
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all relative ${
                  dragActive ? 'border-primary bg-indigo-50/50' : 'border-slate-200 bg-slate-50/40'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  id="direct-drive-file-input" 
                  className="hidden" 
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUploadToDrive(e.target.files[0]);
                    }
                  }}
                />
                
                {uploading ? (
                  <div className="space-y-3.5 py-4">
                    <RefreshCw className="w-8 h-8 text-indigo-500 shrink-0 animate-spin mx-auto" />
                    <div className="space-y-1 text-center">
                      <p className="text-xs font-semibold text-slate-700">{uploadStatus}</p>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden max-w-[150px] mx-auto">
                        <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${uploadPercent}%` }}></div>
                      </div>
                      <span className="text-[10px] font-mono text-indigo-500 font-bold">{uploadPercent}%</span>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="direct-drive-file-input" className="cursor-pointer block space-y-3 py-4">
                    <UploadCloud className="w-10 h-10 text-slate-400 shrink-0 mx-auto" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-700">Drag & Drop file archive here</p>
                      <p className="text-[10px] text-slate-400">or click to browse local folders</p>
                    </div>
                    <div className="text-[9px] text-slate-400/80 mt-2 space-y-0.5 font-mono">
                      <p>Videos: Max 500 MB</p>
                      <p>Slides & PDFs: Max 100 MB</p>
                      <p>Word & Excel: Max 50 MB</p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Workspace drive usage advisory */}
            <div className="bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-100 p-5 rounded-2xl space-y-2.5">
              <h4 className="text-xs font-bold text-slate-805 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-indigo-605 shrink-0" />
                <span>Enterprise SLA Compliance</span>
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                By uploading files to the Artistics Garments G-Suite workspace, the system automatically respects files category boundaries, triggers company compliance scanning, and creates version-controlled assets. 
              </p>
              <div className="text-[10px] bg-white/70 p-2 border border-indigo-200/50 rounded-lg text-slate-500">
                <h5 className="font-bold mb-0.5">Compliance Scopes:</h5>
                <ul className="list-disc pl-3 text-[9.5px] space-y-0.5 text-slate-500 font-medium">
                  <li>ISO 9001:2015 Quality standards audits</li>
                  <li>Oeko-Tex Standard compliance verification</li>
                  <li>G-Drive Version check activated</li>
                </ul>
              </div>
            </div>

          </div>

          {/* LINKING ACTION FLOATING OVERLAY DIALOG */}
          {linkingFileId && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-205 overflow-hidden">
                <div className="p-4 bg-slate-950 text-white flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider font-sans">
                    Link Asset to Course Curriculum
                  </h3>
                  <button 
                    onClick={() => setLinkingFileId(null)}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer hover:bg-slate-900 rounded"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="p-5 space-y-4">
                  <p className="text-xs text-slate-600">
                    Map this G-Drive document instantly into a course's visual assets board:
                  </p>
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-550 block">Target Syllabus Subject</label>
                    <select
                      value={selectedCourseId}
                      onChange={e => setSelectedCourseId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-slate-905 rounded-xl text-xs focus:outline-none focus:border-indigo-600 cursor-pointer"
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setLinkingFileId(null)}
                      className="px-3.5 py-1.5 hover:bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const targetCrs = courses.find(c => c.id === selectedCourseId);
                        const fileObj = files.find(f => f.id === linkingFileId);
                        if (targetCrs && fileObj) {
                          linkDocumentToCourse(targetCrs, fileObj);
                        }
                      }}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black cursor-pointer shadow"
                    >
                      Establish Mapping Link
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="bg-white border border-slate-150 p-12 rounded-2xl shadow-sm text-center max-w-xl mx-auto space-y-5">
          <Cloud className="w-16 h-16 text-indigo-100 shrink-0 mx-auto animate-bounce" />
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-800">Authorization is required to browse Google Drive</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              This applet maintains direct live API communication with company repositories in Google Cloud. Click 'Connect Google Workspace' to link your account, authorize permissions, and list curriculum resources on-the-fly.
            </p>
          </div>
          
          <button 
            onClick={handleAuthorize}
            className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-transform duration-200 hover:scale-[1.02] flex items-center gap-1.5 mx-auto"
          >
            <span>🌐</span>
            <span>Connect Google Workspace Drive</span>
          </button>
        </div>
      )}
    </div>
  );
};
