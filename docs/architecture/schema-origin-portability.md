# Schema origin portability

Tiinex Site should not hard-lock schema support to `Tiinex/docs`. Tiinex/docs remains the canonical core origin, but app-specific viewers need room to ship local or fork-owned schemas.

Rules:

- Schema id is semantic identity; path is only a discovery hint.
- Origins must be explicit when a module is not from the canonical core.
- Unknown schemas should degrade as unresolved module/origin, not as guessed Tiinex/docs material.
- Runtime UI may use viewer-local schemas only when declared by `.workspace.md` or manifest metadata.

This keeps forks modular: a fork can add app schemas, test them locally, and later propose upstream modules without pretending those modules already exist in Tiinex/docs.
