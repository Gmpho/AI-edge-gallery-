# Strike Tips — Full End-to-End Plan

## Goal
Rebrand Google AI Edge Gallery as **Strike Tips**: a custom Android app with pre-loaded horse racing intelligence (skills + MCP), distributed directly via Cloudflare Pages (no Play Store).

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  USERS                                                        │
│  Download APK from striketips.pages.dev → Install → Enjoy    │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│  STRIKE TIPS APK (fork of AI Edge Gallery)                   │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ What users see           │ What's under the hood        │ │
│  ├──────────────────────────┼──────────────────────────────┤ │
│  │ "Strike Tips" icon       │ Runs Gemma 4, Qwen, all     │ │
│  │ Green/gold racing theme  │ LiteRT runtime, fast infer.  │ │
│  │ "Racing Intelligence"    │ AI Chat, Ask Image, Audio,   │ │
│  │ Pre-loaded racing skills │ Prompt Lab — everything      │ │
│  │ MCP auto-connected      │ Skills system — add any URL  │ │
│  └──────────────────────────┴──────────────────────────────┘ │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│  CLOUDFLARE PAGES  →  striketips.pages.dev                   │
│                                                               │
│  /index.html          Landing page with branding + pricing   │
│  /downloads/          APK file for download                  │
│  /skills/             4 racing skills (already built)        │
│  /docs/               Setup guide, privacy policy             │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│  CLOUDFLARE WORKERS  →  MCP Server (already live)            │
│                                                               │
│  7 tools: edge calc, Kelly staking, AI search, odds, etc.    │
│  stkiptips-mcp.gmphorg379.workers.dev/mcp                    │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│  PAYMENT (future — user decides provider)                     │
│                                                               │
│  Gumroad / Stripe / PayFast / Manual EFT                      │
│  R50-100/mo per user for Pro API key                          │
└──────────────────────────────────────────────────────────────┘
```

## Files to Change in the Fork

### App Identity (5 files)

| # | File | Change |
|---|------|--------|
| 1 | `Android/src/app/build.gradle.kts` | `applicationId` → `com.striketips.app`, `namespace` → `com.striketips.app`, `versionName` → `1.0.0` |
| 2 | `Android/src/app/src/main/AndroidManifest.xml` | `package` → `com.striketips.app`, `android:label` → `"Strike Tips"`, deep link scheme |
| 3 | `Android/src/res/values/strings.xml` | `app_name` → `"Strike Tips"`, remove Google references |
| 4 | `Android/src/settings.gradle.kts` | `rootProject.name` → `"Strike Tips"` |
| 5 | `Android/README.md` | Update for Strike Tips |

### Icons (replace all)

| # | File | Change |
|---|------|--------|
| 6 | `drawable/icon.xml` | New horse/racing icon vector |
| 7 | `mipmap-*` PNGs (20 files) | Replace at all densities (hdpi–xxxhdpi) |

### Colors & Theme (2 files)

| # | File | Change |
|---|------|--------|
| 8 | `ui/theme/Color.kt` | Primary: `#1B5E20` (racing green), Secondary: `#FFD700` (gold), Error: `#B71C1C` |
| 9 | `ui/theme/Theme.kt` | Update `CustomColors` for racing brand, gradient colors |

### MCP Whitelist (CRITICAL — 1 file)

| # | File | Change |
|---|------|--------|
| 10 | `AddMcpServerFromUrlDialog.kt:73` | Remove whitelist or add `workers.dev` |

### Pre-configure Your Services (2 files)

| # | File | Change |
|---|------|--------|
| 11 | `McpManagerViewModel.kt` | Auto-add Strike Tips MCP server as default |
| 12 | `SkillManagerViewModel.kt` | Pre-load 4 racing skills as defaults |

### Remove Google Branding (5 files)

| # | File | Change |
|---|------|--------|
| 13 | `HomeScreen.kt` | "AI Edge Gallery" → "Strike Tips" |
| 14 | `Consts.kt` | GitHub URLs → your repo URLs |
| 15 | `ModelManagerViewModel.kt` | Allowlist URL → your fork |
| 16 | `GemmaTermsOfUseDialog.kt` | Rewrite for Strike Tips |
| 17 | `DownloadRepository.kt`, `NotificationReceiver.kt` | Channel names |

### Package Refactor

| # | File | Change |
|---|------|--------|
| 18 | All Kotlin files | Move from `com/google/ai/edge/gallery/` → `com/striketips/app/` |
| 19 | Proto files | Update package declarations |

## Build Process

```bash
cd Android/src
export ANDROID_HOME=/home/giftmpho/Android
./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-release.apk
```

## Cloudflare Pages Structure

```
striketips.pages.dev/
├── index.html                Landing page
├── styles.css                Styling
├── _headers                  CORS + download headers
├── skills/
│   ├── calculate-probability-edge/scripts/index.html
│   ├── kelly-staking/scripts/index.html
│   ├── form-analyzer/scripts/index.html
│   └── paper-trader/scripts/index.html
├── downloads/
│   └── striketips.apk        Signed APK
└── docs/
    └── setup.md              User guide
```

## MCP Server — Already Live

- **URL**: `https://striketips-mcp.gmphorg379.workers.dev/mcp`
- **Tools**: `calculate_probability_edge`, `calculate_max_position`, `search_past_races`, `search_racing_keywords`, `verify_race_exists`, `evaluate_race`, `get_odds_snapshot`
- **Auth**: `X-API-Key` header middleware (optional, for pro tier later)

## Costs

| Item | Cost |
|------|------|
| Cloudflare Pages | Free |
| Cloudflare Workers | Free (100k req/day) |
| Workers AI | Free (10k neurons/day) |
| Android SDK | Free |
| HuggingFace OAuth | Free |
| GitHub | Free |
| **Total to launch** | **R0 / $0** |

## Phases

1. **Phase 1**: Build landing page + deploy to Cloudflare Pages
2. **Phase 2**: Rebrand + build APK (the fork)
3. **Phase 3**: Polish MCP server (secrets, rate limiting)
4. **Phase 4**: Deploy APK to Pages for distribution
5. **Phase 5**: Payment gateway (user decides when)
