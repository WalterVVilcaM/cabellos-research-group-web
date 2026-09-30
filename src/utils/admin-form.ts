/** Opciones del editor (autores y líneas) y manejo común de envíos del formulario. */
import { getMembers, getResearch } from './content';
import {
  authors,
  parseForm,
  saveNote,
  validate,
  type FieldErrors,
  type NoteDraft,
} from './admin-notes';

export async function formOptions() {
  const [research, members, rows] = await Promise.all([getResearch(), getMembers(), authors()]);
  const names = new Map(members.map((m) => [m.id, [m.data.academicTitle, m.data.name].filter(Boolean).join(' ')]));
  return {
    research: research.map((r) => ({ id: r.id, label: r.data.shortTitle.es, labelEn: r.data.shortTitle.en })),
    authors: rows.map((a) => ({ id: a.id, label: names.get(a.id) ?? a.id })),
    authorIds: rows.map((a) => a.id),
    researchIds: research.map((r) => r.id),
  };
}

/**
 * Procesa "Guardar" o "Guardar y publicar". Devuelve el id guardado o los errores para
 * volver a mostrar el formulario con lo que el editor escribió.
 */
export async function handleSave(form: FormData, base: NoteDraft, email: string) {
  const parsed = parseForm(form, base);
  const opts = await formOptions();
  const errors: FieldErrors = await validate(parsed, opts.researchIds, opts.authorIds);
  if (Object.keys(errors).length > 0) return { ok: false as const, draft: parsed.draft, errors, opts };
  const publish = form.get('action') === 'publish';
  const saved = await saveNote(parsed, email, publish ? 'published' : undefined);
  return { ok: true as const, id: saved.id, published: publish, uploadError: saved.uploadError };
}
