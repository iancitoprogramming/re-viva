// Catálogo de suplementos y elementos base — Re-Viva
//
// La justificación de cada decisión está en content/suplementos/research.md.
// Este archivo es solo datos: el motor de elección (quiz de 10 preguntas) los
// consume, no define criterio propio.
//
// REGLA CERRADA: los péptidos (BPC-157, TB-500 y cualquier otro) no entran
// acá, ni en nivel 3. No están aprobados por ANMAT ni FDA, WADA los prohíbe,
// y recomendarlos excede el alcance profesional de un entrenador.

export type NivelEvidencia = 1 | 2 | 3
export type Objetivo = 'VOLUMEN' | 'DEFINICION' | 'RECOMPOSICION'

export type Fuente = { titulo: string; url: string }

export type Suplemento = {
  id: string
  nombre: string
  nivel: 1 | 2
  /** Una línea, sin promesas infladas. Es el texto que ve el cliente. */
  claim: string
  dosis: string
  timing: string
  /** Qué tan fuerte es la evidencia, dicho sin maquillar. */
  evidencia: string
  fuentes: Fuente[]
  /** Vacío = aplica a todos los objetivos. */
  objetivos: Objetivo[]
  /** 1 = lo primero que se recomienda cuando el presupuesto es limitado. */
  prioridad: number
  advertencias: string[]
  /** Disponibles en el mercado argentino. NO son marcas auditadas por nosotros. */
  marcasAR: string[]
  /** Pendiente: Ian tiene que pasar los links. */
  afiliado: string | null
}

export type ElementoBase = Omit<Suplemento, 'nivel' | 'dosis' | 'timing' | 'evidencia' | 'fuentes' | 'objetivos' | 'advertencias' | 'marcasAR'> & {
  /** Por qué importa en el sistema de Re-Viva, no en abstracto. */
  porQue: string
}

export type Descartado = {
  id: string
  nombre: string
  nivel: 3
  /** Lo que promete el marketing. */
  promesa: string
  /** Por qué no lo recomendamos. Esto es contenido, no una nota interna. */
  porQueNo: string
  fuentes: Fuente[]
}

// ─── NIVEL 1 — respaldo sólido ───────────────────────────────────────────────

