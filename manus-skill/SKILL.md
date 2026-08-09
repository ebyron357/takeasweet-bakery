---
name: takeasweet-bakery
version: 1.0.0
description: Plan, build, review, test, and improve the TakeASweet Bakery platform, including custom cake ordering, payments, AI bakery concierge, gallery, customer portal, and admin operations.
---

# TakeASweet Bakery Skill

## Purpose

Use this skill when working on the TakeASweet Bakery repository or when the user asks to design, build, review, test, document, deploy, or improve the bakery platform.

The production goal is a premium custom bakery platform with online ordering, deposits or full payments through Stripe, an AI Bakery Concierge, product and event galleries, a guided cake builder, an admin dashboard, and a customer portal.

## Source of truth

Treat the current GitHub repository as the canonical project source of truth.

Before changing the project:

1. Read `README.md` and all project documentation.
2. Inspect the current branch, working tree, project structure, dependencies, configuration, tests, and deployment files.
3. Determine what is verified as working, partially working, missing, broken, or blocked.
4. Preserve existing working functionality and design intent.
5. Never claim a feature, test, integration, deployment, or payment flow works unless it has been verified.

## Core product capabilities

Work toward these capabilities when they are within the approved project scope:

- Responsive public bakery website
- Product, flavor, size, filling, decoration, and occasion options
- Guided custom cake builder
- Quote and order-request workflow
- Deposit and full-payment options through Stripe
- Order confirmation and status communication
- Customer account and order portal
- Admin dashboard for orders, customers, products, pricing, availability, and content
- Gallery and portfolio management
- AI Bakery Concierge for product guidance and order intake
- Contact, pickup, delivery, scheduling, and event information
- Mobile accessibility, clear navigation, and strong visual presentation

## Operating workflow

### 1. Audit

Create a verified current-state assessment covering architecture, implemented features, missing or incomplete features, broken workflows, database and migration status, authentication and authorization, Stripe and payment readiness, AI integration readiness, environment variables, testing coverage, security, privacy, accessibility, and deployment risks.

### 2. Plan

Maintain a prioritized checklist. Organize work into the smallest safe sequence that moves the project toward a working production release.

Do not assign the user tasks that can be completed with available tools. Ask for user action only when credentials, payments, account ownership, legal approval, brand decisions, or irreversible business choices require it.

### 3. Implement

- Use a dedicated working branch for material changes when branch control is available.
- Follow the repository's existing architecture and package manager.
- Avoid unnecessary rewrites.
- Keep configuration and secrets out of committed source files.
- Add or update `.env.example` with variable names and safe descriptions only.
- Use realistic validation and error handling.
- Keep customer, order, and payment data private.

### 4. Test

Run applicable dependency installation, type checks, linters, unit and integration tests, database migrations, production builds, and main user-flow tests.

For payment workflows, use Stripe test mode unless the user explicitly authorizes production activity.

### 5. Report

At the end of each substantial task, provide one complete status report containing work completed, files changed, tests performed and exact results, verified working features, remaining blockers, credentials or owner decisions required, and exact next steps to reach production readiness.

## Safety and quality rules

- Never expose API keys, passwords, tokens, customer records, payment data, or private business information.
- Never invent credentials, test results, URLs, integrations, or deployment status.
- Do not process real payments during development or testing.
- Do not merge into the production branch without explicit authorization when a review branch or pull request workflow is available.
- Review third-party repositories, packages, scripts, and skills before use.
- Confirm license compatibility and commercial-use rights before incorporating outside code.
- Avoid medical, allergy, or dietary guarantees.
- Maintain accessibility for keyboard use, readable contrast, form labels, error messages, and mobile layouts.

## Skill triggers

Use this skill for requests such as auditing or finishing the TakeASweet Bakery repository, improving the cake builder, configuring Stripe deposits or full payments, creating the AI Bakery Concierge, building the customer portal or admin dashboard, testing, securing, documenting, deploying, or reviewing proposed GitHub repositories and additional skills.
