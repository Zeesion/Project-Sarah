export function handleGeminiError(errorCode = '', errorMessage = '', errorDetails = []) {
  const logPrefix = '[Sarah:GeminiAPI]';
  const error = tryParseError(errorMessage);
  const status = error?.status || errorCode || 'UNKNOWN';
  const code = error?.code?.toString() || errorCode || 'NO_CODE';
  const message = error?.message || errorMessage || 'No error message';

  console.warn(`${logPrefix} ❌ Status: ${status}`);
  console.warn(`${logPrefix} 🧠 Code: ${code}`);

  const userHints = {
    INVALID_ARGUMENT: 'Request-nya ada yang salah.',
    FAILED_PRECONDITION: 'Billing belum aktif atau wilayah belum didukung.',
    PERMISSION_DENIED: 'API key gak punya izin akses.',
    NOT_FOUND: 'Data atau file gak ketemu.',
    RESOURCE_EXHAUSTED: 'Tunggu cooldown atau ganti model.',
    INTERNAL: 'Request kepanjangan, coba pisah jadi beberapa bagian.',
    UNAVAILABLE: `Model lagi overload, silakan coba lagi nanti.`,
  };

  return {
    userMessage:
      `⚠️ ${userHints[status]}\n🛠️ Kamu bisa coba command: \`/model\``,
  };
}

function tryParseError(msg = '') {
  try {
    const parsed = JSON.parse(msg);
    const err = parsed?.error;
    return err
      ? {
          status: err.status || null,
          code: err.code || null,
          message: err.message || null,
        }
      : null;
  } catch {
    return null;
  }
}