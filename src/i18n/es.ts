export const es = {
  app: {
    title: "SPEI Share",
  },
  brand: {
    wordmark: "SPEI · share",
  },
  footer: {
    privacy: "Tus datos viajan dentro del enlace, nunca en un servidor.",
  },
  home: {
    eyebrow: "Transferencias SPEI",
    heading: "Comparte tus datos SPEI",
    headingEmphasis: "SPEI",
    subheading:
      "Crea un enlace para que te transfieran sin errores. Tus datos no se guardan en ningún servidor.",
  },
  form: {
    beneficiaryName: { label: "Nombre del beneficiario" },
    clabe: {
      label: "CLABE interbancaria",
      placeholder: "18 dígitos",
      detectedBank: "Banco: {bankName}",
      unknownBank: "Banco no identificado",
    },
    destinationType: {
      label: "Tipo de destino",
      clabe: "CLABE",
      card: "Tarjeta de débito",
      account: "Número de cuenta",
    },
    card: { label: "Número de tarjeta", placeholder: "16 dígitos" },
    account: { label: "Número de cuenta", placeholder: "10 u 11 dígitos" },
    bankName: { label: "Banco" },
    optional: { heading: "Datos opcionales" },
    concept: { label: "Concepto" },
    amount: { label: "Monto (MXN)" },
    rfc: { label: "RFC" },
    email: { label: "Correo electrónico" },
    submit: "Generar enlace",
    generatedLink: { label: "Tu enlace para compartir" },
    draft: {
      restored: "Recuperamos tus últimos datos",
      clear: "Borrar datos guardados",
    },
  },
  errors: {
    required: "Este campo es obligatorio",
    nonNumeric: "Solo se permiten números",
    clabe: {
      length: "La CLABE debe tener 18 dígitos",
      nonNumeric: "La CLABE solo puede contener números",
      checkDigit: "La CLABE no es válida, revisa el dígito verificador",
    },
    card: {
      length: "La tarjeta debe tener 16 dígitos",
      checksum: "El número de tarjeta no es válido",
    },
    account: {
      length: "La cuenta debe tener 10 u 11 dígitos",
    },
    concept: { tooLong: "El concepto no puede superar 40 caracteres" },
    amount: { invalid: "Ingresa un monto mayor a 0 con máximo 2 decimales" },
    rfc: { invalid: "RFC inválido" },
    email: { invalid: "Correo electrónico inválido" },
  },
  view: {
    heading: "Datos para transferencia",
    receipt: {
      eyebrow: "Comprobante para transferir",
      verify: "Verifica el nombre del beneficiario antes de enviar.",
    },
    invalidLink: "Este enlace no es válido o está incompleto.",
    createOwn: "Crear mi propio enlace",
    beneficiaryName: { label: "Beneficiario" },
    clabe: { label: "CLABE" },
    bank: { label: "Banco" },
    card: { label: "Tarjeta" },
    account: { label: "Cuenta" },
    concept: { label: "Concepto" },
    amount: { label: "Monto" },
    rfc: { label: "RFC" },
    email: { label: "Correo" },
  },
  copy: {
    action: "Copiar",
    done: "¡Copiado!",
  },
  share: {
    heading: "Compartir",
    copyAll: "Copiar todo",
    copyLink: "Copiar enlace",
    native: "Compartir",
    qr: {
      alt: "Código QR con el enlace a tus datos SPEI",
      download: "Descargar QR",
    },
    text: { title: "Datos para transferencia SPEI" },
    copiedFallback: "Tu dispositivo no permite compartir, copiamos los datos al portapapeles",
  },
} as const;
