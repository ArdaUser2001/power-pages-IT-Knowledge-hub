# WFW IT Knowledge Hub for Microsoft Power Pages

An internal knowledge base for Watson Farley & Williams (WFW), built specifically for Microsoft Power Pages and Dataverse. The site gives IT staff a clean, searchable catalogue of internal troubleshooting guides, how-tos, configuration notes, and onboarding procedures.

## What is included

- Dashboard and article cards with category, tags, author, updated date, status, and views
- Search across title, summary, tags, and article body
- Category, tag, and status filters
- Recent, most-viewed, and alphabetical sorting
- Full rich article view with headings, lists, links, images, tables, and code blocks
- Create and edit forms with Draft, Published, and Needs Review states
- View counting
- Power Pages web-role separation:
  - `KB Admin`: create, edit, delete, and publish
  - `KB Viewer`: read published articles
- Responsive dark sidebar and restrained WFW green accent

## Important: this is a Power Pages source package

The files are not a separate React or Node application. They are the HTML/Liquid, CSS, and JavaScript source to paste into the corresponding areas of your firm's Power Pages site.

The Dataverse publisher prefix in this repository is `cr4b3_`. If the WFW environment uses another prefix, replace every `cr4b3_` occurrence in the copied files with the prefix used by your Dataverse solution.

## Dataverse setup

Create these tables and columns before copying page code.

### KB Category (`cr4b3_kbcategory`)

| Display name | Logical name | Type |
|---|---|---|
| Name | `cr4b3_name` | Text, primary name |

Seed these records:

1. Hardware
2. Network
3. Software
4. Access & Accounts
5. Troubleshooting
6. Onboarding/Offboarding
7. Other

Admins can add further category records in Dataverse. They appear automatically in the site filters and forms.

### KB Article (`cr4b3_kbarticle`)

| Display name | Logical name | Type |
|---|---|---|
| Title | `cr4b3_title` | Text, primary name |
| Summary | `cr4b3_summary` | Multiline text |
| Body | `cr4b3_body` | Multiline text (rich text is recommended) |
| Category | `cr4b3_category` | Lookup to KB Category |
| Tags | `cr4b3_tags` | Multiline text; comma-separated |
| Status | `cr4b3_status` | Choice |
| Published | `cr4b3_published` | Yes/No |
| Author name | `cr4b3_authorname` | Text |
| View count | `cr4b3_viewcount` | Whole number, default `0` |

Status choice values used by the source:

| Label | Value |
|---|---:|
| Draft | `100000000` |
| Published | `100000001` |
| Needs Review | `100000002` |

`createdon` and `modifiedon` are standard Dataverse columns. The form keeps `Published` synchronized with the status choice.

> Older versions of this repository used `cr4b3_author` as a lookup to `systemuser`. Power Pages users are Contacts, so the implementation now stores the authenticated portal user's display name in `cr4b3_authorname`. This avoids a portal-user/system-user mismatch.

### KB View (`cr4b3_kbview`)

This small event table lets Viewers register usage without receiving Write permission on KB Article.

| Display name | Logical name | Type |
|---|---|---|
| Name | `cr4b3_name` | Text, primary name |
| Article | `cr4b3_article` | Lookup to KB Article |

Create a Power Automate cloud flow triggered when a KB View row is added:

1. Read the related KB Article.
2. Update its `cr4b3_viewcount` to the current value plus one.
3. Delete the processed KB View row (optional, but recommended to keep the table small).

Turn on concurrency control for the flow trigger and set its degree of parallelism to `1` so simultaneous views do not overwrite one another.

## Security configuration

Create these Power Pages web roles:

- `KB Admin`
- `KB Viewer`

Assign authenticated IT editors to `KB Admin` and read-only IT staff to `KB Viewer`.

Create table permissions:

| Table | Web role | Scope | Privileges |
|---|---|---|---|
| KB Article | KB Viewer | Global | Read |
| KB Category | KB Viewer | Global | Read |
| KB View | KB Viewer | Global | Create |
| KB Article | KB Admin | Global | Read, Create, Write, Delete |
| KB Category | KB Admin | Global | Read, Create, Write |
| KB View | KB Admin | Global | Create, Read, Delete |

For an internal-only site, do not assign these permissions to the Anonymous Users role.

In **Site Settings**, enable the Power Pages Web API:

| Setting | Value |
|---|---|
| `Webapi/cr4b3_kbarticle/enabled` | `true` |
| `Webapi/cr4b3_kbarticle/fields` | `cr4b3_title,cr4b3_summary,cr4b3_body,cr4b3_category,cr4b3_tags,cr4b3_status,cr4b3_published,cr4b3_authorname,cr4b3_viewcount` |
| `Webapi/cr4b3_kbcategory/enabled` | `true` |
| `Webapi/cr4b3_kbcategory/fields` | `cr4b3_name` |
| `Webapi/cr4b3_kbview/enabled` | `true` |
| `Webapi/cr4b3_kbview/fields` | `cr4b3_name,cr4b3_article` |

