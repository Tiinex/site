# Schema Module Projection

The web app projects Tiinex schema artifacts into app-readable schema modules. The source artifact remains the `.schema.md` snapshot, the binding is `.schema.json`, and the executable projection is `.schema.js` or future `.schema.ts`.

A schema module does not change the schema it references and does not prove validity by existing. It declares what this app can safely validate, present, create, edit, or degrade for that schema family.

Root is abstract envelope/fallback. Topic, preservation, and evidence are concrete core artifact schemas. Evidence depends on preservation semantics.
