// Base de datos de ingredientes comunes en la dieta argentina.
// Valores por 100g de alimento crudo/natural, macros aproximados.
// Fuente compilada: USDA FoodData Central + tabla CENEXA Argentina.
//
// Uso: lookup fuzzy por nombre (normalizado sin tildes ni mayúsculas) para
// validar en el proofreader que:
//   - el ingrediente existe / se puede matchear
//   - sus macros declarados por el motor no se desvían > ~20%
//   - la cantidad es razonable (el motor no pidió 500g de aceite)

export interface IngredienteRef {
  nombre: string;           // canónico
  aliases: string[];        // otros nombres que puede usar el motor
  proteinaG: number;        // por 100g
  carbosG: number;          // por 100g
  grasaG: number;           // por 100g
  kcal: number;             // por 100g (derivado)
  cantidadRazonableMaxG?: number; // tope típico por comida (para detectar outliers)
  categoria:
    | 'proteina_animal'
    | 'proteina_vegetal'
    | 'lacteo'
    | 'cereal'
    | 'tuberculo'
    | 'legumbre'
    | 'fruta'
    | 'verdura'
    | 'grasa'
    | 'fruto_seco'
    | 'semilla'
    | 'bebida'
    | 'otro';
}

// Helper para construir entradas (kcal se deriva si no se pasa)
function ing(
  nombre: string,
  aliases: string[],
  proteinaG: number,
  carbosG: number,
  grasaG: number,
  categoria: IngredienteRef['categoria'],
  cantidadRazonableMaxG?: number,
  kcalManual?: number,
): IngredienteRef {
  const kcal = kcalManual ?? Math.round(proteinaG * 4 + carbosG * 4 + grasaG * 9);
  return { nombre, aliases, proteinaG, carbosG, grasaG, kcal, categoria, cantidadRazonableMaxG };
}

