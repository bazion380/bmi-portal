import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Server, 
  Database, 
  ShieldCheck, 
  FileText, 
  Cloud, 
  HardDrive, 
  Zap, 
  Lock, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Download,
  Key,
  ExternalLink,
  Code,
  Terminal,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';

export const AdminITView: React.FC = () => {
  const { 
    auditLogs, 
    resetDemoData, 
    neonDatabases, 
    dbBackups, 
    rlsPolicies, 
    triggerBackup, 
    getSignedR2Url,
    students,
    courses
  } = useApp();

  const [activeTab, setActiveTab] = useState<'neon_db' | 'auth_rls' | 'r2_storage' | 'backups' | 'hold_verifier'>('neon_db');
  const [selectedDb, setSelectedDb] = useState<string>('core-db');
  
  // Interactive Backup Trigger State
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupConsoleLogs, setBackupConsoleLogs] = useState<string[]>([]);

  // R2 Signed URL Generator State
  const [selectedDocName, setSelectedDocName] = useState('Official_Academic_Transcript_std-101.pdf');
  const [generatedSignedUrl, setGeneratedSignedUrl] = useState<string | null>(null);

  // Financial Hold DB Constraint Verifier State
  const [holdTestStudentId, setHoldTestStudentId] = useState('std-102');
  const [holdTestCourseId, setHoldTestCourseId] = useState('CS101');
  const [holdTestResult, setHoldTestResult] = useState<{ status: 'blocked' | 'passed'; message: string; sqlConstraint: string } | null>(null);

  // Cold Start Ping State
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const handleRunBackup = async () => {
    setIsBackingUp(true);
    setBackupConsoleLogs([
      `[${new Date().toISOString()}] Initiating automated pg_dump for Neon DB project '${selectedDb}'...`,
      `Connecting to postgres://neon_user:***@ep-cool-mountains.us-east-2.aws.neon.tech/${selectedDb}...`,
      `Executing: pg_dump --no-owner --no-privileges --clean...`,
      `Piping output to gzip -9 compression worker...`
    ]);

    setTimeout(() => {
      setBackupConsoleLogs(prev => [
        ...prev,
        `Compression complete. Snapshot size: 14.3 MB (Compression ratio: 4.8x).`,
        `Signing S3 API payload for Cloudflare R2 bucket 'bmi-ums-backups'...`,
        `PUT s3://bmi-ums-backups/manual/${selectedDb}-${newDateStr()}.sql.gz HTTP/1.1 200 OK`
      ]);

      setTimeout(async () => {
        await triggerBackup(selectedDb);
        setBackupConsoleLogs(prev => [
          ...prev,
          `SUCCESS: Database backup verified and stored in R2 bucket with $0 bandwidth egress fees!`
        ]);
        setIsBackingUp(false);
      }, 600);
    }, 800);
  };

  const newDateStr = () => new Date().toISOString().split('T')[0];

  const handleGenerateR2Url = () => {
    const url = getSignedR2Url(selectedDocName);
    setGeneratedSignedUrl(url);
  };

  const handleTestHoldConstraint = () => {
    const std = students.find(s => s.id === holdTestStudentId);
    const crs = courses.find(c => c.id === holdTestCourseId);

    if (std?.financialHold) {
      setHoldTestResult({
        status: 'blocked',
        sqlConstraint: 'CONSTRAINT chk_financial_hold CHECK (NOT (financial_hold AND IS_REGISTERING()))',
        message: `DB CONSTRAINT TRIGGER BLOCKED REGISTRATION: Student ${std.firstName} ${std.lastName} (${std.studentUid}) has active financialHold = TRUE. Postgres transaction aborted.`
      });
    } else {
      setHoldTestResult({
        status: 'passed',
        sqlConstraint: 'CONSTRAINT chk_financial_hold PASSED (financial_hold = FALSE)',
        message: `DB CONSTRAINT CHECK PASSED: Student ${std?.firstName} ${std?.lastName} has no active financial holds. Registration transaction permitted.`
      });
    }
  };

  const handlePingColdStart = () => {
    setIsPinging(true);
    setPingLatency(null);
    const start = performance.now();
    setTimeout(() => {
      const elapsed = Math.round(performance.now() - start + 450);
      setPingLatency(elapsed);
      setIsPinging(false);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
              Neon Postgres + Cloudflare R2 Strategy
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
              Long Free-Tier Architecture
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-2 flex items-center space-x-3">
            <Server className="w-7 h-7 text-emerald-400" />
            <span>BMI UMS Infrastructure Console</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Multi-project relational database architecture, Neon Auth, Cloudflare R2 zero-egress document storage, automated pg_dump backups, and Row-Level Security (RLS) enforcement.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handlePingColdStart}
            disabled={isPinging}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center space-x-2"
          >
            <Zap className={`w-4 h-4 text-amber-400 ${isPinging ? 'animate-bounce' : ''}`} />
            <span>{isPinging ? 'Pinging Neon...' : pingLatency ? `Scale-to-Zero: ${pingLatency}ms` : 'Test Cold Start Ping'}</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Re-initialize entire UMS seed database?')) {
                resetDemoData();
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
          >
            Reset Seed Data
          </button>
        </div>
      </div>

      {/* Free Tier Capacity & Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold flex items-center space-x-1.5">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Neon Core DB Storage</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">142.8 MB / 500 MB</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '28.5%' }} />
          </div>
          <p className="text-[11px] text-slate-400">28.5% of free tier limit. Normalized relational core.</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold flex items-center space-x-1.5">
              <Cloud className="w-4 h-4 text-cyan-400" />
              <span>Cloudflare R2 Storage</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">1.4 GB / 10 GB</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: '14%' }} />
          </div>
          <p className="text-[11px] text-slate-400">Zero bandwidth egress fees on PDFs & ID scans.</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold flex items-center space-x-1.5">
              <Key className="w-4 h-4 text-indigo-400" />
              <span>Neon Auth MAU</span>
            </span>
            <span className="text-[10px] font-mono text-indigo-400 font-bold">1,840 / 60,000</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '3%' }} />
          </div>
          <p className="text-[11px] text-slate-400">Native JWT auth tables integrated directly into Postgres.</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Workers API Usage</span>
            </span>
            <span className="text-[10px] font-mono text-amber-400 font-bold">14,200 / 100,000 / day</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '14.2%' }} />
          </div>
          <p className="text-[11px] text-slate-400">Cloudflare Workers + Hono REST API layer gateway.</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('neon_db')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shrink-0 ${
            activeTab === 'neon_db' 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>1. Neon DB Bounded Contexts (5 Projects)</span>
        </button>

        <button
          onClick={() => setActiveTab('auth_rls')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shrink-0 ${
            activeTab === 'auth_rls' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>2. Neon Auth & RLS Policies</span>
        </button>

        <button
          onClick={() => setActiveTab('r2_storage')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shrink-0 ${
            activeTab === 'r2_storage' 
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' 
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>3. Cloudflare R2 Document Vault</span>
        </button>

        <button
          onClick={() => setActiveTab('backups')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shrink-0 ${
            activeTab === 'backups' 
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' 
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>4. Automated Backups & R2 Snapshots</span>
        </button>

        <button
          onClick={() => setActiveTab('hold_verifier')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shrink-0 ${
            activeTab === 'hold_verifier' 
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' 
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>5. DB Financial Hold Constraint Verifier</span>
        </button>
      </div>

      {/* Tab 1: Neon DB Multi-Project Bounded Contexts */}
      {activeTab === 'neon_db' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs text-slate-300 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Multi-Project Neon Architecture Strategy</span>
            </h3>
            <p>
              To keep BMI UMS operating on Neon's free tier indefinitely without cross-project foreign key fragmentation, tightly-coupled core entities (Students, Admissions, Courses, Exams, Fees) reside together in <strong>core-db</strong>. Independent domains (HR, Library, Alumni, Campus Services) run in separate Neon projects with their own 0.5 GB storage & 100 CU-hour allowances.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
            {neonDatabases.map(db => (
              <div 
                key={db.id} 
                className={`p-5 rounded-2xl bg-slate-900 border transition ${
                  selectedDb === db.id ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-base">{db.projectName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {db.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">{db.contextScope}</p>
                  </div>
                  <button
                    onClick={() => setSelectedDb(db.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
                  >
                    Select DB
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 my-4 pt-3 border-t border-slate-800 text-[11px]">
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Storage Used</span>
                      <span className="font-mono text-white">{db.usedMB} MB / {db.allocatedMB} MB</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(db.usedMB / db.allocatedMB) * 100}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Compute Hours</span>
                      <span className="font-mono text-white">{db.computeHoursUsed} / {db.computeHoursAllowance} CU-hrs</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(db.computeHoursUsed / db.computeHoursAllowance) * 100}%` }} />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold mr-1 self-center">Tables ({db.tablesCount}):</span>
                  {db.tables.map(tbl => (
                    <span key={tbl} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                      {tbl}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Neon Auth & Row-Level Security Policies */}
      {activeTab === 'auth_rls' && (
        <div className="space-y-6 text-xs">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-indigo-400" />
                  <span>Row-Level Security (RLS) Policy Inspector</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Server-side database enforcement ensuring student records cannot leak across accounts even if API routes are misconfigured.
                </p>
              </div>
              <span className="px-3 py-1 bg-indigo-950 text-indigo-300 border border-indigo-700 rounded-lg font-bold text-xs">
                Neon Auth JWT Claims Active
              </span>
            </div>

            <div className="space-y-3">
              {rlsPolicies.map(pol => (
                <div key={pol.policyName} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono font-bold text-[10px]">
                        {pol.action}
                      </span>
                      <span className="font-bold text-white text-sm font-mono">{pol.table}</span>
                      <span className="text-slate-400">• Policy: <strong className="text-indigo-300">{pol.policyName}</strong></span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                      {pol.status}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300">
                    <span className="text-slate-500 uppercase font-sans text-[9px] block mb-1">USING EXPRESSION / CHECK:</span>
                    <code>{pol.definition}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cloudflare R2 Document Storage Vault */}
      {activeTab === 'r2_storage' && (
        <div className="space-y-6 text-xs">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Cloud className="w-5 h-5 text-cyan-400" />
                <span>Cloudflare R2 Zero-Egress Document Vault</span>
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Large binary files (Transcripts, High School ID Scans, Admission Offer Letters) are stored in Cloudflare R2 with signed download URLs, keeping Postgres core-db lightweight.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Generator Form */}
              <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white text-sm">Generate Temporary Signed R2 Download URL</h4>
                
                <div className="space-y-2">
                  <label className="text-slate-400 font-semibold block">Select Document Object</label>
                  <select
                    value={selectedDocName}
                    onChange={e => setSelectedDocName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Official_Academic_Transcript_std-101.pdf">Official_Academic_Transcript_std-101.pdf (1.2 MB)</option>
                    <option value="National_ID_Card_Scan_std-102.png">National_ID_Card_Scan_std-102.png (3.4 MB)</option>
                    <option value="Admission_Offer_Letter_APP-2026-904.pdf">Admission_Offer_Letter_APP-2026-904.pdf (820 KB)</option>
                    <option value="Proof_of_Tuition_Wire_Transfer_INV-2026-101.pdf">Proof_of_Tuition_Wire_Transfer_INV-2026-101.pdf (512 KB)</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerateR2Url}
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/30"
                >
                  <Zap className="w-4 h-4" />
                  <span>Issue 60-Minute Signed R2 URL</span>
                </button>
              </div>

              {/* Output Display */}
              <div className="space-y-3 bg-slate-950 p-5 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white text-sm">Signed URL Result</h4>
                {generatedSignedUrl ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-900 rounded-lg border border-cyan-800/60 font-mono text-[10px] text-cyan-300 break-all">
                      {generatedSignedUrl}
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={generatedSignedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Simulate R2 Fetch</span>
                      </a>
                      <span className="text-[10px] text-slate-400">Expires in 3600s • Bandwidth Egress: $0.00</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 italic border border-dashed border-slate-800 rounded-lg">
                    Select a document and click generate to issue a signed R2 URL.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Automated Backups & R2 Snapshots */}
      {activeTab === 'backups' && (
        <div className="space-y-6 text-xs">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center space-x-2">
                  <HardDrive className="w-5 h-5 text-amber-400" />
                  <span>Nightly pg_dump → Cloudflare R2 Backup Engine</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Automated GitHub Actions workflow executing nightly database dumps to R2 object storage with 30-day rolling retention.
                </p>
              </div>

              <button
                onClick={handleRunBackup}
                disabled={isBackingUp}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition flex items-center space-x-2 shadow-lg shadow-amber-600/30"
              >
                <RefreshCw className={`w-4 h-4 ${isBackingUp ? 'animate-spin' : ''}`} />
                <span>{isBackingUp ? 'Executing pg_dump...' : 'Run Manual Backup to R2'}</span>
              </button>
            </div>

            {/* Execution Console Logs */}
            {backupConsoleLogs.length > 0 && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-amber-300 space-y-1">
                <div className="flex items-center space-x-2 text-slate-400 text-[10px] font-bold uppercase mb-2">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Backup Runner Output Terminal</span>
                </div>
                {backupConsoleLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">{log}</div>
                ))}
              </div>
            )}

            {/* Historical Backups Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">Verified Backup Snapshots ({dbBackups.length})</h4>
              <div className="space-y-2">
                {dbBackups.map(bkp => (
                  <div key={bkp.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs font-mono">
                    <div className="space-y-0.5">
                      <div className="text-white font-bold flex items-center space-x-2">
                        <span>{bkp.filename}</span>
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 text-[10px] border border-amber-800">
                          {bkp.databaseProject}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">Timestamp: {bkp.timestamp} • Size: {bkp.sizeMB} MB</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                        {bkp.status}
                      </span>
                      <button
                        onClick={() => alert(`Simulating restore test for snapshot: ${bkp.filename}\nStatus: Snapshot integrity verified! Database restore ready.`)}
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-[11px] font-sans font-bold"
                      >
                        Verify Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: DB Financial Hold Constraint Verifier */}
      {activeTab === 'hold_verifier' && (
        <div className="space-y-6 text-xs">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-rose-400" />
                <span>Database-Level Financial Hold Constraint Verifier</span>
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Per Section 3, Step 3 of the strategy: Financial holds are enforced directly as Postgres database triggers/check constraints so that even an API bypass cannot allow unpaid course registration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white text-sm">Select Student & Course to Test Constraint</h4>
                
                <div className="space-y-2">
                  <label className="text-slate-400 font-semibold block">Student Account</label>
                  <select
                    value={holdTestStudentId}
                    onChange={e => setHoldTestStudentId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-semibold"
                  >
                    {students.map(std => (
                      <option key={std.id} value={std.id}>
                        {std.firstName} {std.lastName} ({std.studentUid}) - {std.financialHold ? '⚠️ FINANCIAL HOLD ACTIVE' : '✅ Clear'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-slate-400 font-semibold block">Target Course</label>
                  <select
                    value={holdTestCourseId}
                    onChange={e => setHoldTestCourseId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-semibold"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.title} ({c.credits} Credits)
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleTestHoldConstraint}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/30"
                >
                  <Zap className="w-4 h-4" />
                  <span>Execute Registration DB Transaction Test</span>
                </button>
              </div>

              {/* Transaction Result */}
              <div className="space-y-3 bg-slate-950 p-5 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white text-sm">Postgres Engine Transaction Log</h4>
                {holdTestResult ? (
                  <div className="space-y-3">
                    <div className={`p-4 rounded-xl border ${
                      holdTestResult.status === 'blocked'
                        ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                        : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    }`}>
                      <div className="font-bold text-sm mb-1 flex items-center space-x-2">
                        {holdTestResult.status === 'blocked' ? (
                          <>
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                            <span>TRANSACTION ABORTED BY DB TRIGGER</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>TRANSACTION COMMITTED</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs">{holdTestResult.message}</p>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-300">
                      <span className="text-slate-500 block text-[9px] uppercase font-bold mb-1">Postgres Constraint Definition:</span>
                      <code>{holdTestResult.sqlConstraint}</code>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 italic border border-dashed border-slate-800 rounded-lg">
                    Click execute to test database-level financial hold transaction blocking.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Audit Log Inspector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md text-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-bold text-white text-base flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>Live Security Audit Logs ({auditLogs.length} Events)</span>
          </h2>
          <span className="text-slate-400 font-mono text-[11px]">Postgres Core Audit Log Table</span>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {auditLogs.map(log => (
            <div key={log.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 font-mono text-[11px] space-y-1">
              <div className="flex justify-between text-slate-400">
                <span className="text-indigo-300 font-bold">[{log.timestamp}] {log.action}</span>
                <span className="text-emerald-400">{log.performedBy}</span>
              </div>
              <p className="text-slate-300">{log.details}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
