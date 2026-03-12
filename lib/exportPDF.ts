import { Review } from '@/types';
import { calcSec, calcOverall, getBand } from '@/lib/scoring';
import { SC_LABELS, BAND_COLORS } from '@/styles/brand';
import { BEHAVIORAL, FUNCTIONAL } from '@/lib/constants';

const QVT_BLUE = '#0b73a8';

function scoreLabel(n: number | undefined): string {
  if (!n) return '—';
  return `${n} – ${SC_LABELS[n] ?? ''}`;
}

function sectionTitle(t: string): string {
  return `<div style="background:${QVT_BLUE};color:#fff;padding:8px 14px;font-size:12px;font-weight:800;letter-spacing:0.04em;border-radius:4px;margin:20px 0 8px;">${t}</div>`;
}

function field(label: string, value: string): string {
  return `<div style="margin-bottom:10px;">
    <div style="font-size:9px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8;margin-bottom:3px;">${label}</div>
    <div style="font-size:12px;color:#1e293b;line-height:1.5;border-left:3px solid ${QVT_BLUE}44;padding-left:8px;">${value || '—'}</div>
  </div>`;
}

function scoreTable(
  comps: typeof BEHAVIORAL,
  selfScores: Record<string, number>,
  leadScores: Record<string, number>,
): string {
  const rows = comps.map(c => {
    const sv = selfScores[c.key];
    const lv = leadScores[c.key];
    return `<tr>
      <td style="padding:6px 8px;font-size:11px;color:#334155;border-bottom:1px solid #e2e8f0;">${c.label}</td>
      <td style="padding:6px 8px;text-align:center;font-size:11px;color:#64748b;border-bottom:1px solid #e2e8f0;">${scoreLabel(sv)}</td>
      <td style="padding:6px 8px;text-align:center;font-size:11px;font-weight:700;color:${QVT_BLUE};border-bottom:1px solid #e2e8f0;">${scoreLabel(lv)}</td>
    </tr>`;
  }).join('');
  return `<table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
    <thead>
      <tr style="background:#f8fafc;">
        <th style="padding:6px 8px;text-align:left;font-size:10px;font-weight:700;letter-spacing:0.06em;color:#64748b;text-transform:uppercase;border-bottom:2px solid #e2e8f0;">Competency</th>
        <th style="padding:6px 8px;text-align:center;font-size:10px;font-weight:700;letter-spacing:0.06em;color:#64748b;text-transform:uppercase;border-bottom:2px solid #e2e8f0;">Self</th>
        <th style="padding:6px 8px;text-align:center;font-size:10px;font-weight:700;letter-spacing:0.06em;color:${QVT_BLUE};text-transform:uppercase;border-bottom:2px solid #e2e8f0;">Agreed</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function buildHTML(rev: Review): string {
  const self = rev.selfReview;
  const lead = rev.leadReview;
  const hr   = rev.hrReview;
  const coo  = rev.cooReview;
  const ceo  = rev.ceoReview;

  const selfBeh = self?.behavioral ?? {};
  const selfFun = self?.functional ?? {};
  const leadBeh = lead?.behavioral ?? {};
  const leadFun = lead?.functional ?? {};
  const agreedBeh = lead ? leadBeh : selfBeh;
  const agreedFun = lead ? leadFun : selfFun;

  const hasBeh = Object.keys(agreedBeh).length > 0;
  const hasFun = Object.keys(agreedFun).length > 0;
  const behPct  = hasBeh ? calcSec(agreedBeh) : 0;
  const funPct  = hasFun ? calcSec(agreedFun) : 0;
  const overall = calcOverall(agreedBeh, agreedFun);
  const band    = getBand(overall);
  const bandColor = BAND_COLORS[band];

  return `
<div id="pdf-export" style="font-family:Montserrat,Arial,sans-serif;max-width:750px;padding:32px;background:#fff;color:#1e293b;">

  <!-- Cover -->
  <div style="border-bottom:3px solid ${QVT_BLUE};padding-bottom:20px;margin-bottom:24px;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <div style="width:44px;height:44px;background:${QVT_BLUE};border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:800;flex-shrink:0;">Q</div>
      <div>
        <div style="font-size:18px;font-weight:800;color:#0f172a;">QVT Media Performance Hub</div>
        <div style="font-size:11px;color:#64748b;letter-spacing:0.04em;text-transform:uppercase;">Performance Appraisal Report</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div style="color:#475569;font-size:12px;"><strong>Employee:</strong> ${rev.employeeName || '—'}</div>
      <div style="color:#475569;font-size:12px;"><strong>Period:</strong> ${rev.period}</div>
      <div style="color:#475569;font-size:12px;"><strong>Job Title:</strong> ${rev.jobTitle || '—'}</div>
      <div style="color:#475569;font-size:12px;"><strong>Department:</strong> ${rev.department || '—'}</div>
      <div style="color:#475569;font-size:12px;"><strong>Supervisor:</strong> ${rev.supervisorName || '—'}</div>
      <div style="color:#475569;font-size:12px;"><strong>Status:</strong> ${rev.status}</div>
    </div>
  </div>

  <!-- Score Summary -->
  ${sectionTitle('Score Summary')}
  <div style="display:flex;gap:12px;margin-bottom:16px;">
    <div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;text-align:center;">
      <div style="font-size:9px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8;margin-bottom:6px;">Overall</div>
      <div style="font-size:28px;font-weight:800;color:${bandColor};line-height:1;">${Math.round(overall)}%</div>
      <div style="font-size:10px;font-weight:700;color:${bandColor};margin-top:4px;">${band}</div>
    </div>
    ${hasBeh ? `<div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;text-align:center;">
      <div style="font-size:9px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8;margin-bottom:6px;">Behavioral</div>
      <div style="font-size:24px;font-weight:800;color:${QVT_BLUE};line-height:1;">${Math.round(behPct)}%</div>
    </div>` : ''}
    ${hasFun ? `<div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;text-align:center;">
      <div style="font-size:9px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8;margin-bottom:6px;">Functional</div>
      <div style="font-size:24px;font-weight:800;color:${QVT_BLUE};line-height:1;">${Math.round(funPct)}%</div>
    </div>` : ''}
  </div>

  ${hasBeh ? sectionTitle('Part I — Behavioral Competencies') + scoreTable(BEHAVIORAL, selfBeh, leadBeh) : ''}
  ${hasFun ? sectionTitle('Part II — Functional Competencies') + scoreTable(FUNCTIONAL, selfFun, leadFun) : ''}

  ${self?.text ? `
  ${sectionTitle('Self Assessment')}
  ${field('Key Accomplishments', self.text.accomplishments)}
  ${field('Challenges Faced', self.text.challenges)}
  ${field('Goals for Next Period', self.text.goals)}
  ` : ''}

  ${lead?.text ? `
  ${sectionTitle('Team Lead Feedback')}
  ${field('Strengths', lead.text.strengths)}
  ${field('Areas for Improvement', lead.text.improvements)}
  ${field('Training Recommendations', lead.text.trainings)}
  ${field('Recommendation', lead.text.recommendation)}
  ` : ''}

  ${hr?.text ? `
  ${sectionTitle('HR Development Plan')}
  ${field('HR Comments', hr.text.hrComments)}
  ${field('Technical Development', hr.text.techDev)}
  ${field('Behavioral Development', hr.text.behDev)}
  ${field('HR Remarks', hr.text.hrRemarks)}
  ` : ''}

  ${coo?.text ? `
  ${sectionTitle('COO Strategic Notes')}
  ${field('Strategic Alignment', coo.text.strategicAlignment)}
  ${field('COO Comments', coo.text.cooComments)}
  ` : ''}

  ${ceo?.text ? `
  ${sectionTitle('CEO Final Decision')}
  ${field('Final Decision', ceo.text.finalDecision)}
  ${field('CEO Notes', ceo.text.ceoNotes)}
  ` : ''}

  <div style="border-top:1px solid #e2e8f0;margin-top:32px;padding-top:16px;font-size:10px;color:#94a3b8;text-align:center;">
    QVT Media Performance Hub · Generated ${new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
  </div>
</div>`;
}

export async function exportAppraisalPDF(rev: Review): Promise<void> {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  const container = document.createElement('div');
  container.innerHTML = buildHTML(rev);
  container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;width:800px;';
  document.body.appendChild(container);

  const el = container.querySelector('#pdf-export') as HTMLElement;

  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW  = pageW;
    const imgH  = (canvas.height * imgW) / canvas.width;

    let yOffset = 0;
    let remaining = imgH;
    while (remaining > 0) {
      if (yOffset > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, -yOffset, imgW, imgH);
      yOffset += pageH;
      remaining -= pageH;
    }

    const safeName = rev.employeeName.replace(/\s+/g, '_');
    pdf.save(`QVT_Appraisal_${safeName}_${rev.period}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