export const INGREDIENTES_DB: IngredienteRef[] = [
  // ─── PROTEÍNAS ANIMALES ───────────────────────────────────────────
  ing('pollo pechuga', ['pechuga de pollo','pollo pechuga sin piel','suprema'], 31, 0, 3.6, 'proteina_animal', 400),
  ing('pollo muslo', ['pata muslo','muslo de pollo','pollo pata'], 24, 0, 10, 'proteina_animal', 400),
  ing('carne vacuna magra', ['nalga','peceto','cuadril','bola de lomo','lomo','roast beef'], 27, 0, 7, 'proteina_animal', 400),
  ing('carne picada magra', ['carne molida','carne picada 95/5'], 22, 0, 9, 'proteina_animal', 300),
  ing('cerdo solomillo', ['bondiola magra','lomo de cerdo','solomillo de cerdo'], 26, 0, 8, 'proteina_animal', 400),
  ing('pescado blanco', ['merluza','brotola','lenguado','pollock','abadejo'], 20, 0, 2, 'proteina_animal', 400),
  ing('atun al natural', ['atun en lata al natural','atún en agua'], 25, 0, 1, 'proteina_animal', 200, 115),
  ing('salmon', ['salmón','salmón rosado','salmon fresco'], 20, 0, 13, 'proteina_animal', 300),
  ing('huevo entero', ['huevo','huevos','huevo de gallina'], 13, 1, 11, 'proteina_animal', 300),
  ing('clara de huevo', ['claras de huevo','claras'], 11, 0.7, 0, 'proteina_animal', 400),

  // ─── LÁCTEOS ──────────────────────────────────────────────────────
  ing('yogur natural descremado', ['yogurt natural descremado','yogur descremado'], 4.5, 5, 0.2, 'lacteo', 500),
  ing('yogur griego', ['yogur griego natural','yogurt griego'], 10, 3.6, 5, 'lacteo', 400),
  ing('leche descremada', ['leche descremada','leche 0%'], 3.4, 5, 0.2, 'lacteo', 500),
  ing('leche entera', ['leche','leche entera'], 3.3, 4.7, 3.3, 'lacteo', 500),
  ing('queso port salut', ['queso port salut light','queso semiduro'], 21, 2, 20, 'lacteo', 80),
  ing('queso cottage', ['queso cottage','cottage cheese','requesón'], 11, 3.4, 4.3, 'lacteo', 300),
  ing('ricota descremada', ['ricota magra','ricotta light'], 11, 3, 4, 'lacteo', 300),
  ing('queso crema light', ['queso untable light','queso untable'], 7, 5, 10, 'lacteo', 60),
  ing('queso rallado', ['queso reggianito','queso parmesano','parmesano'], 36, 3, 26, 'lacteo', 50),

  // ─── CEREALES / GRANOS ────────────────────────────────────────────
  ing('avena', ['avena en hojuelas','avena arrollada','copos de avena'], 13, 67, 7, 'cereal', 150),
  ing('arroz blanco cocido', ['arroz blanco','arroz'], 2.7, 28, 0.3, 'cereal', 400, 130),
  ing('arroz integral cocido', ['arroz integral','arroz yamani'], 2.7, 25, 1, 'cereal', 400, 120),
  ing('quinoa cocida', ['quinoa','quinoa hervida'], 4.4, 21, 1.9, 'cereal', 400, 120),
  ing('pan integral', ['pan integral de salvado','pan multigrano','pan lactal integral'], 10, 41, 4, 'cereal', 150),
  ing('pan blanco', ['pan frances','pan lactal blanco','mignon'], 9, 49, 3, 'cereal', 120),
  ing('fideos cocidos', ['pasta','fideos','pasta cocida','spaghetti cocido'], 5, 25, 1, 'cereal', 400, 130),
  ing('fideos integrales cocidos', ['pasta integral','fideos integrales'], 5, 23, 1, 'cereal', 400, 120),
  ing('galletas de arroz', ['galletitas de arroz','tortitas de arroz'], 8, 81, 3, 'cereal', 50),
  ing('tortilla de trigo', ['wrap','rap','tortilla'], 9, 54, 7, 'cereal', 100),

  // ─── TUBÉRCULOS ───────────────────────────────────────────────────
  ing('papa', ['patata','papa hervida','papas'], 2, 17, 0.1, 'tuberculo', 400, 77),
  ing('batata', ['camote','boniato','batata hervida'], 1.6, 20, 0.1, 'tuberculo', 400, 86),
  ing('mandioca', ['yuca'], 1.4, 38, 0.3, 'tuberculo', 300),

  // ─── LEGUMBRES ────────────────────────────────────────────────────
  ing('lentejas cocidas', ['lentejas','lentejones'], 9, 20, 0.4, 'legumbre', 400, 116),
  ing('garbanzos cocidos', ['garbanzos','garbanzo'], 9, 27, 2.6, 'legumbre', 400, 164),
  ing('porotos negros', ['frijoles','frijoles negros','porotos'], 9, 24, 0.5, 'legumbre', 400, 132),
  ing('porotos colorados', ['alubias','frijoles colorados'], 8, 23, 0.5, 'legumbre', 400, 127),
  ing('soja texturizada', ['carne de soja','soja texturada'], 52, 35, 0.5, 'legumbre', 100),
  ing('tofu', ['tofu firme'], 8, 1.9, 4.8, 'legumbre', 300),

  // ─── FRUTAS ───────────────────────────────────────────────────────
  ing('manzana', ['manzanas','manzana roja','manzana verde'], 0.3, 14, 0.2, 'fruta', 400),
  ing('banana', ['banana madura','plátano'], 1.1, 23, 0.3, 'fruta', 300),
  ing('naranja', ['naranjas'], 0.9, 12, 0.1, 'fruta', 400),
  ing('pera', ['peras'], 0.4, 15, 0.1, 'fruta', 400),
  ing('frutillas', ['frutilla','fresas'], 0.7, 8, 0.3, 'fruta', 400),
  ing('arandanos', ['arándanos','blueberries'], 0.7, 14, 0.3, 'fruta', 200),
  ing('kiwi', ['kiwis'], 1.1, 15, 0.5, 'fruta', 300),
  ing('uvas', ['uva'], 0.7, 18, 0.2, 'fruta', 300),
  ing('ananá', ['anana','piña','ananá'], 0.5, 13, 0.1, 'fruta', 400),
  ing('sandia', ['sandía'], 0.6, 8, 0.2, 'fruta', 500),
  ing('melon', ['melón'], 0.8, 8, 0.2, 'fruta', 500),
  ing('palta', ['aguacate'], 2, 9, 15, 'fruta', 200),

  // ─── VERDURAS ─────────────────────────────────────────────────────
  ing('lechuga', ['hojas verdes','mix de hojas'], 1.4, 3, 0.2, 'verdura', 300),
  ing('tomate', ['tomates','tomate perita'], 0.9, 4, 0.2, 'verdura', 400),
  ing('zanahoria', ['zanahorias','zanahoria rallada'], 0.9, 10, 0.2, 'verdura', 300),
  ing('brocoli', ['brócoli'], 2.8, 7, 0.4, 'verdura', 400),
  ing('espinaca', ['espinacas'], 2.9, 3.6, 0.4, 'verdura', 300),
  ing('zapallo', ['calabaza','zapallo anco','zapallo kabutiá'], 1, 7, 0.1, 'verdura', 400),
  ing('zucchini', ['calabacin','zapallito','zapallito verde'], 1.2, 3.1, 0.3, 'verdura', 400),
  ing('cebolla', ['cebollas'], 1.1, 9, 0.1, 'verdura', 200),
  ing('morron', ['morrón','pimiento','ají'], 1, 6, 0.3, 'verdura', 300),
  ing('pepino', ['pepinos'], 0.7, 3.6, 0.1, 'verdura', 400),
  ing('champignones', ['hongos','champiñones','portobello'], 3, 3.3, 0.3, 'verdura', 300),
  ing('coliflor', ['coliflor fresca'], 1.9, 5, 0.3, 'verdura', 400),
  ing('remolacha', ['remolacha hervida','betabel'], 1.6, 10, 0.2, 'verdura', 300),
  ing('chauchas', ['chauchas verdes','judías verdes','habichuelas'], 1.8, 7, 0.2, 'verdura', 400),

  // ─── GRASAS / ACEITES ─────────────────────────────────────────────
  ing('aceite de oliva', ['aceite de oliva extra virgen','aove'], 0, 0, 100, 'grasa', 30, 884),
  ing('aceite de girasol', ['aceite vegetal','aceite de girasol alto oleico'], 0, 0, 100, 'grasa', 30, 884),
  ing('manteca', ['manteca','mantequilla'], 0.9, 0.1, 81, 'grasa', 30, 717),
  ing('aceite de coco', ['aceite de coco virgen'], 0, 0, 99, 'grasa', 30, 862),

  // ─── FRUTOS SECOS ─────────────────────────────────────────────────
  ing('almendras', ['almendra'], 21, 22, 50, 'fruto_seco', 60),
  ing('nueces', ['nuez','nueces pelada'], 15, 14, 65, 'fruto_seco', 60),
  ing('mani', ['maní','cacahuate','cacahuete'], 26, 16, 49, 'fruto_seco', 60),
  ing('castañas de cajú', ['castaña de caju','anacardos'], 18, 30, 44, 'fruto_seco', 60),
  ing('pistachos', ['pistacho'], 20, 28, 45, 'fruto_seco', 60),
  ing('crema de mani', ['crema de maní','mantequilla de maní','pasta de mani'], 25, 20, 50, 'fruto_seco', 50),

  // ─── SEMILLAS ─────────────────────────────────────────────────────
  ing('chia', ['chía','semillas de chia'], 17, 42, 31, 'semilla', 30),
  ing('lino', ['semillas de lino','linaza'], 18, 29, 42, 'semilla', 30),
  ing('sesamo', ['sésamo','semillas de sesamo','ajonjolí'], 18, 23, 50, 'semilla', 30),
  ing('girasol semillas', ['semillas de girasol','pipas'], 21, 20, 51, 'semilla', 30),
  ing('zapallo semillas', ['semillas de zapallo','semillas de calabaza'], 19, 11, 49, 'semilla', 30),

  // ─── OTROS / SUPLEMENTOS NUTRICIONALES ────────────────────────────
  ing('whey protein', ['proteína de suero','proteina whey','wpc','wpi'], 75, 10, 5, 'otro', 50),
  ing('miel', ['miel de abeja'], 0.3, 82, 0, 'otro', 30, 304),
  ing('dulce de leche', ['dulce de leche light'], 7, 55, 7, 'otro', 30),
  ing('mermelada light', ['mermelada sin azucar','mermelada diet'], 0.5, 30, 0, 'otro', 30),
  ing('cacao en polvo', ['cocoa','cacao amargo'], 20, 58, 14, 'otro', 30),
  ing('edulcorante', ['stevia','sucralosa'], 0, 0, 0, 'otro', 10, 0),
];

