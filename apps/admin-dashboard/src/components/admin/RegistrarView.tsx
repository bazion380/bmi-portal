import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, 
  Search, 
  Award, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  UserPlus,
  Plus,
  X,
  Edit2,
  Trash2,
  Printer,
  ShieldCheck,
  Building2,
  Loader2
} from 'lucide-react';
import { Student, Course } from '../../types';
import { 
  SecurityWatermark, 
  GuillochePattern, 
  MicrotextBorder, 
  SecuritySealBadge 
} from '../common/DocumentSecurityComponents';

// ─── Field helper ──────────────────────────────────────────────────────────
const Field: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}> = ({ label, required, children, hint }) => (
  <div className="space-y-1">
    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
      {label} {required && <span className="text-rose-400">*</span>}
    </label>
    {children}
    {hint && <p className="text-[10px] text-slate-500">{hint}</p>}
  </div>
);

const inputCls = "w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition";
const selectCls = inputCls;

// ─── Initial form state ────────────────────────────────────────────────────
const BLANK_FORM = {
  // Identity
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  nationalId: '',
  gender: 'Male',
  nationality: '',
  // Academic
  career: 'UG' as const,
  program: '',
  department: 'School of Computing & Engineering',
  cohortYear: new Date().getFullYear(),
  currentSemester: 1,
  academicStatus: 'Active' as const,
  creditsRequired: 120,
  // Optional
  advisorName: '',
  advisorEmail: '',
  guardianName: '',
  guardianRelation: '',
  guardianPhone: '',
  guardianEmail: '',
};

type FormState = typeof BLANK_FORM;

