# Static assets

Repo-committed files live here (PRD §13.2).

- Reference them from the admin panel as `/assets/<filename>` (e.g. `/assets/resume.pdf`).
- Use this for non-image files (PDFs, icons); add with a normal git commit.
- Images can also be uploaded directly from the admin panel (Upload button on any asset
  field) — those are stored in the database (`Media` table) and served at `/api/media/<id>`.
