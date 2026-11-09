// Catálogo de ejercicios de Re-Viva, ordenado por estación del gimnasio.
// Es la única fuente: de acá salen la guía de grabación (DOCX), la biblioteca
// pública /ejercicios y el admin donde se carga el video de cada uno.
//
// El slug sale del nombre. Si se renombra un ejercicio cambia su URL y se
// pierde el video cargado: para renombrar, fijar el slug viejo con `slug`.
// Agregar ejercicios siempre AL FINAL de su estación, así no se corren los
// códigos (3.07, 6.02…) que ya se usaron para nombrar archivos.

export interface Ejercicio {
  slug: string
  codigo: string      // "3.07" = estación 3, ejercicio 7. Nombre del archivo al grabar.
  nombre: string
  grupo: string       // músculo o zona principal
  clave: string       // la clave técnica en una línea: lo que se dice en cámara
  error: string       // el error más común: lo que se muestra y se corrige
  estacion: string
}

export interface Estacion {
  numero: number
  nombre: string
  equipo: string      // qué tener a mano antes de empezar a grabar ahí
  ejercicios: Ejercicio[]
}

type Fila = [nombre: string, grupo: string, clave: string, error: string, slug?: string]

export function slugEjercicio(nombre: string): string {
  return nombre
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const DATOS: { nombre: string; equipo: string; filas: Fila[] }[] = [
  {
    nombre: 'Rack con barra olímpica',
    equipo: 'Barra, discos, seguros, banco plano para el hip thrust, almohadilla para la barra',
    filas: [
      ['Sentadilla trasera con barra', 'Cuádriceps y glúteos', 'Pies al ancho de hombros, pecho arriba, rodillas siguen la línea de los pies.', 'Talones que se levantan o rodillas que se cierran al subir.'],
      ['Sentadilla frontal con barra', 'Cuádriceps', 'Codos altos todo el recorrido; la barra descansa en los hombros, no en las manos.', 'Codos que caen y la barra rueda hacia adelante.'],
      ['Peso muerto convencional', 'Cadena posterior', 'Barra pegada a la pierna, espalda neutra, empujás el piso con los pies.', 'Espalda redondeada o tirar con los brazos.'],
      ['Peso muerto sumo', 'Glúteos y aductores', 'Pies anchos, rodillas hacia afuera, torso más vertical.', 'Cadera que sube antes que la barra.'],
      ['Peso muerto rumano con barra', 'Isquios y glúteos', 'Cadera hacia atrás, rodillas apenas flexionadas, barra rozando las piernas.', 'Convertirlo en sentadilla o bajar redondeando la espalda.'],
      ['Buenos días con barra', 'Isquios y lumbares', 'Bisagra de cadera con la barra en la espalda; bajás hasta sentir el estiramiento.', 'Flexionar la columna en vez de la cadera.'],
      ['Hip thrust con barra', 'Glúteos', 'Mentón al pecho, costillas abajo, pausa de un segundo arriba.', 'Arquear la zona lumbar para subir más.'],
      ['Remo con barra inclinado', 'Dorsales y espalda media', 'Torso casi paralelo al piso, la barra va al ombligo, codos cerca del cuerpo.', 'Enderezarse en cada repetición para ayudarse.'],
      ['Press militar de pie con barra', 'Hombros', 'Glúteos y abdomen apretados, la barra sube en línea recta y la cabeza pasa al frente.', 'Arquear la espalda y empujar con el pecho.'],
      ['Zancada hacia atrás con barra', 'Cuádriceps y glúteos', 'Paso largo hacia atrás, torso firme, la rodilla de atrás baja casi al piso.', 'Paso corto que carga la rodilla de adelante.'],
      ['Encogimientos con barra', 'Trapecios', 'Hombros directo a las orejas, pausa arriba, sin girar.', 'Hacer círculos con los hombros.'],
    ],
  },
  {
    nombre: 'Banco plano con barra',
    equipo: 'Banco plano con soportes, barra, discos, seguros',
    filas: [
      ['Press de banca con barra', 'Pecho', 'Escápulas juntas y abajo, pies firmes, la barra baja a la línea de los pezones.', 'Rebotar la barra en el pecho o despegar la cola del banco.'],
      ['Press de banca agarre cerrado', 'Tríceps', 'Manos al ancho de hombros, codos pegados al cuerpo.', 'Agarre demasiado angosto que carga las muñecas.'],
      ['Press de banca con pausa', 'Pecho', 'Un segundo quieto sobre el pecho, sin perder tensión, y empujás.', 'Relajar el cuerpo durante la pausa.'],
    ],
  },
  {
    nombre: 'Banco regulable con mancuernas',
    equipo: 'Banco regulable, mancuernas livianas, medias y pesadas',
    filas: [
      ['Press plano con mancuernas', 'Pecho', 'Codos a 45 grados del cuerpo, bajás hasta sentir el estiramiento del pecho.', 'Codos abiertos a 90 grados, en línea con los hombros.'],
      ['Press inclinado con mancuernas', 'Pecho superior', 'Banco a 30 grados, las mancuernas suben sobre los hombros.', 'Banco demasiado inclinado: lo termina haciendo el hombro.'],
      ['Aperturas con mancuernas', 'Pecho', 'Codos apenas flexionados y fijos; abrís como abrazando un árbol.', 'Flexionar los codos y convertirlo en un press.'],
      ['Pullover con mancuerna', 'Dorsales y pecho', 'Brazos casi extendidos, bajás por detrás de la cabeza sin arquear la espalda.', 'Flexionar los codos y usar tríceps.'],
      ['Press de hombros sentado con mancuernas', 'Hombros', 'Respaldo casi vertical, codos apenas adelante del cuerpo, subís sin chocar las mancuernas.', 'Arquear la espalda y despegarla del respaldo.'],
      ['Press Arnold', 'Hombros', 'Arrancás con las palmas hacia vos y girás mientras subís.', 'Girar tarde y perder el recorrido.'],
      ['Elevaciones laterales con mancuernas', 'Hombro medio', 'Codos apenas flexionados, subís hasta la altura del hombro, el meñique guía.', 'Balancear el cuerpo o subir los trapecios.'],
      ['Elevaciones frontales con mancuernas', 'Hombro anterior', 'Subís hasta la altura de los ojos, sin impulso.', 'Tirar el torso hacia atrás.'],
      ['Pájaros con mancuernas', 'Hombro posterior', 'Torso inclinado, abrís los brazos con los codos fijos y los pulgares hacia abajo.', 'Juntar las escápulas y hacerlo con la espalda.'],
      ['Remo a una mano con mancuerna', 'Dorsales', 'Mano y rodilla apoyadas, el codo va hacia la cadera.', 'Girar el torso para subir la mancuerna.'],
      ['Remo con pecho apoyado en banco inclinado', 'Espalda media', 'Pecho pegado al banco, codos hacia atrás y pausa arriba.', 'Despegar el pecho del banco.'],
      ['Curl alterno con mancuernas', 'Bíceps', 'Codos pegados al cuerpo, girás la palma mientras subís.', 'Adelantar el codo y balancearse.'],
      ['Curl martillo', 'Bíceps y antebrazo', 'Palmas enfrentadas todo el recorrido, codos quietos.', 'Usar impulso de la cadera.'],
      ['Curl inclinado con mancuernas', 'Bíceps', 'Banco a 60 grados, brazos colgando por detrás del cuerpo, codos quietos.', 'Adelantar los codos y perder el estiramiento.'],
      ['Curl concentrado', 'Bíceps', 'Codo apoyado en la cara interna del muslo, subís sin mover el hombro.', 'Ayudarse con el torso.'],
      ['Extensión de tríceps tras nuca con mancuerna', 'Tríceps', 'Codos apuntando al techo y cerca de la cabeza, bajás profundo.', 'Abrir los codos hacia los costados.'],
      ['Press francés con mancuernas', 'Tríceps', 'Acostado, codos fijos apuntando al techo, bajás al costado de la cabeza.', 'Mover los codos y convertirlo en un press.'],
      ['Patada de tríceps con mancuerna', 'Tríceps', 'Brazo paralelo al piso y fijo; solo se mueve el antebrazo.', 'Balancear el brazo entero.'],
      ['Sentadilla goblet', 'Cuádriceps y glúteos', 'Mancuerna pegada al pecho, codos por dentro de las rodillas al bajar.', 'Inclinarse hacia adelante y despegar los talones.'],
      ['Sentadilla búlgara', 'Cuádriceps y glúteos', 'Pie de atrás apoyado en el banco, el peso va en la pierna de adelante.', 'Pararse demasiado cerca del banco.'],
      ['Zancadas caminando con mancuernas', 'Cuádriceps y glúteos', 'Paso largo, torso erguido, la rodilla de atrás casi toca el piso.', 'Pasos cortos y rodilla que se cierra.'],
      ['Peso muerto rumano con mancuernas', 'Isquios y glúteos', 'Cadera hacia atrás, mancuernas rozando las piernas, espalda neutra.', 'Flexionar de más las rodillas.'],
      ['Peso muerto a una pierna con mancuerna', 'Isquios y glúteos', 'Cadera cuadrada al piso, la pierna libre se alinea con el torso.', 'Abrir la cadera hacia el costado.'],
      ['Subida al banco con mancuernas', 'Cuádriceps y glúteos', 'Todo el pie arriba del banco, subís sin empujar con la pierna de abajo.', 'Impulsarse con el pie de atrás.'],
      ['Hip thrust a una pierna', 'Glúteos', 'Espalda en el banco, una pierna extendida, la cadera sube pareja.', 'Dejar caer la cadera del lado libre.'],
      ['Elevación de talones a una pierna', 'Gemelos', 'Recorrido completo: bajás el talón, pausa, y subís todo lo que puedas.', 'Rebotar con recorrido corto.'],
    ],
  },
  {
    nombre: 'Dorsalera (polea alta)',
    equipo: 'Barra larga, agarre neutro en V, barra recta o soga',
    filas: [
      ['Jalón al pecho agarre abierto', 'Dorsales', 'Pecho arriba, la barra baja a la clavícula, los codos van hacia el piso.', 'Tirarse hacia atrás y bajar la barra con el cuerpo.'],
      ['Jalón al pecho agarre neutro', 'Dorsales', 'Agarre en V, codos pegados al cuerpo, bajás hasta el esternón.', 'Encoger los hombros al subir.'],
      ['Jalón al pecho agarre supino', 'Dorsales y bíceps', 'Palmas hacia vos al ancho de hombros, codos hacia las costillas.', 'Hacerlo todo con los bíceps.'],
      ['Pulldown con brazos rectos', 'Dorsales', 'Brazos casi extendidos y fijos, la barra baja en arco hasta los muslos.', 'Flexionar los codos.'],
    ],
  },
  {
    nombre: 'Remo sentado en polea baja',
    equipo: 'Agarre en V, barra ancha',
    filas: [
      ['Remo sentado agarre cerrado', 'Espalda media y dorsales', 'Torso quieto y erguido, el agarre va al ombligo, hombros atrás.', 'Hamacarse hacia adelante y atrás.'],
      ['Remo sentado agarre abierto', 'Espalda alta', 'Barra ancha al pecho bajo, codos abiertos, juntás las escápulas.', 'Encoger los hombros hacia las orejas.'],
      ['Remo sentado a una mano', 'Dorsales', 'Una mano por vez, dejás que el hombro se estire adelante y tirás el codo atrás.', 'Girar todo el torso.'],
    ],
  },
  {
    nombre: 'Poleas cruzadas',
    equipo: 'Soga, barra recta, dos manijas, tobillera',
    filas: [
      ['Cruce de poleas de arriba hacia abajo', 'Pecho inferior', 'Un paso adelante, codos fijos, las manos se cruzan frente a la cadera.', 'Flexionar los codos y empujar.'],
      ['Cruce de poleas de abajo hacia arriba', 'Pecho superior', 'Poleas abajo, las manos suben y se juntan a la altura del mentón.', 'Subir los hombros.'],
      ['Extensión de tríceps con soga', 'Tríceps', 'Codos pegados a las costillas, separás la soga abajo.', 'Mover los codos hacia adelante.'],
      ['Extensión de tríceps con barra', 'Tríceps', 'Codos fijos, extendés del todo y controlás la subida.', 'Echar el peso del cuerpo encima.'],
      ['Extensión de tríceps sobre la cabeza con soga', 'Tríceps', 'De espaldas a la polea, codos cerca de la cabeza, extendés hacia adelante y arriba.', 'Abrir los codos.'],
      ['Curl de bíceps en polea', 'Bíceps', 'Polea baja, codos pegados al cuerpo, tensión constante.', 'Tirarse hacia atrás.'],
      ['Face pull', 'Hombro posterior', 'Soga a la altura de la cara, codos altos, separás la soga hacia las orejas.', 'Tirar hacia el pecho con los codos bajos.'],
      ['Elevación lateral en polea', 'Hombro medio', 'Polea baja cruzada por delante, subís hasta el hombro.', 'Usar impulso del torso.'],
      ['Patada de glúteo en polea', 'Glúteos', 'Tobillera, torso apenas inclinado, la pierna va atrás sin arquear la espalda.', 'Arquear la zona lumbar.'],
      ['Pull through en polea', 'Glúteos e isquios', 'De espaldas a la polea, bisagra de cadera, terminás apretando glúteos.', 'Tirar con los brazos.'],
      ['Press Pallof', 'Abdomen', 'De costado a la polea, extendés los brazos al frente y no dejás que te gire.', 'Rotar el torso hacia la polea.'],
      ['Leñador en polea', 'Oblicuos', 'Brazos extendidos, girás desde el torso de arriba hacia abajo en diagonal.', 'Hacerlo solo con los brazos.'],
      ['Crunch en polea', 'Abdomen', 'De rodillas, soga a los costados de la cabeza, enrollás la columna.', 'Sentarse sobre los talones en vez de flexionar.'],
    ],
  },
  {
    nombre: 'Barra de dominadas y paralelas',
    equipo: 'Banda elástica de asistencia',
    filas: [
      ['Dominadas agarre prono', 'Dorsales', 'Arrancás colgado con brazos extendidos y el pecho va a la barra.', 'Medias repeticiones o patear para subir.'],
      ['Dominadas agarre supino', 'Dorsales y bíceps', 'Palmas hacia vos, al ancho de hombros, el mentón pasa la barra.', 'No extender los brazos abajo.'],
      ['Dominadas asistidas con banda', 'Dorsales', 'Banda en el pie o la rodilla, mismo recorrido completo.', 'Rebotar en la banda.'],
      ['Fondos en paralelas', 'Pecho y tríceps', 'Hombros abajo, bajás hasta que el brazo queda paralelo al piso.', 'Hundir los hombros hacia las orejas.'],
      ['Elevación de piernas colgado', 'Abdomen', 'Sin balanceo, subís las rodillas o las piernas enrollando la cadera.', 'Hamacarse para tomar impulso.'],
    ],
  },
  {
    nombre: 'Prensa de piernas',
    equipo: 'Discos',
    filas: [
      ['Prensa a 45 grados', 'Cuádriceps y glúteos', 'Pies al ancho de hombros, bajás profundo sin despegar la cola del asiento.', 'Bloquear las rodillas arriba o recorrido corto.'],
      ['Prensa con pies altos', 'Glúteos e isquios', 'Pies arriba en la plataforma, empujás con los talones.', 'Despegar la zona lumbar al bajar.'],
      ['Prensa a una pierna', 'Cuádriceps y glúteos', 'Un pie al centro, la cadera queda quieta y apoyada.', 'Girar la cadera hacia el costado.'],
      ['Gemelos en prensa', 'Gemelos', 'Punta de pies en el borde, rodillas casi extendidas, recorrido completo.', 'Rebotar sin pausa abajo.'],
    ],
  },
  {
    nombre: 'Hack y multipower (Smith)',
    equipo: 'Discos, banco regulable para el Smith',
    filas: [
      ['Sentadilla hack', 'Cuádriceps', 'Espalda pegada al respaldo, bajás profundo, rodillas hacia adelante.', 'Recorrido corto con mucho peso.'],
      ['Sentadilla en Smith', 'Cuádriceps y glúteos', 'Pies apenas adelantados, bajás recto, espalda neutra.', 'Pies demasiado atrás que cargan las rodillas.'],
      ['Press inclinado en Smith', 'Pecho superior', 'Banco a 30 grados, la barra baja a la clavícula.', 'Banco mal ubicado: la barra baja al cuello o a la panza.'],
      ['Hip thrust en Smith', 'Glúteos', 'Espalda en el banco, barra en la cadera, pausa arriba.', 'Empujar con la zona lumbar.'],
      ['Zancada en Smith', 'Glúteos y cuádriceps', 'Un pie adelante y otro atrás, bajás vertical.', 'Pies en línea, sin base de apoyo.'],
    ],
  },
  {
    nombre: 'Máquinas de piernas',
    equipo: 'Sillón de cuádriceps, camilla de isquios, abductora y aductora',
    filas: [
      ['Sillón de cuádriceps', 'Cuádriceps', 'Rodilla alineada con el eje de la máquina, extendés del todo y pausa arriba.', 'Patear con impulso y soltar la bajada.'],
      ['Curl femoral acostado', 'Isquios', 'Cadera pegada a la camilla, llevás el rodillo hasta la cola.', 'Levantar la cadera para ayudarse.'],
      ['Curl femoral sentado', 'Isquios', 'Espalda apoyada, bajás el rodillo todo el recorrido y controlás la vuelta.', 'Despegar la espalda del respaldo.'],
      ['Abductores en máquina', 'Glúteo medio', 'Torso apenas inclinado adelante, abrís y aguantás un segundo.', 'Rebotar sin control.'],
      ['Aductores en máquina', 'Aductores', 'Cerrás controlado y abrís hasta sentir el estiramiento.', 'Usar más peso del que se controla en la apertura.'],
      ['Hip thrust en máquina', 'Glúteos', 'Cinturón en la cadera, mentón al pecho, pausa arriba.', 'Arquear la espalda.'],
      ['Gemelos de pie en máquina', 'Gemelos', 'Rodillas extendidas, talón bien abajo, pausa, y subís todo.', 'Flexionar las rodillas para ayudarse.'],
      ['Gemelos sentado en máquina', 'Sóleo', 'Rodillas a 90 grados, recorrido completo y lento.', 'Recorrido corto y rápido.'],
    ],
  },
  {
    nombre: 'Máquinas de torso',
    equipo: 'Press de pecho, peck deck, press de hombros, remo en máquina',
    filas: [
      ['Press de pecho en máquina', 'Pecho', 'Asiento a la altura en que las manijas quedan a la línea del pecho.', 'Asiento bajo: empujan los hombros.'],
      ['Peck deck', 'Pecho', 'Codos apenas flexionados, juntás al frente y pausa.', 'Despegar la espalda del respaldo.'],
      ['Peck deck invertido', 'Hombro posterior', 'Pecho contra el respaldo, abrís con los brazos casi extendidos.', 'Juntar las escápulas y usar la espalda.'],
      ['Press de hombros en máquina', 'Hombros', 'Espalda apoyada, empujás sin bloquear los codos.', 'Arquear la espalda.'],
      ['Remo en máquina', 'Espalda media', 'Pecho apoyado, codos hacia atrás, pausa con las escápulas juntas.', 'Despegar el pecho del apoyo.'],
      ['Remo en T', 'Espalda', 'Torso inclinado y firme, la barra va al pecho bajo.', 'Enderezarse con cada tirón.'],
      ['Elevaciones laterales en máquina', 'Hombro medio', 'Codos contra las almohadillas, subís hasta el hombro.', 'Subir los trapecios.'],
    ],
  },
  {
    nombre: 'Banco Scott y barra Z',
    equipo: 'Barra Z, discos, banco plano',
    filas: [
      ['Curl en banco Scott', 'Bíceps', 'Axilas contra el borde del banco, bajás casi hasta extender.', 'Recorrido corto arriba.'],
      ['Curl con barra Z de pie', 'Bíceps', 'Codos pegados al cuerpo, subís sin mover los hombros.', 'Hamacarse con la cadera.'],
      ['Rompecráneos con barra Z', 'Tríceps', 'Acostado, codos apuntando al techo, la barra baja a la frente o detrás de la cabeza.', 'Abrir los codos.'],
      ['Curl inverso con barra Z', 'Antebrazos', 'Palmas hacia abajo, codos quietos.', 'Doblar las muñecas.'],
    ],
  },
  {
    nombre: 'Banco de hiperextensiones',
    equipo: 'Disco para sumar carga',
    filas: [
      ['Hiperextensiones a 45 grados', 'Lumbares e isquios', 'Almohadilla debajo de la cadera, subís hasta quedar en línea recta.', 'Arquear de más arriba.'],
      ['Hiperextensiones con foco en glúteo', 'Glúteos', 'Espalda alta redondeada, pies hacia afuera, subís apretando glúteos.', 'Subir con la zona lumbar.'],
    ],
  },
  {
    nombre: 'Colchoneta',
    equipo: 'Colchoneta, rueda abdominal, banda mini',
    filas: [
      ['Plancha frontal', 'Abdomen', 'Codos bajo los hombros, glúteos y abdomen apretados, cuerpo en línea.', 'Cadera caída o muy levantada.'],
      ['Plancha lateral', 'Oblicuos', 'Codo bajo el hombro, cadera arriba y alineada.', 'Dejar caer la cadera.'],
      ['Dead bug', 'Abdomen', 'Zona lumbar pegada al piso, extendés brazo y pierna contrarios.', 'Despegar la zona lumbar.'],
      ['Bird dog', 'Abdomen y lumbares', 'En cuatro apoyos, extendés brazo y pierna contrarios sin girar la cadera.', 'Rotar la cadera hacia arriba.'],
      ['Crunch abdominal', 'Abdomen', 'Enrollás las costillas hacia la cadera, sin tirar del cuello.', 'Tirar de la cabeza con las manos.'],
      ['Elevación de piernas acostado', 'Abdomen inferior', 'Zona lumbar pegada al piso, bajás las piernas hasta donde la sostengas.', 'Arquear la espalda al bajar.'],
      ['Hollow hold', 'Abdomen', 'Zona lumbar pegada al piso, hombros y piernas despegados.', 'Arquear la espalda.'],
      ['Rueda abdominal', 'Abdomen', 'Cadera adelantada y abdomen firme, vas hasta donde no pierdas la postura.', 'Dejar caer la cadera.'],
      ['Flexiones de brazos', 'Pecho y tríceps', 'Cuerpo en una línea, codos a 45 grados, pecho al piso.', 'Cadera caída y codos abiertos.'],
      ['Flexiones con rodillas apoyadas', 'Pecho y tríceps', 'Misma línea de rodillas a hombros, pecho al piso.', 'Dejar la cadera atrás.'],
      ['Puente de glúteos', 'Glúteos', 'Pies cerca de la cola, subís apretando glúteos, costillas abajo.', 'Arquear la zona lumbar.'],
      ['Almeja con banda', 'Glúteo medio', 'De costado, pies juntos, abrís la rodilla sin girar la cadera.', 'Rotar el cuerpo hacia atrás.'],
      ['Escaladores', 'Abdomen y cardio', 'Hombros sobre las manos, rodillas al pecho sin subir la cadera.', 'Rebotar con la cadera alta.'],
    ],
  },
  {
    nombre: 'Zona funcional',
    equipo: 'Pesa rusa, barra en landmine, pelota, cajón, sogas, trineo',
    filas: [
      ['Swing con pesa rusa', 'Glúteos e isquios', 'Bisagra de cadera explosiva; la pesa sube por la cadera, no por los brazos.', 'Hacer una sentadilla y levantar con los hombros.'],
      ['Caminata del granjero', 'Agarre y abdomen', 'Hombros atrás, pasos cortos, torso derecho.', 'Inclinarse hacia un costado.'],
      ['Press landmine', 'Hombros y pecho', 'Medio arrodillado, empujás la barra hacia arriba y adelante.', 'Arquear la espalda.'],
      ['Remo landmine', 'Espalda', 'Torso inclinado, la barra va a las costillas.', 'Enderezarse con cada tirón.'],
      ['Lanzamiento de pelota al piso', 'Potencia y abdomen', 'Extensión completa arriba y lanzás con todo el cuerpo.', 'Lanzar solo con los brazos.'],
      ['Salto al cajón', 'Potencia de piernas', 'Aterrizás suave y en media sentadilla; bajás caminando.', 'Bajar saltando hacia atrás.'],
      ['Sogas de batalla', 'Cardio y hombros', 'Media sentadilla, torso firme, ondas parejas.', 'Pararse derecho y mover solo las manos.'],
      ['Empuje de trineo', 'Piernas y cardio', 'Brazos firmes, cuerpo inclinado, pasos largos y potentes.', 'Pasos cortos con la cadera alta.'],
      ['Burpee', 'Cardio', 'Pecho al piso, salto con extensión completa.', 'Dejar caer la cadera al apoyar.'],
    ],
  },
  {
    nombre: 'Entrada en calor y movilidad',
    equipo: 'Banda elástica, palo o bastón, colchoneta',
    filas: [
      ['Aperturas con banda', 'Hombro posterior', 'Brazos extendidos al frente, abrís la banda hasta el pecho.', 'Subir los hombros.'],
      ['Rotación externa de hombro con banda', 'Manguito rotador', 'Codo pegado a las costillas a 90 grados, girás hacia afuera.', 'Despegar el codo del cuerpo.'],
      ['Pasaje de hombros con palo', 'Movilidad de hombros', 'Agarre ancho, brazos extendidos, pasás el palo de adelante hacia atrás.', 'Flexionar los codos para pasar.'],
      ['Gato y camello', 'Movilidad de columna', 'En cuatro apoyos, redondeás y arqueás la columna lento.', 'Hacerlo rápido y sin recorrido.'],
      ['Movilidad de cadera 90/90', 'Movilidad de cadera', 'Sentado, las dos rodillas a 90 grados, cambiás de lado sin apoyar las manos.', 'Colapsar la espalda.'],
      ['El mejor estiramiento del mundo', 'Movilidad general', 'Zancada larga, codo al piso, rotás el torso y abrís el brazo al techo.', 'Paso corto, sin abrir la cadera.'],
      ['Sentadilla profunda sostenida', 'Movilidad de cadera y tobillos', 'Talones apoyados, codos empujan las rodillas, pecho arriba.', 'Talones despegados.'],
      ['Movilidad de tobillo contra la pared', 'Movilidad de tobillos', 'Rodilla hacia la pared sin despegar el talón.', 'Levantar el talón.'],
      ['Puente de glúteos con banda', 'Activación de glúteos', 'Banda sobre las rodillas, empujás hacia afuera mientras subís.', 'Dejar que las rodillas se cierren.'],
      ['Caminata lateral con banda', 'Activación de glúteo medio', 'Media sentadilla, pasos cortos, tensión constante en la banda.', 'Juntar los pies del todo.'],
    ],
  },
  {
    nombre: 'Cardio',
    equipo: 'Cinta, bicicleta, remo, escalador',
    filas: [
      ['Caminata inclinada en cinta', 'Cardio', 'Inclinación alta, paso firme, sin agarrarse de las barandas.', 'Colgarse de las barandas.'],
      ['Bicicleta fija', 'Cardio', 'Asiento a la altura de la cadera; la rodilla queda apenas flexionada abajo.', 'Asiento bajo que carga las rodillas.'],
      ['Remo ergómetro', 'Cardio', 'Primero piernas, después torso, al final brazos; a la vuelta, al revés.', 'Tirar con los brazos antes de empujar con las piernas.'],
      ['Escalador', 'Cardio', 'Torso derecho, pasos completos, apoyo liviano de las manos.', 'Apoyar el peso en las barandas.'],
    ],
  },
]

export const ESTACIONES: Estacion[] = DATOS.map((e, i) => ({
  numero: i + 1,
  nombre: e.nombre,
  equipo: e.equipo,
  ejercicios: e.filas.map(([nombre, grupo, clave, error, slug], j) => ({
    slug: slug ?? slugEjercicio(nombre),
    codigo: `${i + 1}.${String(j + 1).padStart(2, '0')}`,
    nombre, grupo, clave, error,
    estacion: e.nombre,
  })),
}))

export const EJERCICIOS: Ejercicio[] = ESTACIONES.flatMap(e => e.ejercicios)

const POR_SLUG = new Map(EJERCICIOS.map(e => [e.slug, e]))
export const ejercicioPorSlug = (slug: string): Ejercicio | undefined => POR_SLUG.get(slug)

// Nombre de archivo sugerido al grabar: ordena solo en la galería del teléfono.
export const nombreArchivo = (e: Ejercicio): string => `${e.codigo}-${e.slug}`
