# OpenLJS Plugin System — Design

This document specifies the plugin architecture for OpenLJS. It is modeled on OJS 3.2's
plugin system (`plugins/`, `lib/pkp/classes/plugins/`) but re-expressed in Laravel/Inertia
idioms and fitted to the modular-monolith conventions in `CLAUDE.md`. It supersedes the
one-paragraph "Plugins Module" sketch in `ARCHITECTURE.md` and the "replace hooks with
Events & Listeners" note in `laravel_journal_design.md` — both were directionally right but
pre-dated the current module conventions and undersold what a hook system needs to do.

No code exists yet. `app/Modules/Plugins/routes.php` is a 0-byte dead stub (see `CLAUDE.md`) —
this is the real implementation plan for that module.

## 1. What OJS does, and what we keep vs. drop

OJS's plugin system has three moving parts:

1. **Categories** — 10 extension points (`blocks`, `gateways`, `generic`, `importexport`,
   `metadata`, `oaiMetadataFormats`, `paymethod`, `pubIds`, `reports`, `themes`), each with an
   abstract base class a concrete plugin must extend.
2. **`Hook`** — a global, synchronous, string-keyed pub/sub registry (`Hook::add($name, $cb)`,
   `Hook::call($name, $args)`) with priority buckets and short-circuit (`ABORT`) support.
   Core code is sprinkled with `Hook::call('Some::point', [...])` calls that plugins attach to.
3. **`PluginRegistry`** — discovers plugins by scanning `plugins/<category>/*` on disk (install
   time) or reading an "enabled products" table (runtime), instantiates by class-name
   convention, and caches per-context (site vs. journal) enable/disable state via
   `PluginSettingsDAO`.

What we keep: the category model (typed extension points, not one big bag), the
site-vs-journal-scoped enable/disable + settings pattern, and the manifest-driven metadata
(name/version/entry class) instead of hardcoding a plugin list in PHP.

What we drop: directory-scan-and-`include()` discovery, and the assumption that "install" means
"unzip into a folder the web server can write to." OpenLJS runs on Composer/PSR-4; plugins are
Composer packages, discovered via manifest + explicit registration, not filesystem globbing at
every boot.

## 2. The hook backbone (new core infrastructure)

**This does not exist in OpenLJS today.** Grep confirms it: none of the workflow `Services/`
(`SubmissionWorkflowService`, `EditorAssignmentService`, `EditorialDecisionService`,
`ReviewService`) dispatch Laravel events — they call the `Notification` facade directly. The
plugin system is what introduces an event/hook backbone to this codebase; it isn't retrofitting
one that's already there.

`laravel_journal_design.md` proposed replacing OJS hooks with plain Laravel Events &
Listeners. That's right for **action hooks** ("something happened, react to it") but Laravel's
`event()` dispatch doesn't cleanly support **filter hooks** ("here's a value, plugins may
transform it, I need the result back") — OJS uses both. Rather than force filters through
Laravel's fire-and-forget event dispatcher, `Core` gets a small synchronous hook registry
alongside real Laravel events:

```
app/Modules/Core/Services/HookRegistry.php   # add()/call()/filter(), priority buckets
app/Modules/Core/Facades/Hook.php            # Hook::action(...) / Hook::filter(...)
```

