import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import client from '../../api/client';
import { registerFromInvite, validateToken } from '../../api/auth';

// ── Step progress indicator ──────────────────────────────────
const STEPS = [
  { n: 1, label: 'Student Info' },
  { n: 2, label: 'Questionnaire' },
  { n: 3, label: 'Parent Info' },
  { n: 4, label: 'Account Setup' },
  { n: 5, label: 'Confirm' },
];

function StepProgress({ current }) {
  return (
    <div className="step-progress">
      {STEPS.map((step, i) => (
        <div key={step.n} className="step-item" style={{ flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className={`step-circle${current === step.n ? ' active' : current > step.n ? ' completed' : ''}`}>
              {current > step.n ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              ) : step.n}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-connector${current > step.n ? ' completed' : ''}`} />
            )}
          </div>
          <div className={`step-label${current === step.n ? ' active' : current > step.n ? ' completed' : ''}`}>
            {step.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Step 1: Student Bio ──────────────────────────────────────
function Step1({ data, onChange, errors }) {
  const f = (field) => ({
    value: data[field] || '',
    onChange: e => onChange(field, e.target.value),
    className: errors[field] ? 'error' : '',
  });

  return (
    <div className="animate-in">
      <h3 style={{ marginBottom: 'var(--space-2)', fontFamily: 'var(--font-serif)' }}>Student Information</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)', fontSize: '0.875rem' }}>
        Please complete all fields accurately. This information will be used for your program documentation.
      </p>

      <div className="form-row">
        <div className="form-group">
          <label>First Name (English) *</label>
          <input type="text" placeholder="e.g. Wei" {...f('first_name')} />
          {errors.first_name && <div className="form-error">{errors.first_name}</div>}
        </div>
        <div className="form-group">
          <label>Last Name (English) *</label>
          <input type="text" placeholder="e.g. Li" {...f('last_name')} />
          {errors.last_name && <div className="form-error">{errors.last_name}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Chinese Name</label>
          <input type="text" placeholder="e.g. 李威" {...f('chinese_name')} />
        </div>
        <div className="form-group">
          <label>Date of Birth *</label>
          <input type="date" {...f('dob')} />
          {errors.dob && <div className="form-error">{errors.dob}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Phone Number *</label>
          <input type="tel" placeholder="+86 xxx xxxx xxxx" {...f('phone')} />
          {errors.phone && <div className="form-error">{errors.phone}</div>}
        </div>
        <div className="form-group">
          <label>Passport Number *</label>
          <input type="text" placeholder="e.g. E12345678" {...f('passport_number')} />
          {errors.passport_number && <div className="form-error">{errors.passport_number}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Current School</label>
          <input type="text" placeholder="Name of your current school" {...f('current_school')} />
        </div>
        <div className="form-group">
          <label>Current Grade Level</label>
          <select {...f('grade_level')}>
            <option value="">Select grade...</option>
            {['7','8','9','10','11','12'].map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Intended Program / Stream</label>
        <select {...f('intended_program')}>
          <option value="">Select program...</option>
          <option>Sciences (Biology, Chemistry, Physics)</option>
          <option>Arts &amp; Humanities</option>
          <option>Business &amp; Commerce</option>
          <option>General Studies (Undecided)</option>
          <option>Languages &amp; Culture</option>
        </select>
      </div>

      <div className="form-group">
        <label>WeChat ID</label>
        <input type="text" placeholder="Your WeChat ID for communication" {...f('wechat_id')} />
      </div>
    </div>
  );
}

// ── Step 2: Questionnaire ────────────────────────────────────
const QUESTIONS = [
  { key: 'medical_conditions', label: 'Do you have any known medical conditions or chronic illnesses?', type: 'textarea', placeholder: 'e.g. asthma, diabetes, none — please be specific' },
  { key: 'allergies', label: 'Please list any allergies (food, medication, environmental)', type: 'textarea', placeholder: 'e.g. peanuts, penicillin, pollen, or "none"' },
  { key: 'dietary_restrictions', label: 'Do you have any dietary restrictions or preferences?', type: 'select', options: ['None', 'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-free', 'Other'] },
  { key: 'dietary_restrictions_other', label: 'If other, please specify', type: 'text', placeholder: 'Your dietary requirement' },
  { key: 'medications', label: 'Are you currently taking any prescription medications?', type: 'textarea', placeholder: 'List medication name and dosage, or "none"' },
  { key: 'emergency_medical_info', label: 'Is there any other medical information your host family and school should know?', type: 'textarea', placeholder: 'e.g. carries an EpiPen, uses insulin, or "none"' },
  { key: 'learning_preferences', label: 'How do you learn best?', type: 'select', options: ['Visual (charts, diagrams)', 'Auditory (listening, discussion)', 'Reading/Writing', 'Hands-on activities', 'Mixed / Flexible'] },
  { key: 'hobbies_interests', label: 'What are your main hobbies and interests?', type: 'textarea', placeholder: 'e.g. piano, basketball, reading, coding' },
  { key: 'english_proficiency', label: 'How would you rate your English proficiency?', type: 'select', options: ['Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate', 'Advanced', 'Native/Near-native'] },
  { key: 'special_needs', label: 'Do you require any special accommodations or support?', type: 'textarea', placeholder: 'e.g. additional ESL support, mobility accommodations, or "none"' },
];

function Step2({ data, onChange }) {
  return (
    <div className="animate-in">
      <h3 style={{ marginBottom: 'var(--space-2)', fontFamily: 'var(--font-serif)' }}>Personal Questionnaire</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)', fontSize: '0.875rem' }}>
        This information helps us provide the best possible support throughout your program. All responses are confidential.
      </p>

      {QUESTIONS.map((q, i) => (
        <div key={q.key} className="form-group">
          <label style={{ textTransform: 'none', fontSize: '0.85rem', fontWeight: 600, letterSpacing: 0 }}>
            <span style={{ color: 'var(--text-muted)', marginRight: 8, fontFamily: 'var(--font-serif)', fontSize: '0.9rem' }}>{i + 1}.</span>
            {q.label}
          </label>
          {q.type === 'textarea' ? (
            <textarea
              rows={3}
              placeholder={q.placeholder}
              value={data[q.key] || ''}
              onChange={e => onChange(q.key, e.target.value)}
              style={{ resize: 'vertical', minHeight: 80 }}
            />
          ) : q.type === 'select' ? (
            <select
              value={data[q.key] || ''}
              onChange={e => onChange(q.key, e.target.value)}
            >
              <option value="">Select an option...</option>
              {q.options.map(opt => <option key={opt}>{opt}</option>)}
            </select>
          ) : (
            <input
              type="text"
              placeholder={q.placeholder}
              value={data[q.key] || ''}
              onChange={e => onChange(q.key, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Step 3: Parent Info ──────────────────────────────────────
function Step3({ data, onChange, errors }) {
  const f = (field) => ({
    value: data[field] || '',
    onChange: e => onChange(field, e.target.value),
    className: errors[field] ? 'error' : '',
  });

  return (
    <div className="animate-in">
      <h3 style={{ marginBottom: 'var(--space-2)', fontFamily: 'var(--font-serif)' }}>Parent / Guardian Information</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)', fontSize: '0.875rem' }}>
        This contact will be designated as the primary guardian for all program communications.
      </p>

      <div className="form-row">
        <div className="form-group">
          <label>Parent First Name *</label>
          <input type="text" placeholder="e.g. Ming" {...f('parent_first_name')} />
          {errors.parent_first_name && <div className="form-error">{errors.parent_first_name}</div>}
        </div>
        <div className="form-group">
          <label>Parent Last Name *</label>
          <input type="text" placeholder="e.g. Li" {...f('parent_last_name')} />
          {errors.parent_last_name && <div className="form-error">{errors.parent_last_name}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Relationship to Student *</label>
          <select {...f('relationship')}>
            <option value="">Select...</option>
            <option>Father</option>
            <option>Mother</option>
            <option>Legal Guardian</option>
            <option>Grandparent</option>
            <option>Other</option>
          </select>
          {errors.relationship && <div className="form-error">{errors.relationship}</div>}
        </div>
        <div className="form-group">
          <label>Phone Number *</label>
          <input type="tel" placeholder="+86 xxx xxxx xxxx" {...f('parent_phone')} />
          {errors.parent_phone && <div className="form-error">{errors.parent_phone}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Email Address *</label>
          <input type="email" placeholder="parent@example.com" {...f('parent_email')} />
          {errors.parent_email && <div className="form-error">{errors.parent_email}</div>}
        </div>
        <div className="form-group">
          <label>WeChat ID</label>
          <input type="text" placeholder="WeChat account" {...f('parent_wechat')} />
        </div>
      </div>

      <div className="form-group">
        <label>Occupation</label>
        <input type="text" placeholder="e.g. Engineer, Teacher, Business Owner" {...f('parent_occupation')} />
      </div>

      <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-5)', background: 'var(--accent-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent)' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-text)', marginBottom: 4 }}>
          Emergency Contact Note
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          The parent/guardian listed here will be the primary emergency contact. You can add additional emergency contacts from your student portal after registration.
        </div>
      </div>
    </div>
  );
}

// ── Step 4: Account Setup ────────────────────────────────────
function Step4AccountSetup({ studentEmail, parentEmail, passwords, onChange, errors }) {
  const [showStudentPw, setShowStudentPw] = useState(false);
  const [showParentPw, setShowParentPw] = useState(false);
  const [showParentConfirm, setShowParentConfirm] = useState(false);

  const eyeIcon = (show) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {show
        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      }
    </svg>
  );

  return (
    <div className="animate-in">
      <h3 style={{ marginBottom: 'var(--space-2)', fontFamily: 'var(--font-serif)' }}>Account Setup</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)', fontSize: '0.875rem' }}>
        Set login credentials for both the student and parent accounts.
      </p>

      {/* Student account */}
      <div style={{ marginBottom: 'var(--space-5)', padding: 'var(--space-5)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface-raised)' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
          Student Account
        </div>
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label>Email</label>
          <input type="email" value={studentEmail} readOnly style={{ background: 'var(--content-bg)', color: 'var(--text-muted)', cursor: 'default' }} />
        </div>
        <div className="form-group" style={{ marginBottom: errors.student_password ? 'var(--space-1)' : 0 }}>
          <label>Password *</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showStudentPw ? 'text' : 'password'}
              value={passwords.student_password}
              onChange={e => onChange('student_password', e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              className={errors.student_password ? 'error' : ''}
              style={{ paddingRight: 40 }}
            />
            <button type="button" onClick={() => setShowStudentPw(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}>
              {eyeIcon(showStudentPw)}
            </button>
          </div>
          {errors.student_password && <div className="form-error">{errors.student_password}</div>}
        </div>
      </div>

      {/* Parent account */}
      <div style={{ padding: 'var(--space-5)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface-raised)' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
          Parent Account
        </div>
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label>Email</label>
          <input type="email" value={parentEmail} readOnly style={{ background: 'var(--content-bg)', color: 'var(--text-muted)', cursor: 'default' }} />
        </div>
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: errors.parent_password ? 'var(--space-1)' : 0 }}>
            <label>Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showParentPw ? 'text' : 'password'}
                value={passwords.parent_password}
                onChange={e => onChange('parent_password', e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className={errors.parent_password ? 'error' : ''}
                style={{ paddingRight: 40 }}
              />
              <button type="button" onClick={() => setShowParentPw(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}>
                {eyeIcon(showParentPw)}
              </button>
            </div>
            {errors.parent_password && <div className="form-error">{errors.parent_password}</div>}
          </div>
          <div className="form-group" style={{ marginBottom: errors.parent_confirm ? 'var(--space-1)' : 0 }}>
            <label>Confirm Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showParentConfirm ? 'text' : 'password'}
                value={passwords.parent_confirm}
                onChange={e => onChange('parent_confirm', e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
                className={errors.parent_confirm ? 'error' : ''}
                style={{ paddingRight: 40 }}
              />
              <button type="button" onClick={() => setShowParentConfirm(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}>
                {eyeIcon(showParentConfirm)}
              </button>
            </div>
            {errors.parent_confirm && <div className="form-error">{errors.parent_confirm}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 5: E-Signature + Voice recording ───────────────────
function SignaturePad({ onSign }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [signed, setSigned] = useState(false);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    drawing.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'oklch(28% 0.08 155)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setSigned(true);
  };

  const stopDraw = () => {
    drawing.current = false;
    if (signed) onSign(canvasRef.current.toDataURL());
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setSigned(false);
    onSign(null);
  };

  return (
    <div style={{ marginBottom: 'var(--space-5)' }}>
      <label>Parent E-Signature *</label>
      <div style={{ border: '2px solid var(--border-strong)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#fff', position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={560}
          height={140}
          style={{ display: 'block', width: '100%', cursor: 'crosshair', touchAction: 'none' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        <button
          type="button"
          onClick={clear}
          style={{
            position: 'absolute', top: 8, right: 8,
            background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            padding: '2px 10px', fontSize: '0.72rem', cursor: 'pointer', color: 'var(--text-muted)',
          }}
        >
          Clear
        </button>
        {!signed && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--border-strong)' }}>Sign here</span>
          </div>
        )}
      </div>
    </div>
  );
}

function VoiceRecorder({ onRecorded }) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [amplitude, setAmplitude] = useState(0);
  const phaseRef = useRef(0);
  const [micError, setMicError] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const animRef = useRef(null);
  const analyzerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new window.AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyzer = audioCtx.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      analyzerRef.current = analyzer;

      const data = new Uint8Array(analyzer.frequencyBinCount);
      const tick = () => {
        analyzer.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAmplitude(avg / 128);
        phaseRef.current += 0.18;
        animRef.current = requestAnimationFrame(tick);
      };
      tick();

      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const b = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(b);
        setAudioUrl(url);
        onRecorded(b);
        setAmplitude(0);
        cancelAnimationFrame(animRef.current);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch {
      setMicError('Microphone access is required. Please allow microphone access and try again.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const BARS = 20;
  return (
    <div style={{ marginBottom: 'var(--space-5)' }}>
      <label>Voice Consent Recording *</label>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--space-3)', textTransform: 'none', letterSpacing: 0 }}>
        Please read aloud: "I, [your name], consent to the terms of the Voices Education program and confirm all information in this form is accurate."
      </p>

      <div style={{
        height: 60,
        background: 'var(--sidebar-bg)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        padding: '0 var(--space-4)',
        marginBottom: 'var(--space-4)',
      }}>
        {Array.from({ length: BARS }).map((_, i) => {
          const base = 0.05;
          const wave = recording ? base + amplitude * Math.abs(Math.sin(i * 0.5 + phaseRef.current)) : base;
          return (
            <div key={i} style={{
              width: 3,
              borderRadius: 2,
              background: recording ? 'var(--accent)' : 'oklch(40% 0.05 155)',
              height: `${Math.max(4, Math.min(48, wave * 48))}px`,
              transition: 'height 0.08s ease',
            }} />
          );
        })}
      </div>

      {micError && (
        <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--status-urgent-bg)', border: '1px solid var(--status-urgent-border)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--status-urgent)', marginBottom: 'var(--space-3)' }}>
          {micError}
        </div>
      )}
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
        {!recording ? (
          <button type="button" className="btn btn-primary" onClick={startRecording}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            {audioUrl ? 'Re-record' : 'Start Recording'}
          </button>
        ) : (
          <button type="button" className="btn btn-danger" onClick={stopRecording} style={{ animation: 'pulse 1s infinite' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
            </svg>
            Stop Recording
          </button>
        )}
        {audioUrl && !recording && (
          <audio controls src={audioUrl} style={{ height: 36 }} />
        )}
      </div>
    </div>
  );
}

function Step5({ bio, parent, onSignature, onVoice }) {
  return (
    <div className="animate-in">
      <h3 style={{ marginBottom: 'var(--space-2)', fontFamily: 'var(--font-serif)' }}>Confirm &amp; Sign</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)', fontSize: '0.875rem' }}>
        Please review the summary below, then provide your parent's e-signature and voice consent to complete registration.
      </p>

      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
          {[
            ['Student Name', `${bio.first_name || ''} ${bio.last_name || ''}`],
            ['Date of Birth', bio.dob],
            ['Passport', bio.passport_number],
            ['Grade', bio.grade_level ? `Grade ${bio.grade_level}` : ''],
            ['Program', bio.intended_program],
            ['Parent', `${parent.parent_first_name || ''} ${parent.parent_last_name || ''}`],
            ['Relationship', parent.relationship],
            ['Parent Email', parent.parent_email],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{value || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      <SignaturePad onSign={onSignature} />
      <VoiceRecorder onRecorded={onVoice} />

      <div style={{ padding: 'var(--space-4)', background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        By signing above and providing a voice recording, the parent/guardian confirms that all information provided is accurate and consents to the Voices Education Concierge Program terms and conditions.
      </div>
    </div>
  );
}

// ── Success screen ───────────────────────────────────────────
function SuccessScreen({ studentId, parentId, pdfUrl }) {
  return (
    <div style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-8)', animation: 'fadeSlideIn 0.5s both' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'var(--status-active-bg)',
        border: '2px solid var(--status-active)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto var(--space-6)',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--status-active)" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <h2 style={{ marginBottom: 'var(--space-3)' }}>Registration Complete</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-8)', fontSize: '0.9rem' }}>
        Welcome to the Voices Education Concierge program. Your application has been successfully submitted.
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-5)', justifyContent: 'center', marginBottom: 'var(--space-8)' }}>
        {[['Student ID', studentId], ['Parent ID', parentId]].map(([label, id]) => (
          <div key={label} style={{
            padding: 'var(--space-5) var(--space-8)',
            background: 'var(--sidebar-bg)',
            borderRadius: 'var(--radius-lg)',
            minWidth: 160,
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'oklch(65% 0.05 90)', marginBottom: 'var(--space-2)' }}>
              {label}
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600, color: 'oklch(92% 0.02 90)' }}>
              {id}
            </div>
          </div>
        ))}
      </div>

      <a
        className="btn btn-secondary"
        href={pdfUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download Intake PDF
      </a>

      <div style={{ marginTop: 'var(--space-8)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Please save your Student ID and Parent ID for your records.
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────
export default function StudentOnboarding() {
  const { token: inviteToken } = useParams();
  const [orgName, setOrgName] = useState('');
  const [tokenError, setTokenError] = useState('');

  // localStorage key scoped to this invitation token
  const storageKey = `voices_onboarding_${inviteToken || 'anon'}`;

  const loadSaved = (field, fallback) => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return saved[field] ?? fallback;
    } catch {
      return fallback;
    }
  };

  const [step, setStep] = useState(() => loadSaved('step', 1));
  const [bio, setBio] = useState(() => loadSaved('bio', {}));
  const [questionnaire, setQuestionnaire] = useState(() => loadSaved('questionnaire', {}));
  const [parent, setParent] = useState(() => loadSaved('parent', {}));
  const [passwords, setPasswords] = useState({ student_password: '', parent_password: '', parent_confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [studentEmail, setStudentEmail] = useState('');
  const [signature, setSignature] = useState(null);
  const [voice, setVoice] = useState(null);
  const [errors, setErrors] = useState({});
  const [stepError, setStepError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (!inviteToken) return;
    validateToken(inviteToken)
      .then(data => {
        setOrgName(data.org_name || '');
        setStudentEmail(data.email || '');
      })
      .catch(() => setTokenError('This invitation link is invalid or has expired.'));
  }, [inviteToken]);

  // Persist form state to localStorage on every change
  const persist = (updates) => {
    try {
      const current = JSON.parse(localStorage.getItem(storageKey) || '{}');
      localStorage.setItem(storageKey, JSON.stringify({ ...current, ...updates }));
    } catch { /* ignore */ }
  };

  const handleBioChange = (field, value) => {
    setBio(p => {
      const next = { ...p, [field]: value };
      persist({ bio: next });
      return next;
    });
  };

  const handleQuestionnaireChange = (field, value) => {
    setQuestionnaire(p => {
      const next = { ...p, [field]: value };
      persist({ questionnaire: next });
      return next;
    });
  };

  const handleParentChange = (field, value) => {
    setParent(p => {
      const next = { ...p, [field]: value };
      persist({ parent: next });
      return next;
    });
  };

  const validateStep1 = () => {
    const e = {};
    if (!bio.first_name) e.first_name = 'Required';
    if (!bio.last_name) e.last_name = 'Required';
    if (!bio.dob) e.dob = 'Required';
    if (!bio.phone) e.phone = 'Required';
    if (!bio.passport_number) e.passport_number = 'Required';
    return e;
  };

  const validateStep3 = () => {
    const e = {};
    if (!parent.parent_first_name) e.parent_first_name = 'Required';
    if (!parent.parent_last_name) e.parent_last_name = 'Required';
    if (!parent.relationship) e.relationship = 'Required';
    if (!parent.parent_phone) e.parent_phone = 'Required';
    if (!parent.parent_email) e.parent_email = 'Required';
    return e;
  };

  const advanceStep = () => {
    const next = step + 1;
    persist({ step: next });
    setErrors({});
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = async () => {
    setStepError('');

    if (step === 1) {
      const e = validateStep1();
      if (Object.keys(e).length) { setErrors(e); return; }
      advanceStep();
      return;
    }

    if (step === 2) {
      // Questionnaire is optional — just advance
      advanceStep();
      return;
    }

    if (step === 3) {
      const e = validateStep3();
      if (Object.keys(e).length) { setErrors(e); return; }
      advanceStep();
      return;
    }

    if (step === 4) {
      const e = {};
      if (!passwords.student_password || passwords.student_password.length < 8)
        e.student_password = 'Password must be at least 8 characters.';
      if (!passwords.parent_password || passwords.parent_password.length < 8)
        e.parent_password = 'Password must be at least 8 characters.';
      if (passwords.parent_password !== passwords.parent_confirm)
        e.parent_confirm = 'Passwords do not match.';
      if (Object.keys(e).length) { setPwErrors(e); return; }
      setPwErrors({});
      advanceStep();
      return;
    }

    if (step === 5) {
      if (!signature) { setStepError('Parent signature is required.'); return; }
      if (!voice) { setStepError('Voice recording is required.'); return; }

      setSubmitting(true);
      try {
        // 1. Create student account
        const authData = await registerFromInvite({ token: inviteToken, password: passwords.student_password });
        localStorage.setItem('voices_token', authData.token);
        localStorage.setItem('voices_user', JSON.stringify(authData.user));

        // 2. Complete onboarding (includes parent account creation with parent_password)
        const formData = new FormData();
        formData.append('voice', voice, 'consent.webm');
        formData.append('signature_data', signature);
        formData.append('bio', JSON.stringify(bio));
        formData.append('questionnaire', JSON.stringify(questionnaire));
        formData.append('parent', JSON.stringify({ ...parent, parent_password: passwords.parent_password }));
        if (inviteToken) formData.append('invite_token', inviteToken);

        const { data } = await client.post('/api/onboarding/complete', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        localStorage.removeItem(storageKey);
        setDone({ studentId: data.studentId, parentId: data.parentId, pdfUrl: data.pdfUrl });
      } catch (err) {
        setStepError(err.response?.data?.message || 'Submission failed. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };


  if (done) return (
    <div style={{ minHeight: '100vh', background: 'var(--content-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 560, width: '100%' }}>
        <SuccessScreen studentId={done.studentId} parentId={done.parentId} pdfUrl={done.pdfUrl} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--content-bg)' }}>
      <div style={{ background: 'var(--sidebar-bg)', padding: 'var(--space-5) var(--space-8)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 600, color: 'oklch(92% 0.02 90)' }}>Voices</div>
        <div style={{ width: 1, height: 20, background: 'oklch(40% 0.05 155)' }} />
        <div style={{ fontSize: '0.8rem', color: 'oklch(70% 0.03 90)' }}>Student Registration</div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-10) var(--space-6)' }}>
        <StepProgress current={step} />

        {tokenError && (
          <div style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4) var(--space-5)', background: 'var(--status-urgent-bg)', border: '1px solid var(--status-urgent-border)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--status-urgent)' }}>
            {tokenError}
          </div>
        )}
        {!!orgName && !tokenError && (
          <div style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4) var(--space-5)', background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Registering for <span style={{ fontWeight: 800, color: 'var(--text)' }}>{orgName}</span>
          </div>
        )}

        <div className="card" style={{ padding: 'var(--space-8)' }}>
          {step === 1 && <Step1 data={bio} onChange={handleBioChange} errors={errors} />}
          {step === 2 && <Step2 data={questionnaire} onChange={handleQuestionnaireChange} />}
          {step === 3 && <Step3 data={parent} onChange={handleParentChange} errors={errors} />}
          {step === 4 && <Step4AccountSetup studentEmail={studentEmail} parentEmail={parent.parent_email || ''} passwords={passwords} onChange={(field, val) => { setPasswords(p => ({ ...p, [field]: val })); setPwErrors(p => ({ ...p, [field]: undefined })); }} errors={pwErrors} />}
          {step === 5 && <Step5 bio={bio} parent={parent} onSignature={setSignature} onVoice={setVoice} />}

          <hr className="divider" />

          {stepError && (
            <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--status-urgent-bg)', border: '1px solid var(--status-urgent-border)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--status-urgent)', marginBottom: 'var(--space-4)' }}>
              {stepError}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              className="btn btn-ghost"
              onClick={() => {
                const prev = step - 1;
                persist({ step: prev });
                setStep(prev);
                setErrors({});
                setStepError('');
              }}
              disabled={step === 1}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              Back
            </button>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Step {step} of 5
            </div>

            <button className="btn btn-primary" onClick={handleNext} disabled={submitting}>
              {submitting ? (
                <>
                  <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Submitting...
                </>
              ) : step === 5 ? 'Complete Registration' : (
                <>
                  Continue
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
