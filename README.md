# EcoRuta RD

Prototipo académico interactivo de gestión inteligente de residuos. Funciona localmente, sin API, sensores físicos, credenciales ni internet. Los datos, el sistema de visión y el mapa son simulados; las distancias se calculan geográficamente y no son navegación vial.

## Ejecutar

1. Instala Node.js 18 o posterior.
2. Abre una terminal en esta carpeta.
3. Ejecuta `npm run dev`.
4. Visita http://localhost:5173. La plataforma está en `/demo`.

No hay dependencias externas. `npm install` es opcional. Para cerrar el servidor usa Ctrl+C. Puerto configurable mediante la variable de entorno PORT.

## Exposición

Pulsa **Iniciar demostración**. El asistente recorre 12 etapas: depósito, lectura, monitoreo, llenado crítico, alerta, ruta, recolección, clasificación e impacto. Puedes pausar o avanzar. El inicio de una nueva demostración restaura los datos de ejemplo.

## Funciones manuales

- Contenedores: registro, edición, búsqueda, filtros, nivel, peso, conexión, batería y recolección.
- IoT: simulador con visualización y alertas sincronizadas.
- Rutas: selección de dispositivos conectados con llenado de 80% o más, orden por distancia Haversine con comparación contra el orden de registro.
- Clasificación: asignación simulada de lotes PET, HDPE, cartón y no reciclables. Conservación del peso.
- Reportes: historial y descarga CSV.
- Configuración: reinicio de datos. Persistencia mediante LocalStorage.

## Estructura

- `index.html`: entrada web.
- `src/app.js`: interfaz y control de interacción.
- `src/model.js`: reglas, cálculos y estado.
- `src/style.css`: tema claro responsive.
- `assets/bin.svg`: ilustración conceptual del dispositivo.
- `server.mjs`: servidor local Node.
- `test/`: pruebas de reglas.

Ejecuta `npm test` para las pruebas. El proyecto emplea HTML, CSS y JavaScript ES Modules sin dependencias, para garantizar facilidad de ejecución y portabilidad.
