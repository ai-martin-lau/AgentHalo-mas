# AgentHalo 1.0.7 (10701)

- Replace the SVG companion collection with Codex v2 pet packages, compiled into built-in themes before testing, development launch and packaging. Halo is the default owl; this checkout currently includes only the Halo trial package.
- Reserve localized names for ten companions. Adding a complete package under `pets/<id>/` includes it in the next build.
- Migrate retired character selections and incompatible per-theme variants/overrides to Halo without changing imported pets or saved volume.
- Add completion sound modes: long tasks (at least 30 seconds, default), every task, or off. Measure each session from its first working/thinking event to Stop; confirmation sounds retain existing behavior.
- Set fresh-install volume to 50%.

Validation is recorded in the repository-root `dist/review-10701/result.md`. The development app is built for inspection without launching it. No store upload is performed.