export const SUPLEMENTOS: Suplemento[] = [
  {
    id: 'creatina',
    nombre: 'Creatina monohidrato',
    nivel: 1,
    claim: 'Lo más costo-efectivo que existe. Si vas a comprar una sola cosa, es esta.',
    dosis: '3 a 5 g por día, todos los días. La carga es opcional.',
    timing: 'Indistinto. Lo que importa es la constancia, no la hora.',
    evidencia:
      'Position stand de la ISSN: eficacia y seguridad respaldadas, con ensayos de hasta 30 g/día durante 5 años. La EFSA considera segura la toma diaria de 3 g en adultos sanos.',
    fuentes: [
      {
        titulo: 'ISSN position stand — creatina (Kreider et al., 2017)',
        url: 'https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0173-z',
      },
    ],
    objetivos: ['VOLUMEN', 'DEFINICION', 'RECOMPOSICION'],
    prioridad: 1,
    advertencias: [
      'Comprá monohidrato. Las versiones HCL o kre-alkalyn cuestan más y no mostraron ser mejores.',
      'El aumento de peso de la primera semana es agua dentro del músculo, no grasa.',
      'Enfermedad renal o hepática, medicación crónica o menores de edad: consultá antes con un médico.',
    ],
    marcasAR: ['ENA', 'Star Nutrition', 'Gentech', 'Xtrenght'],
    afiliado: null,
  },
  {
    id: 'whey',
    nombre: 'Proteína de suero (whey)',
    nivel: 1,
    claim: 'No es magia: es comida práctica para llegar a tu proteína del día.',
    dosis: 'La que te falte para llegar al objetivo diario (1.4 a 2.0 g/kg, más en déficit).',
    timing: 'Cuando te convenga. La ventana anabólica de 30 minutos no existe como se vendió.',
    evidencia:
      'Sólida, pero apunta al total de proteína del día, no al polvo. Si ya llegás comiendo, no necesitás whey.',
    fuentes: [
      {
        titulo: 'ISSN position stand — proteína y ejercicio (Jäger et al., 2017)',
        url: 'https://doi.org/10.1186/s12970-017-0177-8',
      },
    ],
    objetivos: ['VOLUMEN', 'DEFINICION', 'RECOMPOSICION'],
    prioridad: 2,
    advertencias: ['Si sos intolerante a la lactosa, aislado en vez de concentrado.'],
    marcasAR: ['ENA', 'Star Nutrition', 'Gentech'],
    afiliado: null,
  },
  {
    id: 'cafeina',
    nombre: 'Cafeína',
    nivel: 1,
    claim: 'De los ergogénicos mejor documentados. Y el café alcanza.',
    dosis: '3 a 6 mg por kg de peso. Más de 9 mg/kg trae efectos adversos sin beneficio extra.',
    timing: 'Lo habitual es 60 minutos antes. Depende de la fuente: una goma de mascar actúa más rápido que una cápsula.',
    evidencia: 'ISSN 2021. Ganancias de rendimiento consistentes en el rango de 3 a 6 mg/kg.',
    fuentes: [
      {
        titulo: 'ISSN position stand — cafeína (Guest et al., 2021)',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7777221/',
      },
    ],
    objetivos: ['VOLUMEN', 'DEFINICION', 'RECOMPOSICION'],
    prioridad: 4,
    advertencias: [
      'Si entrenás de noche, no. La vida media es de unas 5 horas: arruinar el sueño por un 2% de rendimiento es mal negocio.',
      'No hace falta comprar cápsulas. El café sirve.',
    ],
    marcasAR: [],
    afiliado: null,
  },
  {
    id: 'vitamina-d',
    nombre: 'Vitamina D',
    nivel: 1,
    claim: 'El déficit es muy común en quien trabaja puertas adentro y entrena en gimnasio.',
    dosis: 'Depende de tu valor en sangre. No se suplementa a ciegas.',
    timing: 'Con una comida que tenga grasa.',
    evidencia: 'Sólida para corregir déficit. Sin déficit, el beneficio no está demostrado.',
    fuentes: [],
    objetivos: ['VOLUMEN', 'DEFINICION', 'RECOMPOSICION'],
    prioridad: 5,
    advertencias: [
      'Primero medí 25(OH)D. Si está baja, que la dosis la indique un profesional: es liposoluble y se acumula.',
    ],
    marcasAR: [],
    afiliado: null,
  },
  {
    id: 'omega-3',
    nombre: 'Omega-3 (EPA + DHA)',
    nivel: 1,
    claim: 'Para quien no come pescado graso dos veces por semana. O sea, casi todos.',
    dosis: '1 a 2 g por día de EPA + DHA combinados.',
    timing: 'Con comida.',
    evidencia: 'Sólida en salud cardiovascular y perfil inflamatorio. Modesta en rendimiento.',
    fuentes: [],
    objetivos: ['VOLUMEN', 'DEFINICION', 'RECOMPOSICION'],
    prioridad: 6,
    advertencias: [
      'Mirá los gramos de EPA + DHA, no los gramos totales de aceite del pote: muchos productos tienen bastante menos de lo que aparentan.',
    ],
    marcasAR: [],
    afiliado: null,
  },

  // ─── NIVEL 2 — contextual ──────────────────────────────────────────────────

  {
    id: 'colageno',
    nombre: 'Colágeno hidrolizado + vitamina C',
    nivel: 2,
    claim: 'Barato, sin contraindicaciones, y con evidencia preliminar en tejido conectivo.',
    dosis: '15 g de colágeno + unos 50 mg de vitamina C.',
    timing: '30 a 60 minutos antes de entrenar.',
    evidencia:
      'Preliminar, y conviene decirlo: el estudio de referencia (Shaw 2017) fue con 8 hombres, usó gelatina y midió un marcador en sangre más ligamentos cultivados en laboratorio. No midió tendones humanos. El mecanismo es plausible y no tiene contra, pero no es evidencia fuerte.',
    fuentes: [
      {
        titulo: 'Shaw et al. 2017 — gelatina + vitamina C y síntesis de colágeno',
        url: 'https://pubmed.ncbi.nlm.nih.gov/27852613/',
      },
    ],
    objetivos: ['VOLUMEN', 'DEFINICION', 'RECOMPOSICION'],
    prioridad: 7,
    advertencias: [
      'La carga progresiva bien dosificada es el tratamiento. Esto es el accesorio.',
    ],
    marcasAR: [],
    afiliado: null,
  },
  {
    id: 'magnesio',
    nombre: 'Magnesio',
    nivel: 2,
    claim: 'Sirve si tu dieta es pobre en verduras de hoja, frutos secos y legumbres.',
    dosis: '200 a 400 mg por día, en citrato o bisglicinato.',
    timing: 'A la noche.',
    evidencia:
      'Sólida para corregir una ingesta baja. Débil para lo que promete el marketing — dormir mejor, menos calambres — en gente que ya tiene suficiente.',
    fuentes: [],
    objetivos: ['VOLUMEN', 'DEFINICION', 'RECOMPOSICION'],
    prioridad: 8,
    advertencias: ['Evitá el óxido de magnesio: se absorbe mal y suele dar efecto laxante.'],
    marcasAR: [],
    afiliado: null,
  },
  {
    id: 'electrolitos',
    nombre: 'Electrolitos',
    nivel: 2,
    claim: 'Solo para sesiones largas, calor, o si sudás mucho.',
    dosis: 'Según la bebida y la duración de la sesión.',
    timing: 'Durante el entrenamiento.',
    evidencia: 'Sólida en ese contexto. Irrelevante fuera de él.',
    fuentes: [],
    objetivos: ['VOLUMEN', 'DEFINICION', 'RECOMPOSICION'],
    prioridad: 9,
    advertencias: ['Una hora de pesas con aire acondicionado no necesita electrolitos.'],
    marcasAR: [],
    afiliado: null,
  },
  {
    id: 'beta-alanina',
    nombre: 'Beta-alanina',
    nivel: 2,
    claim: 'Buen suplemento, pero para esfuerzos sostenidos de 1 a 4 minutos.',
    dosis: '3.2 a 6.4 g por día repartidos en varias tomas, durante 4 semanas o más.',
    timing: 'Indistinto: funciona por saturación, no por toma puntual.',
    evidencia: 'Sólida en su rango de esfuerzo. Fuera de ese rango, poco aplicable.',
    fuentes: [],
    objetivos: ['VOLUMEN', 'RECOMPOSICION'],
    prioridad: 10,
    advertencias: [
      'El hormigueo en cara y manos es esperable e inofensivo.',
      'No sirve tomarla solo el día que entrenás.',
    ],
    marcasAR: [],
    afiliado: null,
  },
]

