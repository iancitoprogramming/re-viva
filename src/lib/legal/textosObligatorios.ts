export const TEXTOS_LEGALES = {

  disclaimerProfesional: `
AVISO IMPORTANTE — LEER ANTES DE INICIAR

El presente plan de entrenamiento y/o nutrición ha sido elaborado por
Igztrainer (en adelante "el Trainer") en el marco de su actividad como
entrenador personal y preparador físico. El Trainer declara expresamente
que NO es médico, nutricionista matriculado, kinesiólogo, ni profesional
de la salud habilitado por autoridad sanitaria argentina.

Su formación y experiencia provienen de estudio continuo en ciencias del
ejercicio, nutrición deportiva y literatura científica actualizada. El
contenido de este plan es de carácter EDUCATIVO y orientativo, basado en
evidencia científica vigente al momento de su elaboración, y NO constituye
en ningún caso diagnóstico, tratamiento médico ni prescripción nutricional
profesional.

Antes de iniciar cualquier programa de ejercicio o modificación
nutricional, el destinatario debe haber consultado con un profesional de
la salud matriculado que haya evaluado su aptitud física, estado clínico
y eventuales contraindicaciones. La ejecución de este plan queda bajo
exclusiva responsabilidad del destinatario.
  `.trim(),

  descargoResponsabilidad: `
DESCARGO DE RESPONSABILIDAD

Al utilizar este plan, el destinatario reconoce y acepta que:

1. Ha declarado con veracidad sus datos personales, antropométricos,
   médicos, lesiones, medicación y hábitos al momento de contratar el
   servicio. Cualquier omisión o falsedad en esa declaración libera al
   Trainer de toda responsabilidad.

2. Ha consultado con un profesional de la salud matriculado antes de
   iniciar este plan y cuenta con aptitud física para realizarlo.

3. El ejercicio físico conlleva riesgos inherentes (lesiones musculares,
   articulares, óseas, cardiovasculares, entre otros). El destinatario
   asume dichos riesgos de forma voluntaria e informada.

4. Si durante la ejecución del plan experimenta dolor agudo, mareos,
   dificultad respiratoria, palpitaciones, náuseas, pérdida de conciencia
   o cualquier síntoma inusual, debe DETENER INMEDIATAMENTE la actividad
   y consultar con un profesional de la salud.

5. Este plan es personal e intransferible. Su aplicación a terceros o la
   modificación por cuenta propia de sus parámetros (cargas, volúmenes,
   dosis nutricionales) queda fuera del alcance de la responsabilidad del
   Trainer.

6. El Trainer no se responsabiliza por resultados que dependan de factores
   fuera de su control: adherencia del destinatario, condiciones de salud
   no declaradas, genética, descanso, estrés, uso concomitante de
   sustancias o medicamentos.
  `.trim(),

  disclaimerNutricional: `
NOTA SOBRE EL PLAN NUTRICIONAL

Las cantidades, macronutrientes y estrategias calóricas sugeridas son
orientativas, calculadas sobre los datos declarados por el destinatario.
No reemplazan la evaluación de un médico ni de un licenciado en nutrición
matriculado, quienes son los únicos profesionales habilitados por la
legislación argentina para prescribir planes alimentarios con fines
terapéuticos o clínicos.

Si el destinatario presenta condiciones clínicas (diabetes, patologías
tiroideas, renales, hepáticas, gastrointestinales, cardiovasculares,
trastornos de la conducta alimentaria, embarazo, lactancia, entre otras),
debe consultar obligatoriamente con un profesional de la salud antes de
aplicar cualquier parte de este plan.

La suplementación nutricional mencionada está respaldada por evidencia
científica, pero su uso debe ser consultado con un profesional antes de
iniciar, especialmente si el destinatario toma medicación.
  `.trim(),

  propiedadIntelectual: `
PROPIEDAD INTELECTUAL Y USO

Este documento es propiedad intelectual de Re-Viva. Queda
prohibida su reproducción, distribución, publicación o comercialización,
total o parcial, sin autorización expresa y por escrito del titular.

La licencia de uso es personal e intransferible para el destinatario
nominado en el encabezado del plan.
  `.trim(),

  proteccionDatosTemplate: `
TRATAMIENTO DE DATOS PERSONALES

Los datos personales proporcionados por el destinatario son tratados
conforme a la Ley 25.326 de Protección de los Datos Personales de la
República Argentina. El titular de los datos tiene derecho a solicitar
acceso, rectificación, actualización o supresión escribiendo a
[EMAIL_DE_CONTACTO_REVIVA].

Los datos se utilizan exclusivamente para la elaboración, seguimiento y
mejora del plan personal. No se comparten con terceros salvo obligación
legal o consentimiento expreso del titular.
  `.trim(),

  bloqueoSinConsultaMedica: `
No podemos generar tu plan todavía.

Para elaborar tu programa personalizado necesitamos que hayas consultado
previamente con un profesional de la salud matriculado (médico clínico,
cardiólogo, traumatólogo o especialista relevante según tu situación)
que confirme tu aptitud física.

Este es un paso obligatorio, no una formalidad: nos permite trabajar con
seguridad sobre una base médica real y que vos arranques tu proceso sin
riesgos evitables.

Una vez que tengas esa consulta realizada, confirmalo en tu perfil y
generamos tu plan en 24-48hs.
  `.trim(),

  pieDePagina: `Re-Viva · Igztrainer · Plan personal e intransferible · No reemplaza consulta médica profesional`,
};

export function getProteccionDatos(contactEmail?: string): string {
  const email =
    contactEmail ||
    process.env.REVIVA_CONTACT_EMAIL ||
    'contacto@igztrainer.com';
  return TEXTOS_LEGALES.proteccionDatosTemplate.replace(
    '[EMAIL_DE_CONTACTO_REVIVA]',
    email,
  );
}

export const TODOS_LOS_BLOQUES_REQUERIDOS = [
  'disclaimerProfesional',
  'disclaimerNutricional',
  'descargoResponsabilidad',
  'propiedadIntelectual',
  'proteccionDatosTemplate',
  'pieDePagina',
] as const;

export type BloqueLegal = (typeof TODOS_LOS_BLOQUES_REQUERIDOS)[number];