// ─── Add Student Modal ─────────────────────────────────────────────────────
const AddStudentModal: React.FC<{ onClose: () => void; onSuccess: (s: Student) => void }> = ({ onClose, onSuccess }) => {
  const { addStudent } = useApp();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<FormState>(BLANK_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof FormState, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const validateStep1 = () => {
    if (!form.firstName.trim()) return 'First name is required.';
    if (!form.lastName.trim()) return 'Last name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'A valid email address is required.';
    if (!form.dateOfBirth) return 'Date of birth is required.';
    if (!form.nationalId.trim()) return 'National ID is required.';
    if (!form.nationality.trim()) return 'Nationality is required.';
    return null;
  };

  const validateStep2 = () => {
    if (!form.program.trim()) return 'Program / degree name is required.';
    return null;
  };

  const goNext = () => {
    setError(null);
    const err = step === 1 ? validateStep1() : step === 2 ? validateStep2() : null;
    if (err) { setError(err); return; }
    setStep(prev => (prev + 1) as 1 | 2 | 3);
  };

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        gpa: 0,
        cgpa: 0,
        creditsEarned: 0,
        financialHold: false,
        academicHold: false,
        avatarUrl: '',
      };
      const student = await addStudent(payload as any);
      onSuccess(student);
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Failed to create student. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const STEPS = ['Personal Info', 'Academic Details', 'Review & Submit'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <UserPlus className="w-4.5 h-4.5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Register New Student</h2>
              <p className="text-[10px] text-slate-400">Direct SIS registration · Registrar Office</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-4 shrink-0">
          <div className="flex items-center space-x-2">
            {STEPS.map((label, i) => {
              const n = i + 1;
              const active = step === n;
              const done = step > n;
              return (
                <React.Fragment key={n}>
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
                      done ? 'bg-emerald-600 text-white' : active ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/40' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : n}
                    </div>
                    <span className={`text-[11px] font-semibold truncate ${active ? 'text-white' : done ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px ${done ? 'bg-emerald-700' : 'bg-slate-800'} mx-1`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

          {/* ── Step 1: Personal Info ── */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name" required>
                  <input id="std-firstName" className={inputCls} value={form.firstName}
                    onChange={e => set('firstName', e.target.value)} placeholder="e.g. James" />
                </Field>
                <Field label="Last Name" required>
                  <input id="std-lastName" className={inputCls} value={form.lastName}
                    onChange={e => set('lastName', e.target.value)} placeholder="e.g. Okonkwo" />
                </Field>
              </div>
              <Field label="Institutional Email Address" required>
                <input id="std-email" type="email" className={inputCls} value={form.email}
                  onChange={e => set('email', e.target.value)} placeholder="firstname.lastname@student.bmi.edu" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone Number">
                  <input id="std-phone" type="tel" className={inputCls} value={form.phone}
                    onChange={e => set('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
                </Field>
                <Field label="Date of Birth" required>
                  <input id="std-dob" type="date" className={inputCls} value={form.dateOfBirth}
                    onChange={e => set('dateOfBirth', e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="National ID / Passport" required hint="Used for permanent UID generation">
                  <input id="std-nationalId" className={`${inputCls} font-mono`} value={form.nationalId}
                    onChange={e => set('nationalId', e.target.value)} placeholder="e.g. NAT-1234567" />
                </Field>
                <Field label="Gender" required>
                  <select id="std-gender" className={selectCls} value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Non-Binary</option>
                    <option>Prefer not to say</option>
                  </select>
                </Field>
              </div>
              <Field label="Nationality" required>
                <input id="std-nationality" className={inputCls} value={form.nationality}
                  onChange={e => set('nationality', e.target.value)} placeholder="e.g. Nigerian, American, British…" />
              </Field>
              <div className="border-t border-slate-800/60 pt-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Guardian / Emergency Contact (optional)</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Guardian Full Name">
                    <input className={inputCls} value={form.guardianName}
                      onChange={e => set('guardianName', e.target.value)} placeholder="Parent or guardian name" />
                  </Field>
                  <Field label="Relationship">
                    <select className={selectCls} value={form.guardianRelation} onChange={e => set('guardianRelation', e.target.value)}>
                      <option value="">— Select —</option>
                      <option>Mother</option>
                      <option>Father</option>
                      <option>Sibling</option>
                      <option>Spouse</option>
                      <option>Other</option>
                    </select>
                  </Field>
                  <Field label="Guardian Phone">
                    <input type="tel" className={inputCls} value={form.guardianPhone}
                      onChange={e => set('guardianPhone', e.target.value)} placeholder="+1 (555) 000-0000" />
                  </Field>
                  <Field label="Guardian Email">
                    <input type="email" className={inputCls} value={form.guardianEmail}
                      onChange={e => set('guardianEmail', e.target.value)} placeholder="guardian@example.com" />
                  </Field>
                </div>
              </div>
            </>
          )}

          {/* ── Step 2: Academic Details ── */}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Academic Career" required>
                  <select id="std-career" className={selectCls} value={form.career} onChange={e => set('career', e.target.value)}>
                    <option value="UG">Undergraduate (UG)</option>
                    <option value="PG">Postgraduate (PG)</option>
                    <option value="DR">Doctoral (DR)</option>
                    <option value="CE">Continuing Education (CE)</option>
                  </select>
                </Field>
                <Field label="Cohort Year" required>
                  <input id="std-cohort" type="number" className={`${inputCls} font-mono`} value={form.cohortYear}
                    min={2015} max={2035} onChange={e => set('cohortYear', Number(e.target.value))} />
                </Field>
              </div>
              <Field label="Degree Programme / Program Name" required>
                <input id="std-program" className={inputCls} value={form.program}
                  onChange={e => set('program', e.target.value)} placeholder="e.g. B.Sc. Computer Science" />
              </Field>
              <Field label="Department / School" required>
                <select id="std-dept" className={selectCls} value={form.department} onChange={e => set('department', e.target.value)}>
                  <option>School of Computing &amp; Engineering</option>
                  <option>School of Business &amp; Economics</option>
                  <option>School of Mathematics</option>
                  <option>School of Humanities</option>
                  <option>School of Health Sciences</option>
                  <option>School of Law</option>
                  <option>School of Education</option>
                </select>
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Current Semester">
                  <input id="std-sem" type="number" className={`${inputCls} font-mono`} value={form.currentSemester}
                    min={1} max={12} onChange={e => set('currentSemester', Number(e.target.value))} />
                </Field>
                <Field label="Credits Required">
                  <input id="std-credits" type="number" className={`${inputCls} font-mono`} value={form.creditsRequired}
                    min={60} max={240} onChange={e => set('creditsRequired', Number(e.target.value))} />
                </Field>
                <Field label="Academic Status">
                  <select id="std-status" className={selectCls} value={form.academicStatus} onChange={e => set('academicStatus', e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Probation">Probation</option>
                    <option value="Deferred">Deferred</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </Field>
              </div>
              <div className="border-t border-slate-800/60 pt-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Academic Advisor (optional)</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Advisor Name">
                    <input className={inputCls} value={form.advisorName}
                      onChange={e => set('advisorName', e.target.value)} placeholder="e.g. Dr. Jane Smith" />
                  </Field>
                  <Field label="Advisor Email">
                    <input type="email" className={inputCls} value={form.advisorEmail}
                      onChange={e => set('advisorEmail', e.target.value)} placeholder="advisor@bmi.edu" />
                  </Field>
                </div>
              </div>
            </>
          )}

          {/* ── Step 3: Review & Submit ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-3">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <UserCheck className="w-3.5 h-3.5" /> <span>Personal Information</span>
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                  <div><span className="text-slate-500">Full Name: </span><span className="text-white font-semibold">{form.firstName} {form.lastName}</span></div>
                  <div><span className="text-slate-500">Email: </span><span className="text-white">{form.email}</span></div>
                  <div><span className="text-slate-500">Date of Birth: </span><span className="text-white">{form.dateOfBirth}</span></div>
                  <div><span className="text-slate-500">National ID: </span><span className="font-mono text-white">{form.nationalId}</span></div>
                  <div><span className="text-slate-500">Gender: </span><span className="text-white">{form.gender}</span></div>
                  <div><span className="text-slate-500">Nationality: </span><span className="text-white">{form.nationality}</span></div>
                  {form.phone && <div><span className="text-slate-500">Phone: </span><span className="text-white">{form.phone}</span></div>}
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-3">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> <span>Academic Details</span>
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                  <div><span className="text-slate-500">Career: </span><span className="text-white font-semibold">{form.career}</span></div>
                  <div><span className="text-slate-500">Cohort: </span><span className="text-white">{form.cohortYear}</span></div>
                  <div className="col-span-2"><span className="text-slate-500">Programme: </span><span className="text-white font-semibold">{form.program}</span></div>
                  <div className="col-span-2"><span className="text-slate-500">Department: </span><span className="text-white">{form.department}</span></div>
                  <div><span className="text-slate-500">Semester: </span><span className="text-white">{form.currentSemester}</span></div>
                  <div><span className="text-slate-500">Credits Req: </span><span className="text-white">{form.creditsRequired}</span></div>
                  <div><span className="text-slate-500">Status: </span><span className="text-emerald-400 font-semibold">{form.academicStatus}</span></div>
                </div>
              </div>

              <div className="bg-amber-950/30 border border-amber-700/30 rounded-xl p-3 flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-300/90 leading-relaxed">
                  A <strong>Permanent Student UID</strong> and <strong>Registration Number</strong> will be auto-generated by the server and written to the Neon PostgreSQL database. This action is logged to the audit trail.
                </p>
              </div>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="flex items-start space-x-2.5 bg-rose-950/50 border border-rose-700/50 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-300">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between shrink-0 gap-3">
          <button
            onClick={() => step > 1 ? setStep(prev => (prev - 1) as 1 | 2 | 3) : onClose()}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
            disabled={submitting}
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>

          {step < 3 ? (
            <button
              onClick={goNext}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30 flex items-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Creating…</span></>
              ) : (
                <><UserPlus className="w-3.5 h-3.5" /><span>Create Student Record</span></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Success Toast ─────────────────────────────────────────────────────────
const SuccessToast: React.FC<{ student: Student; onDismiss: () => void }> = ({ student, onDismiss }) => (
  <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
    <div className="bg-emerald-900 border border-emerald-600/60 rounded-2xl p-4 shadow-2xl flex items-start space-x-3 max-w-sm">
      <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white">Student Created Successfully</p>
        <p className="text-[11px] text-emerald-300 mt-0.5 font-mono truncate">{student.registrationNumber}</p>
        <p className="text-[11px] text-emerald-200/70 mt-0.5">{student.firstName} {student.lastName}</p>
      </div>
      <button onClick={onDismiss} className="text-emerald-400/60 hover:text-emerald-300 shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// ─── Main RegistrarView ────────────────────────────────────────────────────
export const RegistrarView: React.FC = () => {
  const { students, courses, enrollments, addCourse, updateCourse, deleteCourse, graduateStudent, toggleStudentHold } = useApp();
  
  const [activeTab, setActiveTab] = useState<'students' | 'courses'>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  
  // Add Student modal
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [successStudent, setSuccessStudent] = useState<Student | null>(null);

  // Edit Course Modal State
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Add Course Modal State
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCredits, setNewCredits] = useState(3);
  const [newDept, setNewDept] = useState('School of Computing & Engineering');
  const [newInstructor, setNewInstructor] = useState('');

  const filteredStudents = students.filter(s =>
    s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCourses = courses.filter(c =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newTitle) return;

    addCourse({
      code: newCode,
      title: newTitle,
      credits: newCredits,
      department: newDept,
      instructorName: newInstructor,
      instructorId: '',
      schedule: 'Mon, Wed 02:00 - 03:30 PM',
      room: 'Turing Hall 201',
      capacity: 35,
      prerequisites: [],
      description: 'Newly created course added via Office of the Registrar.',
      syllabus: ['Week 1: Foundations & Overview']
    });

    setShowCourseModal(false);
    setNewCode('');
    setNewTitle('');
    setNewInstructor('');
  };

  const handleUpdateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    updateCourse(editingCourse.id, editingCourse);
    setEditingCourse(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <span>Office of the Registrar — SIS &amp; Curriculum</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Canonical student records, academic standing flags, program setup, and official transcripts.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {/* Add Student */}
          <button
            onClick={() => setShowAddStudent(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>

          {/* Add Course */}
          <button
            onClick={() => setShowCourseModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'students' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Student Master Records ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'courses' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Curriculum Catalog ({courses.length})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'students' ? "Search students by name, ID, or program..." : "Search courses by code, title..."}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Students View */}
      {activeTab === 'students' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-md">
          {filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
                <UserCheck className="w-7 h-7 text-slate-600" />
              </div>
              <p className="text-sm font-semibold text-slate-400">
                {searchQuery ? 'No students match your search.' : 'No students registered yet.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowAddStudent(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register First Student</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto p-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                    <th className="p-3">Registration No / UID</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Program</th>
                    <th className="p-3">CGPA</th>
                    <th className="p-3">Credits</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Holds</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStudents.map(std => (
                    <tr key={std.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono">
                        <div className="font-bold text-emerald-300">{std.registrationNumber || std.studentNumber}</div>
                        <div className="text-[10px] text-indigo-300/80 font-bold">UID: {std.studentUid}</div>
                      </td>
                      <td className="p-3 font-semibold text-white">
                        {std.firstName} {std.lastName}
                      </td>
                      <td className="p-3 text-slate-300">{std.program}</td>
                      <td className="p-3 font-mono font-bold text-white">{std.cgpa}</td>
                      <td className="p-3 font-mono text-slate-400">{std.creditsEarned} / {std.creditsRequired}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          std.academicStatus === 'Active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : std.academicStatus === 'Probation'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {std.academicStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        {std.financialHold ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                            Financial
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Clear</span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => { setSelectedStudent(std); setShowTranscript(false); }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium transition"
                        >
                          Inspect
                        </button>
                        {std.academicStatus !== 'Graduated' && (
                          <button
                            onClick={() => {
                              if (confirm(`Officially graduate student ${std.firstName} ${std.lastName}?`)) {
                                graduateStudent(std.id);
                              }
                            }}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold transition"
                          >
                            Graduation
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Courses Catalog View */}
      {activeTab === 'courses' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
          {filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-slate-600" />
              </div>
              <p className="text-sm font-semibold text-slate-400">
                {searchQuery ? 'No courses match your search.' : 'No courses in the curriculum yet.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCourseModal(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Course</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                    <th className="p-3">Course Code</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Credits</th>
                    <th className="p-3">Instructor</th>
                    <th className="p-3">Capacity</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredCourses.map(c => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono font-bold text-indigo-400">{c.code}</td>
                      <td className="p-3 font-bold text-white">{c.title}</td>
                      <td className="p-3 text-slate-300">{c.department}</td>
                      <td className="p-3 font-mono text-emerald-400 font-bold">{c.credits} Cr</td>
                      <td className="p-3 text-slate-300">{c.instructorName}</td>
                      <td className="p-3 text-slate-400 font-mono">{c.enrolledCount} / {c.capacity}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => setEditingCourse(c)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg transition"
                          title="Edit Course Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete course ${c.code}?`)) {
                              deleteCourse(c.id);
                            }
                          }}
                          className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-lg transition"
                          title="Delete Course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}

      {/* Add Student Modal */}
      {showAddStudent && (
        <AddStudentModal
          onClose={() => setShowAddStudent(false)}
          onSuccess={(s) => { setSuccessStudent(s); setTimeout(() => setSuccessStudent(null), 5000); }}
        />
      )}

      {/* Success Toast */}
      {successStudent && (
        <SuccessToast student={successStudent} onDismiss={() => setSuccessStudent(null)} />
      )}

      {/* Inspect Student / Official Transcript Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 text-xs relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-bold text-white text-base flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>SIS Master Student Record — {selectedStudent.registrationNumber || selectedStudent.studentNumber}</span>
              </h2>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!showTranscript ? (
              <>
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-800/60 rounded-xl">
                  <div><strong className="text-slate-400">Permanent Student UID:</strong> <span className="font-mono text-indigo-300 font-bold">{selectedStudent.studentUid}</span></div>
                  <div><strong className="text-slate-400">Registration Number:</strong> <span className="font-mono text-emerald-300 font-bold">{selectedStudent.registrationNumber || selectedStudent.studentNumber}</span></div>
                  <div><strong className="text-slate-400">Full Name:</strong> {selectedStudent.firstName} {selectedStudent.lastName}</div>
                  <div><strong className="text-slate-400">Email:</strong> {selectedStudent.email}</div>
                  <div><strong className="text-slate-400">Program:</strong> {selectedStudent.program}</div>
                  <div><strong className="text-slate-400">Department:</strong> {selectedStudent.department}</div>
                  <div><strong className="text-slate-400">CGPA:</strong> <span className="font-mono text-emerald-400 font-bold">{selectedStudent.cgpa}</span></div>
                  <div><strong className="text-slate-400">Credits Earned:</strong> {selectedStudent.creditsEarned} / {selectedStudent.creditsRequired}</div>
                  <div><strong className="text-slate-400">Academic Standing:</strong> {selectedStudent.academicStatus}</div>
                  <div><strong className="text-slate-400">Financial Hold:</strong> {selectedStudent.financialHold ? 'Active Hold' : 'Cleared'}</div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        toggleStudentHold(selectedStudent.id, 'academic', !selectedStudent.academicHold);
                        setSelectedStudent(null);
                      }}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition"
                    >
                      Toggle Academic Hold
                    </button>
                    <button
                      onClick={() => setShowTranscript(true)}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition flex items-center space-x-1.5"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Official Transcript</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              /* Official Transcript View - Refactored to match Student Portal simple layout */
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Academic Transcript</h3>
                  <p className="text-sm text-slate-400">Complete grade history and academic standing.</p>
                </div>
                
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl">📊</div>
                    <div>
                      <div className="text-xs text-slate-400 font-semibold">Cumulative GPA</div>
                      <div className="text-lg font-bold text-white">{selectedStudent.cgpa}</div>
                      <div className="text-[10px] text-slate-500">Out of 4.0</div>
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">✅</div>
                    <div>
                      <div className="text-xs text-slate-400 font-semibold">Courses Completed</div>
                      <div className="text-lg font-bold text-white">{enrollments.filter(e => e.studentId === selectedStudent.id && e.grade).length}</div>
                      <div className="text-[10px] text-slate-500">Total graded</div>
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">🎓</div>
                    <div>
                      <div className="text-xs text-slate-400 font-semibold">Credits Earned</div>
                      <div className="text-lg font-bold text-white">{selectedStudent.creditsEarned}</div>
                      <div className="text-[10px] text-slate-500">Across all terms</div>
                    </div>
                  </div>
                </div>

                {/* Grades Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
                  <div className="mb-4">
                    <h4 className="font-bold text-white text-base">Grade Records</h4>
                    <p className="text-xs text-slate-400">{enrollments.filter(e => e.studentId === selectedStudent.id).length} course(s) shown</p>
                  </div>
                  
                  {enrollments.filter(e => e.studentId === selectedStudent.id).length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-3xl mb-2">📭</div>
                      <p className="text-sm text-slate-400">No grade records found.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-bold">
                            <th className="p-3">Course Code</th>
                            <th className="p-3">Course Title</th>
                            <th className="p-3">Credits</th>
                            <th className="p-3">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-200">
                          {enrollments.filter(e => e.studentId === selectedStudent.id).map(e => {
                            const crs = courses.find(c => c.id === e.courseId);
                            return (
                              <tr key={e.courseId} className="hover:bg-slate-800/40">
                                <td className="p-3 font-mono font-bold">{crs?.code}</td>
                                <td className="p-3">{crs?.title}</td>
                                <td className="p-3">{crs?.credits}</td>
                                <td className="p-3 font-bold">
                                  <span className={`px-2 py-1 rounded text-[10px] ${e.grade?.startsWith('A') ? 'bg-emerald-500/20 text-emerald-400' : e.grade?.startsWith('B') ? 'bg-blue-500/20 text-blue-400' : e.grade?.startsWith('C') ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{e.grade || '—'}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setShowTranscript(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-bold text-white text-base">Edit Course Details</h2>
              <button onClick={() => setEditingCourse(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCourse} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Course Code</label>
                <input
                  type="text"
                  value={editingCourse.code}
                  onChange={(e) => setEditingCourse({ ...editingCourse, code: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Course Title</label>
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Credits</label>
                  <input
                    type="number"
                    value={editingCourse.credits}
                    onChange={(e) => setEditingCourse({ ...editingCourse, credits: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Capacity</label>
                  <input
                    type="number"
                    value={editingCourse.capacity}
                    onChange={(e) => setEditingCourse({ ...editingCourse, capacity: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-bold text-white text-base">Add New Course to Curriculum</h2>
              <button onClick={() => setShowCourseModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Course Code</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="e.g. CSC405"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Course Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Artificial Intelligence & Machine Learning"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Credits</label>
                  <input
                    type="number"
                    value={newCredits}
                    onChange={(e) => setNewCredits(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="School of Computing & Engineering">School of Computing &amp; Engineering</option>
                    <option value="School of Business & Economics">School of Business &amp; Economics</option>
                    <option value="School of Mathematics">School of Mathematics</option>
                    <option value="School of Humanities">School of Humanities</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Instructor Name</label>
                <input
                  type="text"
                  value={newInstructor}
                  onChange={(e) => setNewInstructor(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition"
              >
                Create &amp; Publish Course
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
