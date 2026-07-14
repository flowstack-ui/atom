# Playground Versioning And Releases

The Atom playground is a private, repo-only testing application. It has an
independent version line because its workbench, coverage model, and testing
workflow can evolve without an Atom npm release. The playground is never
published to npm.

## Version Sources

- `../package.json` and `../package-lock.json` contain the current playground
  version and must remain synchronized.
- `../CHANGELOG.md` is the canonical playground release history.
- Annotated Git tags identify releases using `playground-v<version>`, such as
  `playground-v1.0.0`.
- Atom package tags continue to use their own tag names, such as `v0.1.0`.

Do not infer the playground version from the Atom package version. Releasing one
does not require releasing the other.

## Version Policy

Use semantic versioning based on contracts relied on by playground testers and
maintainers:

| Version | Use for |
| --- | --- |
| Major | Breaking changes to established testing workflows, workbook or protocol formats, scenario conventions, routes, or inspection contracts. |
| Minor | New scenarios, testing capabilities, inspectors, automation, reviewed protocols, or substantial coverage expansion. |
| Patch | Compatible fixes to scenarios, evidence collection, workbench behavior, documentation, or test instructions. |

Do not bump the version for every playground commit or completed component.
Create a release when a coherent testing milestone is ready to preserve.

## Changelog Policy

Keep ongoing changes in `Unreleased` until a release is intentionally prepared.
Use `Added`, `Changed`, `Fixed`, and `Removed` subheadings when an unreleased or
released section contains enough entries to benefit from grouping.

Record changes that affect how a tester or maintainer uses, understands, or
trusts the playground. Routine refactors with no observable effect do not need
an entry.

Use this ownership model:

| Change | Atom changelog | Playground changelog |
| --- | --- | --- |
| Atom behavior or public API only | Yes | No |
| Scenario update for an existing Atom contract | No | Yes |
| Atom fix with corresponding scenario update | Yes | Yes |
| Meaningful workbook or protocol correction | No | Yes |
| Playground-only refactor with no visible effect | No | No |
| Public component documentation correction | Follow package rules | Only when playground instructions or evidence also change |

A single commit may update both changelogs when it changes both products. Do not
copy Atom release notes into the playground changelog when the playground did
not change.

Use `- No unreleased changes.` only while the section is empty. Remove that line
when the first real entry is added.

## Release Checklist

Run the release from `package/playground/` unless a command says otherwise.

1. Review `Unreleased` and confirm each entry belongs to the playground.
2. Select the next version using the policy above.
3. Run `npm run build`.
4. Confirm affected Manual Test Protocols and workbook statuses reflect the
   release state.
5. Rename the populated `Unreleased` content to the version and release date.
6. Add a new empty `Unreleased` section containing
   `- No unreleased changes.`.
7. Update the version in both `package.json` and `package-lock.json`.
8. From `package/`, review `git diff --check` and the complete release diff.
9. Commit the release as `chore(playground): release vX.Y.Z`.
10. Create an annotated `playground-vX.Y.Z` tag that points to the release
    commit.
11. Verify the tag, commit, changelog heading, and manifest versions agree.

There is no npm publish step. Do not create or move a release tag before the
release commit has passed verification.
