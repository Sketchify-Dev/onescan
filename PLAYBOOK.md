# AI Hackathon Playbook (adapted)

Source: `AI_Hackathon_Prompt_Playbook.pdf` (12 pages), a general toolkit for
researching competitions, picking ideas, building, and submitting with ChatGPT
plus coding tools.

This repo's adaptation: **Claude Code is the coding partner** (scaffolding,
contract, frontend, tests, docs, deploy checks, all in this repo).
**ChatGPT is the advisor** (strategy, idea generation, research, submission
editing, demo coaching, judge-style review). One person owns the product calls
and verifies everything onchain and in the browser.

Global rule: never use the em dash or en dash in output or files. Commas,
colons, parentheses, or separate sentences. Plain hyphens are fine.

## How to use

Work through the prompts in order, adapt them to each competition. Replace
every bracketed instruction with your own info. Give ChatGPT the official
rules and judging criteria, never rely on summaries. Verify research, test the
app yourself, protect credentials, follow the competition's AI-use rules.

Suggested workflow: find hackathon, analyse rules, generate ideas, validate,
plan MVP, build, test and debug, deploy, prepare submission.

## 01. Hackathon strategist (ChatGPT, advice)

When: at the start of each competition, before brainstorming.
Give it: official description, problem statements, judging criteria, sponsor
tracks, eligibility, deadline, submission requirements.

> Act as an experienced hackathon strategist, product manager and technical
> advisor. I am considering entering this hackathon: [PASTE OFFICIAL
> DESCRIPTION]. Judging criteria: [PASTE CRITERIA]. Sponsor tracks:
> [PASTE TRACKS]. Eligibility and rules: [PASTE RULES]. Produce a concise
> strategy brief: (1) problems the organisers want solved, (2) what judges
> will reward, based only on published criteria, (3) mandatory requirements
> and disqualifying conditions, (4) relevant sponsor tracks, (5) overlooked
> users or use cases, (6) what a strong submission must demonstrate,
> (7) questions I must resolve before picking a project. Separate facts in
> the rules from your interpretations. Flag missing or ambiguous info
> instead of guessing.

## 02. Differentiated idea generator (ChatGPT, advice)

When: after the strategy brief, before committing.
Give it: the brief, plus skills, time, team size, required tech.

> Act as a product innovation strategist with hackathon experience. Strategy:
> [PASTE BRIEF]. Constraints: team [SIZE], time [TIME], experience [LEVEL],
> required tech [DETAILS], budget or API limits [DETAILS]. Generate 8 to 10
> project concepts. Avoid generic chatbots, thin AI wrappers, and ideas that
> only combine popular tools. For each: user and problem, solution and how it
> works, why it is meaningfully different, smallest convincing MVP, relevant
> criteria or track, difficulty and dependencies, risks and assumptions.
> Rank by problem relevance, differentiation, feasibility, and criteria fit.
> Explain tradeoffs. Do not claim an idea is unique without evidence.

## 03. Competitor and problem research (ChatGPT, advice)

When: before final idea selection, to test that the problem exists.
Give it: shortlisted ideas, target users, hackathon requirements. Web search on.

> Act as a product research analyst. Investigate: [SHORTLISTED IDEAS]. For
> each: existing products and competitors, open-source repos, community
> discussion (including Reddit where useful), repeated complaints and
> workarounds, evidence the problem matters, relevant APIs and datasets,
> gaps in current approaches. Link sources, explain what each supports.
> Distinguish verified findings from interpretations and open questions.
> Do not invent quotes, stats, or demand. Compare the ideas, recommend one
> for this hackathon with evidence, and say what still needs validation.

## 04. Product architect and MVP planner (ChatGPT advises, human confirms)

When: after idea plus problem validation. Turns the concept into a plan.
Give it: idea, research, criteria, deadline, team, required sponsor tech.

> Act as a senior architect and product manager. Project: [IDEA AND
> RESEARCH]. Requirements: [RULES]. Time and team: [DETAILS]. Produce:
> purpose, users, primary journey; smallest MVP; essential versus optional
> features; frontend, backend, database; data model and integrations; stack
> with reasons; auth, privacy, security; folder structure; deploy approach
> and env vars; staged plan with checkpoints; top risks and fallbacks. Keep
> scope realistic for the deadline. Present the plan and ask me to confirm
> scope before any code.

## 05. Coding partner: Claude Code plus VS Code (Claude builds)

When: building. This is the one prompt owned by Claude Code, not ChatGPT.
The approved plan lives in `PLAN.md`, stack and rules in `CLAUDE.md`.

> Senior full-stack development partner. Project: [DESCRIPTION]. Approved
> architecture and MVP: [PLAN]. Environment: OS [OS], tools [DETAILS],
> folder [PATH], experience [LEVEL]. Work in small verifiable stages. Each
> stage: what we implement and why, exact file paths, complete code or
> precise patch, terminal commands explained before I run them, expected
> output, and a report-back step before moving on when verification matters.
> Keep a record of done, remaining, bugs, decisions. Preserve working
> features, avoid touching unrelated files. Never claim code was run,
> tested, committed, pushed, or deployed without evidence from my report or
> an available tool. Start by checking environment and structure, then
> implement the first MVP milestone.

Practical note: paste the full error plus relevant code on failure. Never
paste passwords, private keys, or secret env values into chat.

## 06. UI and UX improvement (Claude builds, design skills loaded)

When: core app works but the interface needs clarity or polish.
Give Claude: screenshots or description, target users, brand direction,
primary journey. Load the project's Tier A design skills first (see
`design.md` skill picks), follow them, then run the UI polish pass.

