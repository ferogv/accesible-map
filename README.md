# 🌍 Mapa Colaborativo de Espacios Accesibles

Proyecto académico desarrollado en el curso **Proyecto integrador de la metodología DevOps** en la Universidad Tecmilenio.  
El objetivo es construir una aplicación web colaborativa que permita registrar y consultar espacios públicos con características de accesibilidad, integrando prácticas de **DevOps**, **monitoreo** y **seguridad**.

---

## ✨ Descripción

El sistema permite a cualquier usuario:
- Registrar espacios accesibles (parques, plazas, bibliotecas, etc.).
- Visualizar dichos espacios en un mapa interactivo (Leaflet).
- Filtrar por categoría y características (rampa, baño adaptado, señalización, estacionamiento).
- Consultar estadísticas dinámicas.
- Gestionar accesorios asociados a cada espacio (ej. rampas portátiles, barandales, señalización extra).
- Visualizar detalles de cada espacio con imágenes y lista de accesorios.

Se integraron prácticas de **telemetría**, **monitoreo de métricas** y **DevSecOps** para garantizar calidad, seguridad y trazabilidad.

---

## 🛠️ Tecnologías utilizadas

- **Frontend:** HTML, CSS, JavaScript (ES Modules).
- **Mapas:** [Leaflet.js](https://leafletjs.com/).
- **Backend / Base de datos:** Firebase Firestore.
- **Autenticación:** Firebase Auth (anónima y con proveedores).
- **CI/CD:** GitHub Actions + GitHub Pages.
- **Monitoreo y métricas:** Google Apps Script + Google Sheets + Looker Studio.
- **Pruebas:** Jest (unitarias).
- **Seguridad:** Firestore Rules con RBAC (roles admin/editor/viewer), análisis de vulnerabilidades con npm audit/Snyk, SonarCloud.

---

## 📐 Arquitectura

    Cliente Web (GitHub Pages)
           │
           ├── Firestore (colección spaces, subcolección accessories)
           │
           ├── Firestore (colección logs, counters/global)
           │
           └── Apps Script Web App → Google Sheets (events, metrics_summary)
                                       │
                                       └── Looker Studio / Dashboards

---

## 🚀 Funcionalidades principales

- **Mapa interactivo:** marcadores de espacios, panel de detalle, popup con información.
- **Registro de espacios:** formulario modal con validación de datos.
- **Filtros y búsqueda:** por categoría, características y texto libre.
- **Lista de accesorios:** agregar, eliminar, incrementar/decrementar cantidades.
- **Estadísticas:** totales y por característica, actualizadas dinámicamente.
- **Telemetría:** registro estructurado de eventos en Firestore y réplica en Google Sheets.
- **Métricas y alertas:** agregación periódica de eventos, paneles en Looker Studio, alertas por correo/webhook.
- **Pruebas automatizadas:** validación de la lógica de accesorios con Jest.
- **Seguridad:** autenticación, control de acceso por roles, protección de datos sensibles.

---

## 📊 Monitoreo y retroalimentación

- **Logs:** colección `logs` en Firestore + hoja `events` en Google Sheets.
- **Métricas:** hoja `metrics_summary` con agregaciones por minuto.
- **Visualización:** panel en Looker Studio con gráficos de eventos y métricas.
- **Alertas:** reglas configurables que envían notificaciones por correo o webhook.

---

## 🔒 DevSecOps

- **Análisis de vulnerabilidades:** npm audit, Snyk, SonarCloud.
- **Autenticación y control de acceso:** Firebase Auth + Firestore Rules con roles.
- **Protección de datos sensibles:** cifrado en cliente (Web Crypto) y gestión de secretos en GitHub Secrets / Firebase.

---

## 📈 Próximos pasos

- Migrar el pipeline de métricas a **BigQuery + Cloud Monitoring** para mayor escala.
- Integrar paneles en **Grafana** o **Datadog**.
- Extender autenticación con más proveedores y roles granulares.
- Mejorar la experiencia de usuario con diseño accesible y responsivo.
- Documentar casos de uso y publicar guías de contribución.

---

## 👨‍💻 Autor

**Fernando Gorostieta Vargas**  
Proyecto académico — Universidad Tecmilenio  
Cancún, México

---

## 📄 Licencia

Este proyecto es de código abierto y se distribuye bajo la licencia MIT.