// ─── Elementos base — van antes que cualquier suplemento ─────────────────────

export const ELEMENTOS_BASE: ElementoBase[] = [
  {
    id: 'balanza-cocina',
    nombre: 'Balanza de cocina',
    claim: 'Lo primero. Antes que cualquier suplemento.',
    porQue:
      'Los planes de Re-Viva trabajan con gramajes exactos, no con medidas caseras. Sin balanza, el plan es una estimación.',
    prioridad: 1,
    afiliado: null,
  },
  {
    id: 'balanza-personal',
    nombre: 'Balanza personal',
    claim: 'Para seguir el progreso con datos, no con sensaciones.',
    porQue: 'Lo que sirve es la tendencia semanal, no el número de un día suelto.',
    prioridad: 2,
    afiliado: null,
  },
  {
    id: 'cinta-metrica',
    nombre: 'Cinta métrica',
    claim: 'Cuando la balanza no se mueve pero el cuerpo sí.',
    porQue: 'Es la medición que más importa en recomposición corporal.',
    prioridad: 3,
    afiliado: null,
  },
  {
    id: 'shaker',
    nombre: 'Shaker',
    claim: 'Logística pura.',
    porQue: 'Sin shaker, el batido se toma menos. Así de simple.',
    prioridad: 4,
    afiliado: null,
  },
  {
    id: 'botella',
    nombre: 'Botella',
    claim: 'Hidratación y recordatorio visible.',
    porQue: 'Tener el agua a la vista es la forma más barata de tomar más agua.',
    prioridad: 5,
    afiliado: null,
  },
]