- `Hook::listen(string $name, callable $listener, int $priority = 256): void` — registers a
  listener (OJS's `Hook::add`). Called from a plugin's `boot()`.
- `Hook::action(string $name, ...$args): void` — calls every registered listener, ignores
  return values. Used for "submission was published", "review was submitted", etc.
- `Hook::filter(string $name, mixed $value, ...$args): mixed` — pipes `$value` through every
  registered listener in priority order, each returning the (possibly modified) value, seeded
  from the previous listener's output. Used for "here's the article metadata array before it's
  serialized to the OAI/DC response — plugins may add fields."

(An earlier draft of this doc conflated registration and firing under one `Hook::action(name,
closure)` call, mirroring OJS's overloaded naming too closely. The shipped implementation
—`app/Modules/Core/Services/HookRegistry.php`— splits them, matching OJS's own `add`/`call`
split without the ambiguity.)

This is registered as a singleton in `AppServiceProvider`, not a new Laravel Event class per
hook point — a fixed catalog of hook-point classes would mean every new extension point requires
a core code change and a composer bump for every plugin author, which is exactly the friction
OJS's string-keyed hooks avoid. Hook **names** are still a first-class, documented contract
(see §5) — "stringly typed" here means *extensible*, not *undocumented*.

Existing workflow `Services/` get hook points added at their key transitions (see §5); this is
the only change to already-built modules this design requires — everything else is additive.

## 3. Plugin categories

OJS's 10 categories, mapped to what they'd actually extend in OpenLJS today (or explicitly
deferred because the underlying module doesn't exist yet):

| OJS category | OpenLJS mapping | Status |
|---|---|---|
| `generic` | Catch-all — subscribes to `Hook::action`/`Hook::filter` points anywhere. Most plugins (DOI registration, analytics, third-party integrations) are this. | Phase 1 |
| `blocks` | Sidebar/homepage content blocks on public `/j/{journal:slug}` pages (`AppLayout.jsx` gains a block-rendering slot). | Phase 1 |
| `gateways` | Custom public URL endpoints, same shape as `Feeds`/`Oai` controllers (a plugin-owned route under `/j/{journal:slug}/plugin/{name}/...`). | Phase 1 |
| `importexport` | Bulk import/export for `Submissions`/`Issues` (OJS native XML, DOAJ, PubMed equivalents). | Phase 2 |
| `oaiMetadataFormats` | Additional metadata formats for the `Oai` module, which currently only emits Dublin Core. | Phase 2 |
| `metadata` | Metadata schema plugins feeding `Issues`/`Feeds`/`Oai` serialization via `Hook::filter`. | Phase 2 (mostly subsumed by `generic` + filter hooks — may not need to be a distinct category) |
| `reports` | Extends `Metrics` with custom report views/exports. | Phase 2 |
| `themes` | Swappable layout/styling for public journal pages. | Phase 3 — real risk of colliding with the Tailwind v4 build pipeline; needs its own spike |
| `paymethod` | Payment gateways for article processing charges. | Deferred — no `Payments`/subscriptions module exists yet (`FEATURES.md` §3.5 is still unbuilt) |
| `pubIds` | DOI/URN identifier assignment. | Deferred — no identifier-assignment module exists yet; this is the most-requested plugin in practice (Crossref/DataCite), so likely the first Phase 2 candidate once a minimal `Identifiers` concept exists |

Each category gets a PHP interface (not an abstract class with template methods like OJS's
`Plugin` — Laravel/PSR-4 favors composition over the deep inheritance chain OJS uses):

```
app/Modules/Plugins/Contracts/PluginInterface.php       # every plugin: name, version, boot()
app/Modules/Plugins/Contracts/GenericPluginInterface.php
app/Modules/Plugins/Contracts/BlockPluginInterface.php   # render(Journal $journal): string
app/Modules/Plugins/Contracts/GatewayPluginInterface.php # routes(): array
```

`boot()` is where a plugin registers its `Hook::action`/`Hook::filter` listeners — the
equivalent of OJS's `Plugin::register()`.

## 4. Distribution, discovery, and lifecycle

Plugins are **Composer packages** installed into `plugins/<category>/<name>/`, each with:

```
plugins/generic/crossref-doi/
├── composer.json          # name, version, PSR-4 autoload, require (openljs/plugin-contracts)
├── plugin.json            # {"category": "generic", "class": "CrossrefDoiPlugin", "displayName": ..., "description": ...}
├── src/CrossrefDoiPlugin.php
├── database/migrations/   # plugin's own migrations, run via --path
└── resources/js/          # optional Inertia pages/components the plugin contributes
```

`plugin.json` replaces OJS's `version.xml` — same purpose (declarative metadata so the registry
doesn't have to guess a class name), JSON instead of a DTD-validated XML file to match the rest
of the stack.

Discovery is **explicit, not filesystem-scanned on every request**: `composer require` +
`php artisan plugin:discover` registers the plugin (reads `plugin.json`, upserts a row in the
`plugins` table). Runtime only ever queries the DB for enabled plugins — same
disk-at-install-time / DB-at-runtime split as `PluginRegistry::_loadFromDisk` vs.
`_loadFromDatabase`, without needing a request-time `FilesystemIterator` scan.

Artisan commands (mirroring OJS's install/enable/disable/settings-install flow):

```
php artisan plugin:discover            # scan plugins/, register new ones in DB (disabled by default)
php artisan plugin:enable {name} [--journal=]
php artisan plugin:disable {name} [--journal=]
php artisan plugin:migrate {name}      # run the plugin's own migrations
```

## 5. Data model

```
plugins
  id, name (unique, e.g. "crossref-doi"), category, class, version,
  is_site_wide (bool), created_at, updated_at

plugin_settings
  id, plugin_id (fk), journal_id (fk, nullable — null = site-wide), key, value, created_at, updated_at
  unique(plugin_id, journal_id, key)

plugin_enablements
  id, plugin_id (fk), journal_id (fk, nullable — null = site-wide), enabled (bool)
  unique(plugin_id, journal_id)
```

This is the `PluginSettingsDAO` `(contextId, pluginName, key)` model, made relational instead of
a flat table, and split enablement from settings (OJS conflates "enabled" into
`plugin_settings` as a magic `enabled` key — keeping it a real column avoids that). `journal_id
= null` is the site-wide row, same convention `Setting` already uses implicitly (there's no
per-journal `Setting` today; this module is what introduces the journal-scoping dimension).

The `Plugin` model carries `getSetting(string $key, mixed $default = null, ?int $journalId =
null)` / `putSetting(string $key, mixed $value, ?int $journalId = null)` instance methods, same
shape in spirit as `Setting::get()`/`Setting::set()` in the `Settings` module. A journal-scoped
`getSetting()` falls back to the site-wide row when there's no per-journal override, then to
`$default` — a plugin author sets one site-wide default and only needs a per-journal write for
the journals that actually need to differ.

## 6. Authorization

Follows the existing pattern exactly: a `manage-plugins` global permission (seeded in
`RolesSeeder`, granted to `super-admin` and `journal-manager`), checked via
`$request->user()->can('manage-plugins')` in the controller, same as `manage-system` in
`SettingsController`. Per-journal enable/disable for journal-scoped plugins carries the same
caveat already documented for `JournalPolicy`: `manage-plugins` is global, not verified against
`journal_user_roles` — a `journal-manager` for Journal A can currently toggle a plugin for
Journal B. Flag this consistently with the rest of the codebase rather than solving journal
-scoped authorization here as a side effect of an unrelated feature.

## 7. Admin UI

`app/Modules/Plugins/Controllers/PluginController.php` → `Inertia::render('Plugins/Index', ...)`,
listing plugins grouped by category with enable/disable toggles (site-wide list) and, from each
journal's `Journals/Edit` page, a new "Plugins" tab scoped to that journal — same
add/toggle-only pattern as `SectionsTab`/`EditorialTeamTab`/`CategoriesTab`. A settings action
per plugin opens a modal (OJS's `AjaxModal` equivalent — just an Inertia modal component) that
renders a form driven by the plugin's own declared settings schema (plugin ships a small
JSON schema or an Inertia component; keeping this pluggable, not just a `<textarea>`, is what
made OJS's `SettingsForm.php`-per-plugin pattern usable in practice — a plugin needing a
dropdown or file upload shouldn't be stuck with a raw key/value editor).

## 8. Worked example: a generic plugin (built — the Phase 1 proof case)

`plugins/generic/crossref-doi/` — a real, working `generic` plugin, not a sketch. It:

- Generates a DOI from a per-journal pattern (`%p/%j.v%vi%i.%a`) when an issue is published, if
  the article doesn't already have one (`src/Services/DoiGenerator.php`).
- Queues a Crossref XML deposit (`src/Jobs/DepositCrossrefDoiJob.php` + `src/Support/
  DepositXmlBuilder.php`) — skips the actual HTTP call and records `status: skipped` when no
  credentials are configured for that journal, so the plugin is safe to enable without a live
  Crossref account.
- Tracks deposit state in its own table (`crossref_doi_deposits`, via its own migration under
  `plugins/generic/crossref-doi/database/migrations/`, run with `php artisan plugin:migrate
  crossref-doi`) — not a core schema change, per §1's "no pubIds category yet" call.

```php
// plugins/generic/crossref-doi/src/CrossrefDoiPlugin.php
class CrossrefDoiPlugin implements GenericPluginInterface
{
    public function boot(): void
    {
        Hook::listen('Issues::PublishingService::afterPublish', [$this, 'onArticlePublished']);
        Hook::listen('Oai::DublinCore::fields', [$this, 'addCrossrefRelation']);
    }

    public function onArticlePublished(Article $article): void
    {
        // ...generate $article->doi from this journal's doi_prefix setting if unset...
        DepositCrossrefDoiJob::dispatch($article->id, $article->doi)->afterCommit();
    }

    public function addCrossrefRelation(array $fields, Article $article): array
    {
        // ...append a dc:relation only once Crossref has confirmed the deposit...
        return $fields;
    }
}
```

The two hook points this needed (`Issues::PublishingService::afterPublish`,
`Oai::DublinCore::fields`) are now real: `PublishingService::publishIssue()` fires the action
per-article, and `OaiController::articleRecord()` was refactored from a fixed heredoc into a
filterable `$fields` array (`dublinCoreFields()` builds the default set — including the
pre-existing "use `articles.doi` if set" behavior, unchanged — `renderDublinCoreFields()` renders
whatever the filter chain returns). Both changes are additive: an install with the plugin
disabled produces byte-identical OAI output to before this plugin existed.

Autoloading is currently a single explicit PSR-4 entry in the root `composer.json`
(`OpenLJS\Plugins\CrossrefDoi\` → `plugins/generic/crossref-doi/src/`), not a real Composer
path-repo dependency — the plugin's own `composer.json` is metadata only for now. Graduating to
one `path` repository per plugin (so `composer require` pulls it in like any package) is a
mechanical follow-up, not a design change.

## 9. Hook catalog (seed list — grows on demand, not speculatively)

| Hook | Type | Fires |
|---|---|---|
| `Submissions::WorkflowService::afterSubmit` | action | new submission created |
| `Editorial::DecisionService::afterDecision` | action | editor records a decision |
| `Reviews::ReviewService::afterReviewSubmitted` | action | reviewer submits a review |
| `Issues::PublishingService::afterPublish` | action | an issue/article is published |
| `Oai::DublinCore::fields` | filter | before Dublin Core XML serialization |
| `Feeds::item` | filter | before an RSS/Atom `<item>`/`<entry>` is serialized |

## 10. Phasing

1. **Phase 1 — done.** `Core` hook registry, `plugins`/`plugin_settings`/`plugin_enablements`
   tables, `generic`/`blocks`/`gateways` categories, artisan lifecycle commands (`plugin:discover`
   /`enable`/`disable`/`migrate`), admin UI (site-wide list only, no per-journal tab yet), and the
   Crossref DOI plugin (§8) as the end-to-end proof case. `blocks`/`gateways` have contracts but
   no shipped plugin yet — first real consumer TBD.
2. **Phase 2** — per-journal enable/settings UI (`Journals/Edit` "Plugins" tab),
   `importexport`/`oaiMetadataFormats`/`reports`/`metadata` categories, expand the hook catalog
   as those categories' first real plugins are built.
3. **Phase 3** — `themes` (needs a Tailwind/Vite build-pipeline spike first),
   `paymethod`/`pubIds` (blocked on a `Payments`/identifiers module that doesn't exist yet — do
   not build these categories speculatively ahead of the modules they'd extend).

## Non-goals

- A public plugin gallery/marketplace (OJS's `PluginGalleryDAO`). Composer + a private/public
  package registry already solves distribution; don't rebuild it.
- Hot-swap install-without-redeploy (upload a zip through the admin UI while the app is running).
  OJS supports this because PKP predates Composer-first PHP deployment; OpenLJS plugins are
  Composer dependencies, installed the same way the app itself is deployed.
- Theme marketplace / theme inheritance chains (OJS `ThemePlugin::$parent`). Out of scope until
  Phase 3 even establishes a single custom theme working.
