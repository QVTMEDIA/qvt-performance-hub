'use client';

import { useState } from 'react';
import { Review } from '@/types';
import { AppContext } from '@/components/AppShell';
import { C } from '@/styles/brand';
import { PERIODS } from '@/lib/constants';
import { uid, today } from '@/lib/utils';
import { useTheme } from '@/lib/ThemeContext';
import Inp from '@/components/atoms/Inp';
import Sel from '@/components/atoms/Sel';

const PERIOD_OPTIONS = PERIODS.map(p => ({ v: p, l: p }));

const WORKFLOW_STAGES = [
  { n: '1', label: 'Employee Self-Review',     desc: 'Employee rates behavioral & functional competencies' },
  { n: '2', label: 'Team Lead Assessment',     desc: 'Lead reviews and assigns agreed scores' },
  { n: '3', label: 'People Lead (HR) Review',  desc: 'HR adds development notes and remarks' },
  { n: '4', label: 'COO Approval',             desc: 'COO reviews alignment and approves or returns' },
  { n: '5', label: 'CEO Final Decision',       desc: 'CEO gives final approval or returns for revision' },
];

interface NewReviewProps {
  ctx: AppContext;
}

export default function NewReview({ ctx }: NewReviewProps) {
  const { theme } = useTheme();
  const [formName,       setFormName]       = useState('');
  const [formTitle,      setFormTitle]      = useState('');
  const [formDept,       setFormDept]       = useState('');
  const [formSupervisor, setFormSupervisor] = useState('');
  const [formResumption, setFormResumption] = useState('');
  const [formPeriod,     setFormPeriod]     = useState('Q1 2026');

  function handleCreate() {
    const name = formName.trim();
    if (!name) {
      ctx.showToast('Employee Full Name is required', 'error');
      return;
    }

    const newRev: Review = {
      id:             uid(),
      createdAt:      today(),
      status:         'draft',
      employeeName:   name,
      jobTitle:       formTitle.trim(),
      department:     formDept.trim(),
      supervisorName: formSupervisor.trim(),
      resumptionDate: formResumption,
      period:         formPeriod,
      selfReview:     null,
      leadReview:     null,
      hrReview:       null,
      cooReview:      null,
      ceoReview:      null,
    };

    ctx.saveReviews([newRev, ...ctx.reviews]);
    ctx.openReview(newRev);
    ctx.showToast(`Appraisal created for ${name}.`, 'success');
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        padding: '20px 32px 16px',
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <button
          onClick={() => ctx.setView('dashboard')}
          style={{
            background:   'transparent',
            border:       `1px solid ${theme.border}`,
            borderRadius: 6,
            color:        theme.textMuted,
            fontSize:     12,
            fontWeight:   700,
            cursor:       'pointer',
            padding:      '7px 14px',
            fontFamily:   'Montserrat, sans-serif',
          }}
        >
          ← Back
        </button>
        <div>
          <h1 style={{
            color:         theme.textPrimary,
            fontSize:      20,
            fontWeight:    800,
            letterSpacing: '-0.01em',
            margin:        0,
            fontFamily:    'Montserrat, sans-serif',
          }}>
            New Performance Appraisal
          </h1>
          <p style={{ color: theme.textMuted, fontSize: 12, fontWeight: 500, margin: '4px 0 0', fontFamily: 'Montserrat, sans-serif' }}>
            Create a new appraisal record for an employee
          </p>
        </div>
      </div>

      <div style={{ padding: '32px', maxWidth: 640 }}>

        {/* Form card */}
        <div style={{
          background:   theme.card,
          border:       `1px solid ${theme.border}`,
          borderRadius: 12,
          padding:      24,
          marginBottom: 20,
        }}>
          <div style={{
            color:         theme.textDim,
            fontSize:      10,
            fontWeight:    700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom:  18,
            fontFamily:    'Montserrat, sans-serif',
          }}>
            Employee Details
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Inp
              label="Employee Full Name *"
              value={formName}
              onChange={setFormName}
              placeholder="e.g. Jane Okafor"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp
                label="Job Title"
                value={formTitle}
                onChange={setFormTitle}
                placeholder="e.g. Digital Marketing Analyst"
              />
              <Inp
                label="Department"
                value={formDept}
                onChange={setFormDept}
                placeholder="e.g. Performance"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp
                label="Supervisor Name"
                value={formSupervisor}
                onChange={setFormSupervisor}
                placeholder="e.g. Tunde Obi"
              />
              <Inp
                label="Date of Resumption"
                value={formResumption}
                onChange={setFormResumption}
                type="date"
              />
            </div>

            <Sel
              label="Review Period"
              value={formPeriod}
              onChange={setFormPeriod}
              options={PERIOD_OPTIONS}
            />
          </div>
        </div>

        {/* Workflow info card */}
        <div style={{
          background:   '#0b73a810',
          border:       '1px solid #0b73a830',
          borderRadius: 12,
          padding:      20,
          marginBottom: 24,
        }}>
          <div style={{
            color:         '#0b73a8',
            fontSize:      10,
            fontWeight:    700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom:  14,
            fontFamily:    'Montserrat, sans-serif',
          }}>
            ℹ 5-Stage Appraisal Workflow
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {WORKFLOW_STAGES.map(s => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width:           22,
                  height:          22,
                  borderRadius:    '50%',
                  background:      '#0b73a820',
                  border:          '1px solid #0b73a840',
                  color:           '#0b73a8',
                  fontSize:        10,
                  fontWeight:      800,
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  flexShrink:      0,
                  fontFamily:      'Montserrat, sans-serif',
                }}>
                  {s.n}
                </div>
                <div>
                  <div style={{ color: theme.textSecondary, fontSize: 12, fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
                    {s.label}
                  </div>
                  <div style={{ color: theme.textDim, fontSize: 11, fontWeight: 500, fontFamily: 'Montserrat, sans-serif', marginTop: 1 }}>
                    {s.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleCreate}
          style={{
            width:         '100%',
            background:    '#22c55e',
            color:         '#fff',
            border:        'none',
            borderRadius:  8,
            padding:       '13px 0',
            fontSize:      13,
            fontWeight:    800,
            cursor:        'pointer',
            fontFamily:    'Montserrat, sans-serif',
            letterSpacing: '0.04em',
          }}
        >
          Create Appraisal & Begin →
        </button>
      </div>
    </div>
  );
}