// ─── Nivel 3 — lo que no recomendamos (contenido educativo) ──────────────────

export const DESCARTADOS: Descartado[] = [
  {
    id: 'bcaa',
    nombre: 'BCAA',
    nivel: 3,
    promesa: 'Más músculo y mejor recuperación.',
    porQueNo:
      'Los aminoácidos aislados estimulan la síntesis proteica menos que la proteína completa: tras entrenar, el aumento con BCAA fue cerca de un 50% menor que con whey que aportaba la misma cantidad. Agregarlos sobre una dosis suficiente de proteína no suma nada. Si llegás a tu proteína diaria, es plata tirada — puesta en creatina rinde muchísimo más.',
    fuentes: [
      {
        titulo: 'Metaanálisis BCAA y recuperación (Eur J Nutr, 2021)',
        url: 'https://link.springer.com/article/10.1007/s00394-021-02710-0',
      },
    ],
  },
  {
    id: 'glutamina',
    nombre: 'Glutamina',
    nivel: 3,
    promesa: 'Recuperación e inmunidad.',
    porQueNo:
      'La evidencia buena está en pacientes críticos y postquirúrgicos, no en personas sanas que entrenan. En deportistas no hay respaldo suficiente para las promesas de inmunidad ni de anabolismo.',
    fuentes: [
      { titulo: 'Cochrane — glutamina en pacientes críticos', url: 'https://www.cochrane.org/CD010050' },
    ],
  },
  {
    id: 'tribulus',
    nombre: 'Tribulus terrestris y potenciadores de testosterona',
    nivel: 3,
    promesa: 'Sube la testosterona.',
    porQueNo:
      'No la sube. Una revisión sistemática de 2014 lo declaró inefectivo en humanos y calificó las afirmaciones de marketing como no sustentadas. Una revisión de 2025 sobre 483 hombres encontró que 8 de 10 estudios no mostraron cambios androgénicos significativos, y un metaanálisis del mismo año no halló diferencia en testosterona total.',
    fuentes: [
      { titulo: 'Revisión sistemática Tribulus (2014)', url: 'https://pubmed.ncbi.nlm.nih.gov/24559105/' },
      {
        titulo: 'Revisión sistemática Tribulus (2025)',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11990417/',
      },
    ],
  },
  {
    id: 'l-carnitina',
    nombre: 'L-carnitina y quemadores de grasa',
    nivel: 3,
    promesa: 'Quema grasa.',
    porQueNo:
      'No la quema. Un metaanálisis de 43 ensayos encontró bajas de peso e IMC pero sin cambio en el porcentaje de grasa corporal ni en la cintura, y solo en personas con sobrepeso y siempre acompañado de cambios de estilo de vida. Lo que quema grasa es el déficit calórico.',
    fuentes: [
      { titulo: 'Metaanálisis L-carnitina, 43 ECA (2020)', url: 'https://pubmed.ncbi.nlm.nih.gov/31743774/' },
      { titulo: 'Examine — L-carnitina', url: 'https://examine.com/supplements/l-carnitine/' },
    ],
  },
]

// ─── Reglas duras del motor ──────────────────────────────────────────────────

export const REGLAS = {
  /** Sin balanza de cocina, es la recomendación número 1. Antes que todo. */
  balanzaPrimero: true,
  /** Vida media ~5 h: si entrena de noche, no se recomienda cafeína. */
  bloquearCafeinaEntrenamientoNocturno: true,
  /** Lesión sin gestión médica: no se recomienda nada, se deriva a consulta. */
  lesionSinGestionMedicaDerivar: true,
  /** Suplementos que la rama de tejido conectivo habilita, si ya hay gestión médica. */
  tejidoConectivo: ['colageno', 'omega-3', 'creatina', 'whey', 'vitamina-d'],
  /** Mensaje obligatorio de esa rama. */
  mensajeTejidoConectivo:
    'La carga progresiva bien dosificada es el tratamiento. El suplemento es el accesorio.',
  /** Todo producto publicado tiene que tener RNPA vigente y verificable en el rótulo. */
  exigirRNPA: true,
} as const
