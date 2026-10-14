export const es = {
  app: {
    title: "SPEI Share",
  },
  home: {
    heading: "Comparte tus datos SPEI",
    subheading:
      "Crea un enlace para que te transfieran sin errores. Tus datos no se guardan en ningún servidor.",
  },
  form: {
    beneficiaryName: { label: "Nombre del beneficiario" },
    clabe: { label: "CLABE interbancaria", placeholder: "18 dígitos" },
    submit: "Generar enlace",
    generatedLink: { label: "Tu enlace para compartir" },
  },
  errors: {
    required: "Este campo es obligatorio",
    clabe: {
      length: "La CLABE debe tener 18 dígitos",
      nonNumeric: "La CLABE solo puede contener números",
    },
  },
  view: {
    heading: "Datos para transferencia",
    invalidLink: "Este enlace no es válido o está incompleto.",
    createOwn: "Crear mi propio enlace",
    beneficiaryName: { label: "Beneficiario" },
    clabe: { label: "CLABE" },
  },
  copy: {
    action: "Copiar",
    done: "¡Copiado!",
  },
} as const;
