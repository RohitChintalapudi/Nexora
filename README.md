# NEXORA

Understand the system. Build the future.

NEXORA is a technically sophisticated AI-powered software engineering workspace designed to map, understand, and explore codebases. Unlike generic chatbots, NEXORA indexes entire software repositories, parses AST hierarchies, maps system architecture boundaries, and conducts change-impact sandboxing.

---

## Core Capabilities

- **Repository Intelligence:** Conducts semantic search queries and traces file references grounded in actual codebases.
- **Interactive System Maps:** Visualizes service topologies, database configurations, and API interfaces with dependency path tracking.
- **Change Impact Sandbox:** Forecasts downstream dependency pathways to prevent unintended regressions before modifications.
- **Team Collaboration:** Enables shared sync workspaces for mapping large distributed codebases.

---

## Refinement Updates

The following visual refinements and architectural updates have been implemented:

### 1. Hero Layout Refinements
- Adjusted positions of top floating decorative cards to create a clean breathing space of 48px below the global navbar.
- Maintained vertical centering of the landing headline.

### 2. Connectivity Hub (Problem Section)
- Enabled continuous dotted connection lines from outer service cards to the central NEXORA hub.
- Implemented CSS offset-path keyframes to drive dual-particle flow animations along every route (inward flows for code, issues, logs, and architecture; outward flows for documentation and AI).
- Configured 6 connection points at the central node perimeter that scale and highlight dynamically on active card hovers.
- Added a subtle 4px vertical card hover lift and border highlights.

### 3. Workflow Progress Timeline (How It Works)
- Positioned the horizontal track container as a sibling of the grid container, utilizing absolute layout properties (left: 28px; right: calc(25% - 46px)) to align exactly between Circle 01 and Circle 04 centers.
- Programmed a filling blue progress bar animation that grows from 0% to 100% width, fades out, and resets.
- Added vertical sequential pulsing data indicators below each step card.

### 4. Interactive Showcase Mockups
- **Understand Card:** Shows grounded Q&A responses, file trees, and AST hierarchy paths.
- **Visualize Card:** Displays interactive service topography maps with highlight/dim pathways and tooltip description triggers.
- **Predict Card:** Visualizes code impact analysis metrics and propagation pathways in restrained orange/red risk status tags.

### 5. Branding Consistency
- Applied circular rounding styles to the favicon image assets in the footer layout to ensure alignment with page styling principles.
- Stripped all inline comments from codebase components to keep imports and styles extremely clean.