// Lookup normalizado
function normalizar(t: string): string {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Construir índice para lookup rápido
const INDICE: Map<string, IngredienteRef> = (() => {
  const m = new Map<string, IngredienteRef>();
  for (const it of INGREDIENTES_DB) {
    m.set(normalizar(it.nombre), it);
    for (const alias of it.aliases) {
      m.set(normalizar(alias), it);
    }
  }
  return m;
})();

/**
 * Busca un ingrediente en la DB. Hace matching exacto + fuzzy por substring.
 * Devuelve null si no se pudo matchear.
 */
export function buscarIngrediente(nombre: string): IngredienteRef | null {
  const n = normalizar(nombre);
  if (!n) return null;

  // Match exacto
  const exacto = INDICE.get(n);
  if (exacto) return exacto;

  // Match por substring: el nombre declarado contiene el canónico o al revés
  // Se prefiere la coincidencia más larga (más específica).
  let mejor: { ref: IngredienteRef; score: number } | null = null;

  for (const [clave, ref] of INDICE.entries()) {
    // clave contenida en la búsqueda (ej "pollo pechuga asada" → "pollo pechuga")
    if (n.includes(clave) && clave.length >= 4) {
      const score = clave.length;
      if (!mejor || score > mejor.score) mejor = { ref, score };
    }
    // búsqueda contenida en la clave (ej "atun" → "atun al natural")
    else if (clave.includes(n) && n.length >= 4) {
      const score = n.length * 0.7; // penalización por match parcial invertido
      if (!mejor || score > mejor.score) mejor = { ref, score };
    }
  }

  return mejor?.ref ?? null;
}
