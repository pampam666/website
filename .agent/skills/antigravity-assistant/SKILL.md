---
name: antigravity-assistant
description: Coordinates with Claude Code running ECC by exploring workspace context and generating optimized, copy-pasteable prompt instructions.
origin: ECC
---

# Antigravity Assistant

Use this skill when a user asks the IDE-side agent (Antigravity) to prepare a task or compose a prompt for the terminal-side agent (Claude Code).

## When to Use

*   Preparing complex code modifications or refactoring tasks.
*   Formulating plans for new features or bug fixes.
*   Helping a user onboard a task to Claude Code with correct file anchors and test instructions.
*   Solving compiler/type errors that require terminal execution.

## Core Workflow

### Step 1: Parse User Request
Determine the user's goal (e.g., adding a feature, fixing a bug, resolving an error, planning).

### Step 2: Investigate the Codebase (Read-Only)
Find the target files and relevant context:
1.  **File Search**: Use file list or search tools to locate target components, APIs, or configuration files.
2.  **Verify Code Stack**: Read `package.json`, `tsconfig.json`, or similar config files to determine dependencies, package managers, and testing commands.
3.  **Inspect Imports**: Look at the target file's imports to identify dependencies (e.g., Sanity CMS, Prisma ORM, Auth.js).

### Step 3: Select the Matching ECC Command
Map the user's task to the most specific ECC command:
*   **Planning**: `/plan`
*   **Feature/Bug (TDD)**: `/tdd-workflow`
*   **Build/Compiler Fixes**: `/build-fix`
*   **E2E Tests**: `/e2e-runner`
*   **Code Review**: `/quality-gate`

### Step 4: Formulate the Copy-Paste Prompt
Draft the prompt using the following structure. Always enclose the final prompt in a markdown code block starting with `"""` to make copy-pasting clean.

```text
"""
<ECC_COMMAND_PREFIX>

Context Files:
- [relative/path/to/file](file:///absolute/path/to/file)
- [relative/path/to/test](file:///absolute/path/to/test)

Task Description:
<Detailed description of the task, including inputs, expected outputs, and behavior>

Active MCP Directives:
- <Directives for utilizing active MCPs: e.g. "Use the context7 MCP server to check Next.js 15 routing APIs" or "Use the playwright MCP server to run browser tests">

Verification Steps:
1. Run <build/test command> (e.g., `pnpm test` or `pnpm type-check`)
2. Verify <expected result>

ECC Constraints:
- Use immutability patterns (do not mutate inputs/states directly).
- Ensure 80%+ test coverage.
- Write tests first.
- No hardcoded secrets.
"""
```

## Mapping Reference Guide

### 1. Code Implementation & Bug Fixes
*   **Target Command**: `/tdd-workflow` (preferred for implementing logic or bugs).
*   **Verification**: Remind Claude Code to run the specific test file first.
*   **Example**:
    ```text
    /tdd-workflow
    Context Files:
    - [src/lib/api/resend.ts](file:///d:/CLAUDE-PROJECT/website/src/lib/api/resend.ts)
    - [tests/resend.test.ts](file:///d:/CLAUDE-PROJECT/website/tests/resend.test.ts)

    Task: Update the Resend email utility to support CC and BCC addresses.
    Active MCP Directives:
    - Use the `context7` MCP server to check the latest Resend SDK v3 method signatures.
    Verification: Run `pnpm test tests/resend.test.ts`
    ```

### 2. General Planning & Architecture
*   **Target Command**: `/plan`
*   **Verification**: Ask Claude Code to output the proposed plan artifact and wait for user approval.
*   **Example**:
    ```text
    /plan
    Context Files:
    - [package.json](file:///d:/CLAUDE-PROJECT/website/package.json)
    - [src/middleware.ts](file:///d:/CLAUDE-PROJECT/website/src/middleware.ts)

    Task: Design a system to support multi-tenant subdomain routing for spokes.
    Active MCP Directives:
    - Use the `sequential-thinking` MCP server to lay out step-by-step routing rules before writing the plan.
    ```

### 3. Build & Compiler Error Fixes
*   **Target Command**: `/build-fix`
*   **Verification**: Run build and verify output.
*   **Example**:
    ```text
    /build-fix
    Context Files:
    - [src/app/api/auth/[...nextauth]/route.ts](file:///d:/CLAUDE-PROJECT/website/src/app/api/auth/%5B...nextauth%5D/route.ts)

    Task: Resolve the NextAuth v5 type declaration error introduced by the package upgrade.
    Active MCP Directives:
    - Use the `context7` MCP server to lookup Auth.js v5 Next.js Middleware configuration guides if type resolutions are missing.
    Verification: Run `pnpm type-check`
    ```

### 4. End-to-End Browser Testing
*   **Target Command**: `/e2e-runner`
*   **Verification**: Execute Playwright assertions.
*   **Example**:
    ```text
    /e2e-runner
    Context Files:
    - [tests/e2e/dashboard.spec.ts](file:///d:/CLAUDE-PROJECT/website/tests/e2e/dashboard.spec.ts)

    Task: Add E2E tests for the RFQ multi-step submission flow.
    Active MCP Directives:
    - Use the `playwright` MCP server to record, interact with, and assert UI elements during execution.
    Verification: Run `pnpm exec playwright test tests/e2e/dashboard.spec.ts`
    ```
