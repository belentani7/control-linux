# PROJECT_MASTER_PROMPT — CONTROL-LINUX — centro seguro de operación de repositorios

**Documento canónico de intención y dirección de producto** · 22/10/2026  
**Repositorio:** `belentani7/control-linux`  
**Regla de lectura:** hechos observados separados de propuestas; este archivo no sustituye el README técnico ni las reglas preexistentes del repositorio.

## 1. ADN del proyecto — qué es y qué no es

- **Producto**: entorno automatizable de operación GitHub/Linux/PowerShell/CLI y navegador, no sistema para publicar sin controles todos los repositorios.
- **Estructura**: `scripts/Control-Repos.ps1`, `scripts/browser-screenshot.js`, `skills/`, `.devcontainer/`, `.github/workflows/`, Playwright y PowerShell 7.
- **Contexto**: infraestructura auxiliar del ecosistema Belentani; su tarea es ejecutar operaciones seguras, repetibles y trazables, no reemplazar proyectos ni decidir su publicidad.

## 2. Norte creativo y tecnológico: máximo potencial

Ser el **plano de control confiable y profesional** para trabajar con cientos de repos: inventario incremental y estable, planes de cambios verificables, tareas en colas limitadas, ejecuciones auditables, reporte por repositorio, recuperación tras error y despliegue solo autorizado.

## 3. Producto ideal y recorrido de usuario

- CLI con verbos explícitos `discover`, `inspect`, `plan`, `apply`, `verify`, `resume`; dry-run por defecto y confirmación para mutaciones de riesgo.
- Registro de cada repo con identidad/canon, rama predeterminada, permisos, archivo, stack, pruebas y estado; resultados `success`, `failed`, `skipped` con motivo y commit.
- Lotes reanudables con idempotencia, checkpoints, límites de concurrencia, ventana de tasa API y respeto por repos archivados.
- Evidencias opcionales con Playwright: URL real, screenshot temporal sin secretos, estado HTTP y enlaces rotos para proyectos publicados.

## 4. Arquitectura y diseño técnico para llegar allí

- PowerShell como motor actual; comandos con `SupportsShouldProcess`, validación de argumentos, módulos testeables y salida JSON estable.
- No almacenar PAT, tokens, cookies, variables de entorno ni artefactos privados en logs o commits. Permisos mínimos y rotación/revocación de credenciales.
- Operaciones de GitHub deben identificar SHA de rama, cambios esperados y estrategia de rollback; no aplicar `force push` ni `visibility=public` en lote.
- Evitar duplicados por paginación o nombres; respetar GUID/ID estable de cada repo y distinguir canónicos, archivos y pruebas.

## 5. Plan de construcción por resultados observables

1. Inspeccionar scripts/skills/workflows y comprobar qué operaciones son reales; eliminar documentación que indique crear un repositorio nuevo como prerequisito de un repos existente.
2. Añadir modo `--dry-run` comprobable, validación de scopes y resultados de error sin secretos.
3. Implementar inventario completo con paginación y recuperación, tests de repos privados/archivados/sin permisos.
4. Agregar jobs reanudables, bloqueo de colisiones y salidas de evidencia mínimas.
5. Incorporar verificación de enlaces públicos y quality gates por proyecto, sin realizar publicaciones indiscriminadas.

## 6. Límites innegociables de este producto

Ninguna acción destructiva global, apertura de repos privados, eliminación de archivos, publicación o cambio de DNS debe ocurrir por defecto ni en una tarea programada sin autorización granular.


## Protocolo obligatorio para el siguiente agente (ejecución, no relato)

> **Instrucción operativa**: Recupera primero la realidad del repositorio y eleva ESTE producto a su máximo potencial sin cambiar su identidad. Este archivo es el canon estratégico y un prompt reutilizable; **no es prueba** de que las funciones aquí propuestas ya existan.

1. Lee `README.md`, directorios de código, configuración, documentación y pruebas. Contrasta el árbol y el código actual con lo declarado aquí. Marca cada capacidad como existente, parcial o futura; nunca presentes ideas como funciones terminadas.
2. Respeta la intención original, licencia, titulares de derechos, público y estilo visual. No crees otro repositorio, una copia sin motivo, un fork de producto ni mezcles productos independientes.
3. Construye verticalmente: cada entrega debe comprender experiencia de usuario, lógica, contenido y persistencia/integraciones reales **solo cuando sean necesarias**, así como control de errores, accesibilidad, seguridad y pruebas. Nunca simules bases de datos, métricas, usuarios ni integraciones.
4. Antes de adoptar proveedor, framework o infraestructura nueva, demuestra la necesidad y el coste de mantenerla. Prefiere las dependencias existentes, contratos estables y componentes reutilizables; ninguna clave de API va al frontend o al repositorio.
5. No borres material histórico o creativo ni modifiques datos personales, secretos, dominios, estado público/privado o despliegues irreversibles sin respaldo y autorización específica. No sustituyas contenido auténtico por texto de relleno.
6. Cambios pequeños y trazables, con pruebas, lint, build y validación manual de los flujos esenciales; documenta la diferencia exacta entre **implementado**, **validado** y **pendiente**.
7. Si un objetivo se opone al valor central de este proyecto, prioriza su identidad sobre la homogeneización del ecosistema. Los vínculos con otros proyectos son integraciones opcionales, no órdenes de fusión.

## Definición de terminado

Un incremento está terminado solo cuando el usuario alcanza el objetivo principal sin pantallas vacías ni navegación rota; el contenido es auténtico y mantenible; el estado de datos es consistente; errores y límites de uso son legibles; privacidad/accesibilidad/seguridad están contempladas; hay pruebas reproducibles y el despliegue, si se anuncia, ha sido comprobado en su URL real. Cada afirmación pública debe estar sustentada por código, datos o evidencia actual.

## Prompt maestro reutilizable

«Actúa simultáneamente como responsable de producto, director de arte, arquitecto de software, desarrollador full-stack, especialista en contenido, accesibilidad y seguridad de **este repositorio**. Relee este canon y el código real antes de intervenir. Detecta la diferencia entre el producto actual y su visión máxima. Elige el siguiente incremento más valioso para el usuario final, constrúyelo de extremo a extremo sobre la estructura existente, prueba lo que afirmas y documenta resultados comprobados y limitaciones. Mantén identidad, trazabilidad y autonomía del proyecto. No conviertas esta visión en otra auditoría sin cambios ni en un rediseño genérico». 