The Web API entity-set paths used by the scripts are `/\_api/cr4b3_kbarticles` and `/\_api/cr4b3_kbviews`.

## Exactly what to copy into Power Pages

Use the **Set up → Developer tools** area in Power Pages, or open each page in **Edit code**. Copy file contents, not the folders themselves.

### 1. Global stylesheet

Copy the complete contents of:

`Power Pages IT Knowledge Hub/web-files/style.css`

Paste it into the site's `style.css` web file. Set:

- Partial URL: `style.css`
- MIME type: `text/css`
- Publishing state: Published

### 2. Shared JavaScript (proxy-safe; no new web file)

The Knowledge Hub JavaScript is embedded at the bottom of the existing:

`Power Pages IT Knowledge Hub/web-templates/Header.html`

Open the existing **Header** web template in `vscode.dev`. Copy the block beginning with:

`<!-- WFW IT Knowledge Hub shared behaviour.`

and ending at its following `</script>` into the bottom of the firm's existing Header template. Press `Ctrl+S`, return to Power Pages Design Studio, and select **Sync**.

Do not create `kb.js`. This structure deliberately uses an existing Power Pages metadata record because Visual Studio Code for the Web cannot persist newly created web-file records, and some WFW proxy configurations block the management page used to create them.

### 3. Pages

Create or open the following Power Pages pages and copy the entire matching `.webpage.copy.html` file into each page's HTML source:

| Power Pages page | Partial URL | File to copy |
|---|---|---|
| Home | `/` | `web-pages/Home/Home.en-US.webpage.copy.html` |
| Articles | `/articles` | `web-pages/Articles/Articles.en-US.webpage.copy.html` |
| Article Detail | `/article` | `web-pages/Article Detail/Article Detail.en-US.webpage.copy.html` |
| My Articles | `/my-articles` | `web-pages/My Articles/My Articles.en-US.webpage.copy.html` |
| New Article | `/new-article` | `web-pages/New Article/New Article.en-US.webpage.copy.html` |
| Edit Article | `/edit-article` | `web-pages/Edit Article/Edit Article.en-US.webpage.copy.html` |

The partial URLs must match exactly because links in the source use them.

### 4. Page-specific CSS

For each page above, copy the matching `.customcss.css` file into that page's **Custom CSS** area. Empty files require no action.

Most shared styling is intentionally in `web-files/style.css`; this keeps the WFW appearance consistent and makes future updates easier to copy.

### 5. Other optional shell files

Do not replace the firm's whole Header template merely to install the Knowledge Hub. Append only the marked Knowledge Hub JavaScript block described in step 2. Copy `web-templates/Footer.html` or files under `content-snippets/` only if you intentionally want to replace those existing WFW components.

## Power Pages page settings

- All six KB pages should require authenticated users.
- Restrict New Article, Edit Article, and My Articles pages to the `KB Admin` web role with page permissions.
- Keep Article Detail and Articles available to both `KB Viewer` and `KB Admin`.
- Publish and sync the site after copying all files.
- Clear the Power Pages server-side cache after schema or permission changes.

## Verification checklist

1. Sign in as `KB Admin`.
2. Open `/new-article` and save a Draft.
3. Confirm it appears in `/my-articles` but not to a Viewer.
4. Edit it, set Published, and save.
5. Sign in as `KB Viewer` and search for a word from its body and one of its tags.
6. Open the article twice and confirm the view count increases.
7. Confirm a Viewer cannot open the create/edit pages and cannot see edit/delete controls.
8. Test the layout at desktop and mobile widths.

## Repository structure

```text
Power Pages IT Knowledge Hub/
├── content-snippets/       Power Pages content snippets
├── web-files/              Global CSS and image assets
├── web-pages/              One folder per Power Pages page
└── web-templates/          Existing Power Pages Liquid templates
```

Do not paste `<!DOCTYPE>`, `<html>`, `<head>`, or `<body>` wrappers into a Power Pages page. The supplied KB page files intentionally contain page-body Liquid/HTML only so they can be pasted directly into Edit code.

## Troubleshooting

- **403 on save:** check table permissions, the user's `KB Admin` web role, and the `Webapi/...` site settings.
- **Categories are empty:** verify KB Category records exist and both roles have read permission.
- **A page links to 404:** confirm the partial URLs in the table above.
- **Data never appears:** confirm the logical names/publisher prefix match the WFW Dataverse environment.
- **Changes do not show:** publish the page/web file, sync configuration, then clear the portal cache.
