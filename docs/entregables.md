# Entregables: estructura de los documentos, catálogo y listas de compras

## 0. Antes de armar un plan: datos que no pueden faltar

Si el cliente se registró antes del cuestionario v2, en `/admin/cliente/[id]` aparece un aviso amarillo. Pedirle por WhatsApp lo que falte:

```
Antes de armar tu plan necesito 4 datos:
1. ¿En qué horario entrenás? (mañana / mediodía / tarde / noche)
2. ¿Cuántas comidas hacés afuera por semana? ¿Dónde? (parrilla, delivery, comedor del trabajo…)
3. ¿Cuántas veces por semana podés cocinar? (2 / 1 / no cocino)
4. ¿En qué súper comprás?
```

Sin horario confirmado **no se arma** el documento de nutrición, porque de eso dependen las comidas pre y post entreno.

## 1. Documento de Entrenamiento

Plantilla: `docs/plantillas/Plantilla-Entrenamiento.docx`. Se regenera con `npx tsx scripts/generar-plantillas-docx.ts`.

| # | Sección | Qué lleva |
|---|---|---|
| — | Portada | Nombre de la oferta, cliente, objetivo, inicio, semanas, días + horario |
| 1 | Tu objetivo y cuándo lo vas a ver | Resultado soñado (literal), qué se mide, tabla semana 2/4/8/12 |
| 2 | Tu semana | Días + horario. 3 días = FBEOD con DUP; domingo según `disponibilidadDomingo` |
| 3 | Cómo leer tu rutina | Series×reps, RIR, descanso: 4 viñetas |
| 4 | Entrada en calor | 6–8 min, ajustada a lesiones |
| 5 | Tus sesiones | Una tabla por día: ejercicio, series×reps, descanso, RIR, "cómo" en 1 línea + video |
| 6 | Progresión semana a semana | Bloque de 4 semanas: técnica → +reps → +carga → descarga |
| 7 | Checkpoints | Peso promedio, cintura, ejercicio clave, fotos: inicio y semanas 2, 4, 8, 12 |
| 8 | Si pasa algo | Me salteé un día / me duele / no hay máquina / poco tiempo |
| 9 | Check-in semanal | Qué mandar y cuándo (2 min) |
| — | Legales | Disclaimer profesional, descargo, propiedad, datos |

## 2. Documento de Nutrición

Plantilla: `docs/plantillas/Plantilla-Nutricion.docx`.

| # | Sección | Qué lleva | ¿Siempre? |
|---|---|---|---|
| — | Portada | Cliente, objetivo, inicio, horario de entreno | Sí |
| 1 | Tus números | kcal, P/H/G, comidas por día | Sí |
| 2 | Cómo pesar | **Proteína cocida, hidratos crudos** + excepciones (huevos por unidad, latas escurridas, papa/batata cruda pelada, aceite en balanza). Nada de medidas caseras en casa | Sí (ya escrita) |
| 3 | Tu día tipo | Día de entreno y día de descanso, gramajes exactos, **pre y post ubicados por horario** + cambios permitidos | Sí |
| 4 | Suplementación | Suplemento, para qué, cuándo, cuánto, link del catálogo | Sí |
| 5 | Lista de compras | **Una por semana del plan**, por categoría (Proteínas, Carbohidratos, Verduras, Frutas, Lácteos, Almacén, Suplementos), cantidades totales | Sí |
| 6 | Meal prep | 1 o 2 sesiones: orden, cantidades, tiempos, cómo porcionar; tabla heladera/freezer | Sí (tabla ya escrita) |
| 7 | Guía para comer afuera | Por lugar (parrilla, pizzería, sushi, rotisería, delivery, comida rápida, kiosco, comedor) + súper sin cocina + porciones a ojo + cómo ajustar el día | Si come afuera ≥3/semana (ya escrita) |
| 8 | ¿Cómo querés resolver la compra? | Escalera DIY → DWY → DFY con links de WhatsApp y condiciones del DFY | Sí (ya escrita) |
| — | Legales | + aviso de links de afiliado | Sí |

### Pre y post entreno según horario

| Horario | Pre | Post |
|---|---|---|
| Mañana | Algo liviano 60–90 min antes (fruta + yogur) | Desayuno completo |
| Mediodía | Colación de media mañana | Almuerzo |
| Tarde | Merienda 1–2 h antes | Cena (o colación si la cena es más de 2 h después) |
| Noche | Merienda reforzada | Cena con proteína **e** hidratos |

