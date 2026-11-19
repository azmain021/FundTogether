// Opt-in live test: creates two synthetic accounts, one business, document
// fixtures and one submitted application in the configured API/database.
// It intentionally leaves these clearly labelled records available in Atlas.
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');

const base = 'http://127.0.0.1:3000/api';
const tag = `reg-smoke-${Date.now()}`;
const password = randomBytes(24).toString('base64url');

function syntheticPdf(label) {
  const stream = `BT /F1 16 Tf 40 730 Td (${label}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ];
  let document = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((value, index) => {
    offsets.push(Buffer.byteLength(document));
    document += `${index + 1} 0 obj\n${value}\nendobj\n`;
  });
  const start = Buffer.byteLength(document);
  document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  document += offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;
  return Buffer.from(document);
}

async function response(path, { method = 'GET', body, cookie, expected = 200 } = {}) {
  const headers = { Origin: 'http://127.0.0.1:5173' };
  if (cookie) headers.Cookie = cookie;
  const multipart = body instanceof FormData;
  if (body && !multipart) headers['Content-Type'] = 'application/json';
  const result = await fetch(`${base}${path}`, {
    method, headers, body: body ? multipart ? body : JSON.stringify(body) : undefined,
  });
  if (result.status !== expected) {
    const data = await result.json().catch(() => ({}));
    throw new Error(`${method} ${path}: expected ${expected}, received ${result.status}. ${JSON.stringify(data.message ?? data)}`);
  }
  return result;
}

async function json(path, options) {
  const result = await response(path, options);
  if (result.status === 204) return undefined;
  const body = await result.text();
  return body ? JSON.parse(body) : null;
}

async function signIn(email) {
  const result = await response('/auth/login', { method: 'POST', body: { email, password } });
  const cookie = result.headers.getSetCookie().find(value => value.startsWith('fundtogether_session='))?.split(';')[0];
  assert.ok(cookie, 'Login must set the session cookie');
  return cookie;
}

async function upload(id, cookie, type, bytes = syntheticPdf(`SYNTHETIC COURSE FIXTURE - ${type}`), name = `${type}.pdf`, expected = 201) {
  const form = new FormData();
  form.append('type', type);
  form.append('file', new Blob([bytes], { type: 'application/pdf' }), name);
  return json(`/businesses/${id}/documents`, { method: 'POST', cookie, body: form, expected });
}

async function main() {
  await response('/auth/me', { expected: 401 });
  const emails = [`${tag}-owner@example.invalid`, `${tag}-other@example.invalid`];
  for (const email of emails) {
    const account = await json('/auth/register/business-owner', { method: 'POST', expected: 201, body: {
      fullName: 'Synthetic Registration Test Owner', email, phone: '01712345678', password, acceptedTerms: true,
    } });
    assert.equal(account.role, 'business_owner');
    assert.equal(account.passwordHash, undefined);
  }
  console.log('PASS: two synthetic owner accounts registered');
  const cookie = await signIn(emails[0]);
  const otherCookie = await signIn(emails[1]);
  const profile = {
    officialName: `Synthetic Registration Test ${tag}`, businessType: 'sole_proprietorship',
    sector: 'grocery_retail', size: 'micro', establishedYear: 2020, employeeCount: 0,
    division: 'Dhaka', district: 'Dhaka', address: 'Synthetic course fixture address',
    description: 'This is synthetic test data for the business registration workflow.',
    operatingHistory: 'Synthetic course demonstration only.', website: '',
    businessEmail: emails[0], contactPhone: '01712345678',
  };
  const business = await json('/businesses', { method: 'POST', cookie, body: profile, expected: 201 });
  assert.equal((await json('/businesses/me', { cookie }))._id, business._id);
  assert.equal(await json('/businesses/me', { cookie: otherCookie }), null);
  await response('/businesses', { method: 'POST', cookie, body: profile, expected: 409 });
  await response(`/businesses/${business._id}`, { cookie: otherCookie, expected: 403 });
  console.log('PASS: owner-scoped business persistence and duplicate protection');

  await upload(business._id, cookie, 'trade_licence', Buffer.from('MZ executable renamed to PDF'), 'spoof.pdf', 400);
  for (const type of ['trade_licence', 'tax_evidence', 'owner_identity']) await upload(business._id, cookie, type);
  const incomplete = await json(`/businesses/${business._id}/applications`, { method: 'POST', cookie, expected: 422 });
  assert.ok(incomplete.missingDocuments.includes('bank_account_evidence'));
  await upload(business._id, cookie, 'bank_account_evidence');
  const replacement = await upload(business._id, cookie, 'trade_licence', syntheticPdf('SYNTHETIC REPLACEMENT FIXTURE'), 'replacement.pdf');
  assert.equal(replacement.storageKey, undefined);
  const documents = await json(`/businesses/${business._id}/documents`, { cookie });
  assert.equal(documents.filter(document => document.isCurrent).length, 4);
  assert.equal(documents.filter(document => document.status === 'superseded').length, 1);
  await response(`/documents/${replacement._id}/download`, { cookie: otherCookie, expected: 403 });
  const download = await response(`/documents/${replacement._id}/download`, { cookie });
  assert.deepEqual(Buffer.from(await download.arrayBuffer()), syntheticPdf('SYNTHETIC REPLACEMENT FIXTURE'));
  console.log('PASS: file validation, required-document checks, replacement history and private download');

  const application = await json(`/businesses/${business._id}/applications`, { method: 'POST', cookie, expected: 201 });
  const status = await json(`/businesses/${business._id}/applications/current`, { cookie });
  assert.equal(status.application._id, application._id);
  assert.equal(status.application.status, 'submitted');
  assert.equal(status.business.verificationStatus, 'pending');
  await upload(business._id, cookie, 'trade_licence', syntheticPdf('SYNTHETIC LOCK TEST'), 'locked.pdf', 409);
  await response(`/businesses/${business._id}/applications`, { method: 'POST', cookie, expected: 409 });
  console.log('PASS: application transaction, saved status and submission lock');
  await response('/auth/logout', { method: 'POST', cookie, expected: 204 });
  await response('/auth/me', { cookie, expected: 401 });
  await response('/auth/logout', { method: 'POST', cookie: otherCookie, expected: 204 });
  console.log('PASS: logout revokes the session');
  console.log(`Live test complete. Synthetic records retained with prefix: ${tag}`);
  console.log(`Business ID: ${business._id}; application ID: ${application._id}`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