> Senior product designer and frontend specialist. Review: [PRODUCT OR
> SCREENSHOTS]. Users and main task: [DETAILS]. Improve without decorative
> complexity. Review: hierarchy and layout, navigation and journey,
> typography, spacing, consistency, forms, buttons, feedback states, mobile
> and tablet, accessibility and contrast, loading, empty, success, and
> error states. First list the five highest-impact improvements and why,
> then propose a consistent direction. Preserve working features and design
> constraints. Name exact files, write code that fits the stack, invent
> no functionality the app lacks.

Practical note: fix the most important user journey first. A polished
landing page cannot compensate for a broken core workflow.

## 07. Debugging and testing (Claude diagnoses, human verifies)

When: something behaves incorrectly or must be verified before submission.
Give Claude: exact error text, repro steps, expected versus actual
behaviour, relevant code, environment. Remove secrets first.

> Senior engineer for debugging and QA. Context: [STACK SUMMARY]. Problem:
> [WHAT FAILS]. Repro: [STEPS]. Expected: [BEHAVIOUR]. Actual plus full
> error: [WHAT HAPPENS]. Code and logs: [MATERIAL]. Investigate: most
> likely causes with supporting evidence, what extra test distinguishes
> them, files involved, smallest safe fix, corrected code, verification
> steps, regression risks and related tests. Do not rewrite unrelated code
> or guess without evidence. Never call it fixed until tested or its
> verification status is stated.

Practical note: retest the main journey after each significant change.
Keep a short list of unresolved bugs, never silently drop them.

## 08. GitHub plus Vercel shipping assistant (Claude ships, human authorises)

When: connected tooling is authorised for repo and deployment.
Give Claude: repo, branch, deployment project, build instructions, env var
names (never secret values).

> Development and deployment assistant. Project: [DESCRIPTION]. Repo:
> [REPO]. Deployment: [PROJECT]. Goal: [TASK]. Before changing anything:
> inspect the repo (framework, structure, state), check branch and pending
> changes, explain files and config you expect to modify, flag missing
> permissions or env var names. Then work in small stages: implement while
> preserving behaviour, run checks and tests, review the diff, report test
> results and open issues, commit or push only with my authorisation,
> deploy only through the configured workflow, verify the result where
> tools permit. Never expose secrets or put credentials in source. No
> destructive actions without asking. Report what completed, what failed,
> what still needs me. Never claim a push or deploy succeeded without
> confirmation.

## 09. Submission and demo preparation (ChatGPT drafts, Claude implements)

When: MVP works. Adapt to exact submission fields and judging criteria.
Give ChatGPT: submission form, criteria, verified features only, repo and
demo links.

> Hackathon submission editor, technical reviewer, and demo coach. Project:
> [NAME AND DESCRIPTION]. Criteria: [PASTE]. Requirements and fields:
> [PASTE]. Implemented features: [VERIFIED ONLY]. Repo and demo: [LINKS].
> Produce: concise summary; problem and users; how it works and why it is
> useful; implemented features; architecture and meaningful integrations;
> README structure with setup; demo outline plus spoken script for the time
> limit; criterion-by-criterion evidence mapping; likely judge questions
> with truthful answers. Do not exaggerate impact, invent users, claim
> unimplemented features, or imply an unverified integration works. Flag
> missing evidence and incomplete requirements.

Practical note: show the working product early in the demo. State the
problem briefly, demo the core journey live, tie each beat to the criteria.

## 10. Final judge-style review (ChatGPT reviews, human decides)

When: before submitting, as an independent review. Not a substitute for
testing or reading the official rules.
Give ChatGPT: live URL, repo, submission draft, official rules, checklist
of what you personally tested.

> Critical hackathon judge and submission reviewer. Requirements: [OFFICIAL
> RULES]. Project and draft: [DETAILS]. Live app: [URL]. Repo: [URL].
> Tests I personally ran: [LIST WITH RESULTS]. Evaluate against published
> criteria. Review: problem relevance and clarity; originality and
> differentiation on available evidence; core functionality and UX;
> technical implementation and required integrations; evidence for claims;
> demo quality; README and setup; eligibility and compliance. For each:
> what is strong, what is weak or missing, supporting evidence,
> highest-priority action. Separate what you can verify from what you
> cannot. Do not invent a score or claim to have tested the live product.
> End with go or no-go plus remaining blockers.

Practical note: run the official submission checklist yourself. A review
prompt cannot confirm eligibility or live functionality without evidence.

## Bonus: multi-hackathon tracker

Keep one record per project, somewhere you can access and update. Never
assume ChatGPT retains detail across chats. Fields: hackathon and official
link; deadline and timezone; eligibility and AI-use rules with source;
prize pool and tracks; judging criteria and weights; chosen project and
one-line description; research and key sources; repo and branch; live URL
and status; completed versus remaining; next action with owner and date.

Reusable handover prompt for ChatGPT:

> Act as my hackathon project manager. Create or update a concise handover
> record: hackathon name, deadline and timezone, eligibility and AI-use
> rules, prize tracks, criteria, idea, users, validated research, MVP
> scope, stack, repo and branch, deployment URL, completed and outstanding
> features, known bugs, test results, important decisions, next actions.
> Label anything unverified or assumed. Keep this project separate from
> any other. Format it so I can save and paste it into a new session.

Operating checklist: confirm eligibility, deadline, timezone, AI-use rules
before starting; save brief, criteria, requirements; pick idea on evidence,
fit, and scope; build core journey before extras; keep keys in env, never
in chat or source; test and record what is and is not verified; deploy
early, leave fix time; prepare README, demo, submission against criteria;
submit before deadline, keep proof; update tracker, record lessons.

Entering more hackathons creates more chances to compete, but prizes are
never guaranteed. Prioritise eligible competitions, build something that
addresses the challenge, verify the work, submit honestly. Use AI to raise
execution capacity, not to replace research, judgement, or testing.
