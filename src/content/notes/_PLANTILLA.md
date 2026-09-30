---
# PLANTILLA — no se publica (los archivos que empiezan con "_" se ignoran).
# Para una nota nueva: copia este archivo como src/content/notes/<slug>.md
# (slug en minúsculas, sin acentos, con guiones; será la URL: /notes/<slug>/ y /es/notas/<slug>/).
# Guía: docs/13-notes-editorial-module.md §60 · ADR-008 · ADR-009.

title: "Título de la nota"
lang: es                      # idioma en que está escrita la nota: es | en
summary: "Resumen de una o dos líneas (máx. 320 caracteres). Aparece en la tarjeta y en buscadores."
author: jose-luis-cabellos    # id del integrante en src/content/data/members.yaml
category: readings            # opinion | readings | books
tags: [DFT]                   # opcional
status: draft                 # draft (no se publica) | published | archived
isTest: false                 # true solo para notas de prueba
featured: false               # true = destacada arriba del listado (solo una)
publishedAt: 2026-10-01
# updatedAt: 2026-10-05       # opcional
# cover:                      # opcional; imagen propia o con permiso (nada generado con IA)
#   src: ./covers/mi-imagen.webp
#   alt: "Descripción de la imagen"
# researchAreas: [structure-prediction]   # opcional: ids de src/content/data/research.yaml
# translationOf: slug-de-la-nota-original # solo si esta nota es una traducción
links:                        # opcional
  - title: "Título del artículo o libro"
    url: "https://doi.org/10.xxxx/xxxxx"
    kind: doi                 # doi | publisher | open-access | book | other
    description: "Por qué se recomienda (opcional)."
attachments:                  # opcional; solo PDF con derecho de distribución
  - title: "Nombre visible del archivo"
    file: 2026/nombre-del-archivo.pdf    # dentro de public/files/notes/ (máx. 20 MB)
    rights: author            # open-access | public-domain | author | permission
---

Texto de la nota en Markdown. Los subtítulos empiezan en `##`.