## 3. Flujo de armado de un cliente (paso a paso)

1. Revisar la ficha en el admin. Si hay aviso de datos faltantes, pedirlos (§0).
2. Armar el documento de Entrenamiento y el de Nutrición **fuera de la web**, desde las plantillas.
3. **Suplementos: pedir los links antes de cerrar el documento.**
   1. Listar los suplementos que van en ese plan.
   2. Abrir Chrome con la extensión de Claude y dejar abiertas las páginas de esos productos.
   3. Esperar a que Ian devuelva cada link de afiliado con el nombre del producto.
   4. Cargar cada link en `/admin/suplementos` (marca + link + precio) y tocar **Publicado**.
   5. En el documento, usar **"Copiar link para el documento"**. Ese link pasa por `/suplementos/ir/<slug>?o=documento` y cuenta el clic.
4. Pegar las listas de compras de cada semana en `/admin/cliente/[id]/compras` y tocar **Enviar**.
5. Exportar a PDF o DOCX y subirlos en Archivos del cliente; marcar los componentes como entregados.

## 4. Solapa "Suplementos" (catálogo)

- **Pública:** `/suplementos`, con link en el header y el footer.
  - Solapas por objetivo: Todos · Ganancia muscular · Pérdida de grasa · Rendimiento · Salud general (`?objetivo=…`).
  - Ficha de cada producto: nombre, marca, objetivos, **para qué sirve**, **a quién se lo recomendamos**, **cómo se usa (según etiqueta)**, precio aproximado y botón "Ver producto".
  - Arriba, un aviso fijo: links de afiliado, elegidos por eficiencia y precio-calidad, no reemplazan una consulta médica.
  - Solo se muestra un producto si está **activo y tiene link**. Si no hay ninguno, la página invita a consultar por WhatsApp.
- **Tracking:** `/suplementos/ir/<slug>?o=catalogo|documento|mail` guarda el clic en `SuplementoClick` y redirige al link de afiliado (mismo esquema que skincare: producto + link + clics). Si el producto no está activo, redirige al catálogo.
- **Admin:** `/admin/suplementos` permite:
  - alta y edición de productos;
  - pegar marca, link y precio (queda registrada la fecha de relevamiento);
  - publicar u ocultar (no deja publicar un producto sin link);
  - ver clics de los últimos 30 días;
  - copiar el link para los documentos.
- **Contenido:** sale del research de Ian (`src/lib/suplementos/catalogo.ts` + `content/suplementos/research.md`). Los slugs de la tabla son los ids de ese archivo.
  - **Lo básico:** balanza de cocina, balanza personal, cinta métrica, shaker y botella. La balanza va primero: sin ella el plan es una estimación.
  - **Nivel 1:** creatina, whey, omega-3, vitamina D3.
  - **Nivel 2:** colágeno + vitamina C, magnesio, electrolitos, beta-alanina.
  - **Lo que no recomendamos:** BCAA, glutamina, tribulus, L-carnitina. Sección fija al pie del catálogo, sin links.
  - Cada ficha muestra el nivel de evidencia y las fuentes (desplegable).
- **Links pendientes:** checklist en `content/suplementos/links-afiliados.md`. Todo arranca oculto hasta que tenga link.

## 5. Listas de compras por mail (interno)

```
Documento de Nutrición (fuera de la web)
        │  copiar la lista de cada semana
        ▼
/admin/cliente/[id]/compras ── pegar texto ── vista previa ── Guardar semana N
        │                                        (ShoppingList userId+semana,
        │                                         ShoppingListItem por producto)
        ▼
"Enviar semana N" / "Enviar todas"  ──►  mail "Semana N: tu lista de compras"
                                            ├─ tabla por categoría (☐ producto · cantidad)
                                            ├─ nota de Ian (opcional)
                                            ├─ link al catálogo si hay suplementos
                                            └─ escalera: Hacelo vos / Lo hacemos juntos / Lo hago por vos
```

Formato para pegar (el mismo que va en el documento):

```
PROTEÍNAS
Pechuga de pollo 1400 g
Huevos 12 unidad
ALMACÉN
Aceite de oliva 250 ml
```

- Si una línea no se entiende, la vista previa la marca en rojo y no deja guardar.
- "Copiar semana anterior" sirve para armar la siguiente semana rápido.
- Queda registrado cuándo se envió cada semana.
- El cliente no ve las listas en la web: le llegan solo por mail.
