import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { agruparPorHora, peri } from '../src/lib/peri';
import { formVacio, normalizarIngreso, parsearForm, validarIngreso, type IngresoForm } from '../src/lib/ingreso';
import { construirFicha, type AltaFicha } from '../src/lib/ficha';

// Cliente de ejemplo del prototipo: entrena martes, jueves y sábado a las 11:00;
// desayuna 9:45; almuerza 13:00.
function formEjemplo(): IngresoForm {
  return {
    ...formVacio(),
    nombre: 'Pablo Fernández Fuks',
    email: 'pablo@ejemplo.com',
    whatsapp: '11 4455 6677',
    edad: '37',
    peso: '67.7',
    altura: '178',
    sexo: 'Masculino',
    objetivo: 'Quiero definir, bajar la panza y que se me note más el torso',
    experiencia: 'Tres años, con parates',
    duracion_ciclo: '12 semanas',

    dias: ['Martes', 'Jueves', 'Sábado'],
    horas: { Martes: '11:00', Jueves: '11:00', Sábado: '11:00' },
    comidas: { desayuno: '09:45', colacion_am: null, almuerzo: '13:00', merienda: '17:30', cena: '21:00' },
    sostiene: '4',
    ayunas: 'Después de comer',
    jornada: 'Sí',
    jornada_detalle: 'Miércoles y viernes entro 7am',
    domingo: 'Un rato',

    cae_mal: 'La leche me hincha',
    alergias: 'Ninguna',
    no_gusta: 'Hígado, morrón',
    cocina: 'Sí, cocino sin problema',
    comidas_afuera: 'Almuerzo en el trabajo, hay microondas',
    balanza: 'Sí, tengo',
    fin_de_semana: 'Salgo los viernes, dos o tres cervezas',
    agua: 'Litro y medio',

    lesion: 'Sí',
    lesion_detalle: 'Hernia L4-L5',
    lesion_estado: 'Molestias ocasionales',
    laboratorio: 'Sí, los tengo',
    medicacion: 'Nada',
    sueno: '8',
    estres: 'Alto',
    seguimiento: 'Traumatólogo por la espalda',

    lugar: 'Gimnasio completo',
    equipamiento: 'Gimnasio completo',
    sesiones_con_entrenador: '0',
    sesiones_solo: '3',
    duracion_sesion: '60 min',
    otros_deportes: 'Camino bastante por trabajo',
    ejercicios_evitar: 'Peso muerto convencional, me molesta la lumbar',
    pasos: '9000',

    presupuesto: 'Sí, acotado',
    revision: 'Cada 8 semanas',
    comunicacion: 'WhatsApp, después de las 19',
    intentos_previos: 'Hice un plan solo y lo abandoné el segundo mes',
    fecha_motivadora: 'Vacaciones en enero',
    consentimiento: true,
  };
}

function altaDe(form: IngresoForm): AltaFicha {
  const datos = normalizarIngreso(form);
  return {
    ...datos,
    id: '00000000-0000-0000-0000-000000000000',
    creadoEn: new Date('2026-11-08T12:00:00Z'),
    estado: 'nuevo',
    pesoKg: Number(datos.pesoKg),
    notasInternas: null,
  };
}

describe('peri — derivación peri-entreno', () => {
  it('con el cliente de ejemplo, PRE es el desayuno y POST el almuerzo', () => {
    const comidas = { desayuno: '09:45', colacion_am: null, almuerzo: '13:00', merienda: '17:30', cena: '21:00' };
    const r = peri('11:00', comidas);
    assert.equal(r.pre?.comida, 'desayuno');
    assert.equal(r.pre?.minutos, 75);
    assert.equal(r.post?.comida, 'almuerzo');
    assert.equal(r.post?.minutos, 120);
  });

  it('ignora las comidas marcadas como "no la hago"', () => {
    const r = peri('11:00', { desayuno: null, almuerzo: '13:00' });
    assert.equal(r.pre, null);
    assert.equal(r.post?.comida, 'almuerzo');
  });

  it('deja PRE y POST en null si no hay comida en ventana', () => {
    const r = peri('11:00', { desayuno: '06:00', cena: '21:00' });
    assert.equal(r.pre, null);
    assert.equal(r.post, null);
  });

  it('elige la comida más cercana dentro de la ventana', () => {
    const r = peri('13:00', { desayuno: '09:45', colacion_am: '11:30', almuerzo: '14:00', merienda: '17:30' });
    assert.equal(r.pre?.comida, 'colacion_am');
    assert.equal(r.post?.comida, 'almuerzo');
  });

  it('agrupa los días por hora de entrenamiento', () => {
    const iguales = agruparPorHora(['Martes', 'Jueves'], { Martes: '11:00', Jueves: '11:00' });
    assert.equal(iguales.length, 1);
    assert.deepEqual(iguales[0].dias, ['Martes', 'Jueves']);

    const distintos = agruparPorHora(['Martes', 'Jueves'], { Martes: '11:00', Jueves: '18:00' });
    assert.equal(distintos.length, 2);
  });
});

