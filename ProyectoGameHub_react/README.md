# GameHub Store (React)

Frontend de la tienda gamer GameHub Store, migrado de HTML/CSS/JS a **React 18** con **Vite**, **React Router** y **Bootstrap 5.3** (tema oscuro, diseño responsivo). Proyecto semestral de Desarrollo FullStack II (DSY1104), Evaluación Parcial 2.

## Integrantes

| Nombre | Rol / aporte principal |
| --- | --- |
| _Integrante 1_ | _Emily Pacheco_ |
| _Integrante 2_ | _Benjamin Leiva_ |

## Requisitos previos

- **Node.js 20 LTS o superior** y npm.
- Para las pruebas: un navegador basado en Chromium instalado (**Chrome, Brave, Edge o Chromium**). Karma lo detecta solo; si no lo encuentra, define la variable `CHROME_BIN` con la ruta del ejecutable.

## Ejecución

Desde la carpeta del proyecto (donde está `package.json`):

```bash
npm install
npm run dev
```

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción |
| `npm test` | Pruebas unitarias (Jasmine + Karma) y reporte de cobertura |

## Rutas

| Ruta | Vista |
| --- | --- |
| `/` | Inicio: banner, categorías, destacados y video |
| `/catalogo` | Catálogo con filtros y orden (`?categoria=Notebooks`) |
| `/producto/:id` | Detalle de producto y reseñas |
| `/carrito` | Carrito y cupones |
| `/checkout` | Datos de despacho, pago simulado y confirmación |
| `/ordenes` | Mis órdenes, reseñas y garantías |

## Estructura de carpetas

```
.
├── docs/            COBERTURA_TESTING.md
├── public/          favicon e imágenes de productos
├── src/
│   ├── components/  Layout, ProductCard, CategoryCarousel, TikTokEmbed, FormField
│   ├── context/     CartContext (carrito, cupón, órdenes), ReviewsContext
│   ├── data/        catalog.js (categorías y productos simulados)
│   ├── pages/       una página por ruta
│   ├── utils/       format, validators, coupons, storage
│   ├── App.jsx      definición de rutas
│   ├── main.jsx     punto de entrada y providers
│   └── styles.css   paleta y ajustes sobre Bootstrap
├── test/            pruebas unitarias (espejo de src/)
├── karma.conf.cjs   configuración de Karma
└── vite.config.js
```

## Paleta de colores

Paleta 4, "Neón de tienda". Se declara una sola vez como variables CSS en `src/styles.css` y alimenta las variables de Bootstrap.

| Fondo | Superficie | Primario | Acento | Texto | Error |
| --- | --- | --- | --- | --- | --- |
| `#120E1A` | `#1E1730` | `#D6236A` | `#00D2FF` | `#F3EFFA` | `#FF7A7A` |

## Bootstrap y diseño responsivo

`bootstrap` se importa en `src/main.jsx`. La grilla (`container`, `row`, `col-*`), `navbar`, `card`, `table-responsive`, `form-control`, `btn`, `alert`, `badge`, `list-group` y `carousel` resuelven la adaptación a 360, 768 y 1280 px. `src/styles.css` solo aporta los colores de marca y los detalles que Bootstrap no cubre.

## Pruebas unitarias (Jasmine + Karma)

```bash
npm test
```

Ejecuta las pruebas de `test/` en Chrome Headless y genera el reporte de cobertura en `coverage/index.html` (carpeta ignorada por Git). Detalle de alcance, casos y resultados en [`docs/COBERTURA_TESTING.md`](docs/COBERTURA_TESTING.md).

## Datos y configuración

Los datos provienen de estructuras simuladas en JavaScript (`src/data/catalog.js`); el carrito, las órdenes y las reseñas se guardan en `localStorage`. El repositorio no contiene credenciales, tokens ni claves.