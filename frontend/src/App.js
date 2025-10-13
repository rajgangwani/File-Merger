// frontend/src/App.js
import React, { useState } from 'react';
import { Upload, Sun, Moon, Download } from 'lucide-react';
import './App.css';

function App() {
  const [input1, setInput1] = useState(null);
  const [input2, setInput2] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [dark, setDark] = useState(false);

  const BACKEND = 'http://127.0.0.1:8000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input1 || !input2) {
      alert('Please choose both files.');
      return;
    }
    setProcessing(true);
    setDownloadUrl('');

    const fd = new FormData();
    fd.append('input1', input1);
    fd.append('input2', input2);

    try {
      const res = await fetch(`${BACKEND}/submit/`, { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Upload failed');
      }
      const data = await res.json();
      setDownloadUrl(data.download_url);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl) return;
    const res = await fetch(downloadUrl);
    if (!res.ok) return alert('Download failed');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <header className="header">
        <h1 className="title">File Processor</h1>
        <button className="toggle-btn" onClick={() => setDark(!dark)}>
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <main className="main-card">
        <form onSubmit={handleSubmit}>
          <div className="upload-row">
            <label className="upload-box">
              <Upload size={32} />
              <p className="label-title">Upload File 1</p>
              <input type="file" accept=".txt" onChange={e => setInput1(e.target.files[0])} />
              <span className="filename">{input1 ? input1.name : 'No file selected'}</span>
            </label>

            <label className="upload-box">
              <Upload size={32} />
              <p className="label-title">Upload File 2</p>
              <input type="file" accept=".txt" onChange={e => setInput2(e.target.files[0])} />
              <span className="filename">{input2 ? input2.name : 'No file selected'}</span>
            </label>
          </div>

          <div className="actions">
           <button className={`btn primary ${processing ? 'loading' : ''}`} type="submit" disabled={processing}>
  {processing ? 'Processing...' : 'Submit'}
          </button>
            <button className="btn outline" type="button" onClick={handleDownload} disabled={!downloadUrl}>
              <Download size={16} /> Download
            </button>
          </div>

          {processing && <p className="hint">Processing your files — please wait...</p>}
          {!processing && downloadUrl && <p className="success">✅ File processed! Ready to download.</p>}
        </form>
      </main>

      <footer className="footer">© 2025 Growdea Technologies</footer>
    </div>
  );
}

export default App;