describe('validarIngreso — misma regla que corre el servidor', () => {
  it('acepta el formulario del cliente de ejemplo', () => {
    assert.deepEqual(validarIngreso(formEjemplo()), {});
  });

  it('rechaza un envío sin nombre', () => {
    const f = { ...formEjemplo(), nombre: '' };
    assert.equal(validarIngreso(f).nombre, 'Falta tu nombre');
  });

  it('rechaza un envío sin consentimiento', () => {
    const f = { ...formEjemplo(), consentimiento: false };
    assert.equal(validarIngreso(f).consentimiento, 'Necesito tu autorización para seguir');
  });

  it('exige la hora de cada día elegido', () => {
    const f = { ...formEjemplo(), horas: { Martes: '11:00' } };
    assert.equal(validarIngreso(f)._horas, 'Cargá la hora de cada día');
  });

  it('exige al menos tres horarios de comida', () => {
    const f = { ...formEjemplo(), comidas: { desayuno: '09:45', almuerzo: '13:00' } };
    assert.equal(validarIngreso(f)._comidas, 'Cargá al menos tres horarios de comida');
  });

  it('exige al menos uno de los dos campos de sesiones', () => {
    const f = { ...formEjemplo(), sesiones_con_entrenador: '', sesiones_solo: '' };
    assert.equal(validarIngreso(f)._sesiones, 'Cargá cuántas sesiones hacés conmigo y cuántas solo');
  });

  it('rechaza opciones que no están en la lista', () => {
    const f = { ...formEjemplo(), balanza: 'cualquier cosa' };
    assert.equal(validarIngreso(f).balanza, 'Elegí una opción');
  });

  it('parsearForm no confía en el payload crudo', () => {
    const f = parsearForm({ nombre: { hack: 1 }, dias: ['Lunes', 'Marte'], consentimiento: 'true' });
    assert.equal(f.nombre, '');
    assert.deepEqual(f.dias, ['Lunes']);
    assert.equal(f.consentimiento, false);
    assert.equal(validarIngreso(f).nombre, 'Falta tu nombre');
  });
});

describe('normalizarIngreso', () => {
  it('guarda los días en orden de semana y las cinco comidas', () => {
    const d = normalizarIngreso({ ...formEjemplo(), dias: ['Sábado', 'Martes', 'Jueves'] });
    assert.deepEqual(d.diasEntrenamiento, ['Martes', 'Jueves', 'Sábado']);
    assert.deepEqual(Object.keys(d.horariosComidas), ['desayuno', 'colacion_am', 'almuerzo', 'merienda', 'cena']);
    assert.equal(d.horariosComidas.colacion_am, null);
    assert.equal(d.pesoKg, '67.70');
    assert.equal(d.jornadaVariable, true);
    assert.equal(d.lesion, true);
  });

  it('descarta el detalle de lesión si el cliente contestó que no tiene', () => {
    const d = normalizarIngreso({ ...formEjemplo(), lesion: 'No' });
    assert.equal(d.lesion, false);
    assert.equal(d.lesionDetalle, null);
    assert.equal(d.lesionEstado, null);
  });
});

describe('construirFicha', () => {
  it('escribe la ventana peri-entreno derivada en el prompt', () => {
    const { prompt, tmb } = construirFicha(altaDe(formEjemplo()));
    assert.match(prompt, /PRE: Desayuno \(09:45, 75 min antes\)/);
    assert.match(prompt, /POST: Almuerzo \(13:00\)/);
    assert.match(prompt, /Martes, Jueves, Sábado 11:00/);
    assert.equal(tmb, 1610); // 10*67,7 + 6,25*178 − 5*37 + 5 = 1609,5
  });

  it('avisa que hacen falta dos plantillas cuando los horarios difieren', () => {
    const f = { ...formEjemplo(), horas: { Martes: '11:00', Jueves: '18:00', Sábado: '11:00' } };
    const { alertas } = construirFicha(altaDe(f));
    assert.ok(alertas.some(a => a.texto.includes('dos plantillas de comidas')));
  });

  it('marca REPREGUNTAR cuando no hay ninguna comida en ventana', () => {
    const f = {
      ...formEjemplo(),
      comidas: { desayuno: '06:00', colacion_am: null, almuerzo: '16:00', merienda: '18:00', cena: '21:00' },
    };
    const { alertas, prompt } = construirFicha(altaDe(f));
    assert.match(prompt, /no hay comida en ventana\. REPREGUNTAR\./);
    assert.ok(alertas.some(a => a.tipo === 'stop'));
  });

  it('avisa si el cliente no piensa comprar balanza', () => {
    const f = { ...formEjemplo(), balanza: 'No y no pienso comprarla' };
    const { alertas } = construirFicha(altaDe(f));
    assert.ok(alertas.some(a => a.tipo === 'stop' && a.texto.includes('balanza')));
  });

  it('avisa si declara más comidas de las que sostiene', () => {
    const f = { ...formEjemplo(), sostiene: '3' };
    const { alertas } = construirFicha(altaDe(f));
    assert.ok(alertas.some(a => a.texto.includes('sostiene 3')));
  });

  it('no inventa alertas cuando no hay nada que marcar', () => {
    const f = {
      ...formEjemplo(),
      jornada: 'No, todos mis días son parecidos',
      laboratorio: 'No',
      lesion: 'No',
      sostiene: '4',
    };
    const { alertas } = construirFicha(altaDe(f));
    assert.equal(alertas.length, 1);
    assert.equal(alertas[0].tipo, 'ok');
  });
});
