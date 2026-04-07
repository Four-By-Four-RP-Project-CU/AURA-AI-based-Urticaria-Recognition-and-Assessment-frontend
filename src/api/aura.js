/**
 * AURA CSU Backend API client.
 * All requests are relative (handled by the Vite dev-server proxy).
 */

async function _handleResponse(res) {
  if (!res.ok) {
    let body;
    try { body = await res.json(); } catch { body = { detail: res.statusText }; }
    const msg =
      body?.detail?.message ||
      (typeof body?.detail === 'string' ? body.detail : null) ||
      `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return res;
}

/** POST /analyze — returns the full AnalyzeResponse JSON. */
export async function callAnalyze(formData) {
  const res = await _handleResponse(
    await fetch('/analyze', { method: 'POST', body: formData })
  );
  return res.json();
}

/** POST /analyze/from-risk — reuse labs extracted during risk assessment. */
export async function callAnalyzeFromRisk(formData) {
  const res = await _handleResponse(
    await fetch('/analyze/from-risk', { method: 'POST', body: formData })
  );
  return res.json();
}

/** POST /extract/labs — returns { extracted: {CRP,FT4,IgE,VitD,Age,...}, warnings: [] }. */
export async function callExtractLabs(formData) {
  const res = await _handleResponse(
    await fetch('/extract/labs', { method: 'POST', body: formData })
  );
  return res.json();
}

/** POST /report/pdf — returns { blob, filename }. */
export async function callReportPdf(formData) {
  const res = await _handleResponse(
    await fetch('/report/pdf', { method: 'POST', body: formData })
  );
  const blob = await res.blob();
  const cd = res.headers.get('Content-Disposition') || '';
  const match = cd.match(/filename=([^;"'\s]+)/);
  const filename = match ? match[1] : 'AURA_CSU_Report.pdf';
  return { blob, filename };
}

/** POST /report/pdf/from-risk — generate the PDF while reusing risk-step labs. */
export async function callReportPdfFromRisk(formData) {
  const res = await _handleResponse(
    await fetch('/report/pdf/from-risk', { method: 'POST', body: formData })
  );
  const blob = await res.blob();
  const cd = res.headers.get('Content-Disposition') || '';
  const match = cd.match(/filename=([^;"'\s]+)/);
  const filename = match ? match[1] : 'AURA_CSU_Report.pdf';
  return { blob, filename };
}
