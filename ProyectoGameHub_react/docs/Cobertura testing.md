# Documento de cobertura de testing — GameHub Store

Evaluación Parcial 2, Desarrollo FullStack II (DSY1104).

## 1. Alcance cubierto

Se prueban las funciones de lógica, los componentes React y las reglas de negocio de las seis vistas del frontend. Quedan fuera de la medición `src/main.jsx` (punto de entrada) y `src/data/` (datos estáticos).

| Capa | Elementos probados |
|---|---|
| Utilidades (`src/utils`) | Validadores, formato de precios, vigencia de cupones, lectura y escritura de `localStorage` |
| Componentes (`src/components`) | `FormField`, `ProductCard`, `CategoryCarousel`, `Layout` |
| Contexto (`src/context`) | `CartContext`: agregar, acumular, actualizar, eliminar, cupones con tope, persistencia y órdenes |
| Páginas (`src/pages`) | Inicio, Catálogo, Detalle de producto, Carrito, Checkout y Mis órdenes |

## 2. Herramientas y entorno

| Elemento | Detalle |
|---|---|
| Framework de pruebas | Jasmine (`jasmine-core`, `karma-jasmine`) |
| Ejecutor | Karma 6 en Chrome Headless (`karma-chrome-launcher`); detecta Chrome, Brave, Edge o Chromium |
| Empaquetado de pruebas | webpack 5 + `babel-loader` (`@babel/preset-react`) |
| Cobertura | `babel-plugin-istanbul` + `karma-coverage` |
| DOM de componentes | `@testing-library/react` |
| Configuración | `karma.conf.cjs`, `.babelrc.test.json`, `test/index.js` |

Ejecutar: `npm test` (genera el reporte HTML en `coverage/index.html`).

## 3. Casos diseñados

Las 104 pruebas se organizan en un archivo por unidad. Estos son los casos principales, con la lógica o el comportamiento que verifican:

| N° | Caso | Archivo | Qué verifica |
|---|---|---|---|
| 1 | Subtotal y total del carrito | `CartContext.spec.jsx` | `calcula subtotal por línea y total` |
| 2 | Acumulación de cantidad | `CartContext.spec.jsx` | `addToCart` suma al producto existente en vez de duplicar la línea |
| 3 | Límite de stock | `ProductDetailPage.spec.jsx`, `CartPage.spec.jsx` | Rechaza cantidades mayores al stock y deshabilita `+` al llegar al máximo |
| 4 | Cupón con tope | `CartContext.spec.jsx` | `applyCoupon` calcula el porcentaje y respeta el tope definido |
| 5 | Vigencia de cupón | `coupons.spec.js` | Acepta cupón vigente y rechaza inexistente, vencido o aún no vigente |
| 6 | Persistencia del carrito | `CartContext.spec.jsx` | `persiste el carrito en localStorage` y descarta productos que ya no existen en el catálogo |
| 7 | Tarjeta de producto | `ProductCard.spec.jsx` | Muestra nombre, imagen con `alt`, precio con descuento y la insignia "Sin stock" solo con stock 0 |
| 8 | Carrito vacío | `CartPage.spec.jsx` | Muestra el mensaje de carrito vacío con enlace al catálogo |
| 9 | Checkout | `CheckoutPage.spec.jsx` | Errores en campos vacíos, teléfono `+569` con 8 dígitos y botón deshabilitado con carrito vacío |
| 10 | Reseñas | `ProductDetailPage.spec.jsx` | `ReviewList` calcula el promedio y ordena de la más reciente a la más antigua |

Casos de comportamiento adicionales: menú móvil de `Layout`, avance automático y pausa del carrusel, filtros y paginación del catálogo, reseña solo con pedido entregado y garantía con plazo de 30 días.

## 4. Resultados obtenidos

Ejecución del 19-10-2026 con `npm test` en Chrome Headless 155 (Windows 10): **104 de 104 pruebas correctas, 0 fallidas**, en 0.271 s.

| Métrica | Cobertura |
|---|---|
| Sentencias | 94.21% (440/467) |
| Ramas | 85.41% (205/240) |
| Funciones | 92.61% (163/176) |
| Líneas | 96.6% (370/383) |

**Análisis:** las ramas son la métrica más baja (85.41%). Las brechas están en los validadores, el catálogo y el detalle de producto, donde quedan combinaciones de filtros y casos límite sin probar. La salida solo muestra dos avisos de React Router v6 sobre banderas de la versión 7; no son fallos y no afectan los resultados.

## 5. Cobertura por archivo

| Archivo | Sentencias | Ramas | Funciones | Líneas |
|---|---|---|---|---|
| `src/components/CategoryCarousel.jsx` | 100% | 90% | 100% | 100% |
| `src/components/FormField.jsx` | 100% | 100% | 100% | 100% |
| `src/components/Layout.jsx` | 100% | 100% | 100% | 100% |
| `src/components/ProductCard.jsx` | 100% | 100% | 100% | 100% |
| `src/components/TikTokEmbed.jsx` | _actualizar_ | _actualizar_ | _actualizar_ | _actualizar_ |
| `src/context/CartContext.jsx` | 98.7% | 87.5% | 96.96% | 100% |
| `src/context/ReviewsContext.jsx` | 94.44% | 75% | 100% | 100% |
| `src/pages/CartPage.jsx` | 96.87% | 91.66% | 100% | 100% |
| `src/pages/CatalogPage.jsx` | 86.66% | 75% | 76.19% | 97.82% |
| `src/pages/CheckoutPage.jsx` | 90.24% | 94.44% | 86.66% | 91.42% |
| `src/pages/HomePage.jsx` | 100% | 100% | 100% | 100% |
| `src/pages/OrdersPage.jsx` | 97.1% | 89.18% | 100% | 98.38% |
| `src/pages/ProductDetailPage.jsx` | 94% | 76.92% | 82.35% | 95% |
| `src/utils/coupons.js` | 100% | 100% | 100% | 100% |
| `src/utils/format.js` | 100% | 100% | 100% | 100% |
| `src/utils/storage.js` | 90.9% | 100% | 100% | 90.9% |
| `src/utils/validators.js` | 85.71% | 82.14% | 88.88% | 84.61% |

## 6. Pruebas por archivo

| Archivo de pruebas | N° de pruebas |
|---|---|
| `test/components/CategoryCarousel.spec.jsx` | 6 |
| `test/components/FormField.spec.jsx` | 4 |
| `test/components/Layout.spec.jsx` | 4 |
| `test/components/ProductCard.spec.jsx` | 3 |
| `test/context/CartContext.spec.jsx` | 11 |
| `test/pages/CartPage.spec.jsx` | 12 |
| `test/pages/CatalogPage.spec.jsx` | 6 |
| `test/pages/CheckoutPage.spec.jsx` | 10 |
| `test/pages/HomePage.spec.jsx` | 3 |
| `test/pages/OrdersPage.spec.jsx` | 10 |
| `test/pages/ProductDetailPage.spec.jsx` | 8 |
| `test/utils/coupons.spec.js` | 4 |
| `test/utils/format.spec.js` | 3 |
| `test/utils/storage.spec.js` | 5 |
| `test/utils/validators.spec.js` | 15 |

## 7. Uso de mocks y dobles de prueba

| Mock | Para qué |
|---|---|
| `mockLocalStorage()` (`spyOn(Storage.prototype, ...)`) | Aislar cada prueba del almacenamiento real y poder inspeccionar lo guardado |
| `jasmine.clock().mockDate()` | Fijar la fecha para probar cupones vigentes o vencidos y garantías |
| `jasmine.clock().install()` | Controlar el `setInterval` del carrusel |
| `spyOn(window, "confirm" / "alert" / "scrollTo")` | Simular diálogos del navegador sin bloquear la prueba |
| `spyOn(console, "error")` | Verificar el manejo de errores de almacenamiento sin ensuciar la salida |
| `MemoryRouter` + providers reales | Probar páginas con navegación sin depender de la URL del navegador |

## 8. Proceso de testeo aplicado
ento
1. **Configuración del entorno:** Karma empaqueta las pruebas con webpack y Babel, y las ejecuta en Chrome Headless con Jasmine.
2. **Escritura:** una prueba por comportamiento, con nombre descriptivo, en una carpeta `test/` que replica la de `src/`.
3. **Aislamiento:** dobles de prueba para `localStorage`, diálogos del navegador, temporizadores y fecha.
4. **Análisis:** reporte HTML de `karma-coverage` en `coverage/index.html`, revisado por archivo para detectar ramas sin cubrir.
5. **Orden aleatorio:** `client.jasmine.random: true` detecta pruebas que dependen unas de otras.