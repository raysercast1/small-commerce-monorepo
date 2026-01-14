# Contributing to SmallCommerce LatAm
I'm so glad you're here! This document will outline how I work, who's involved (if any),
and general information on how you can get started on this project.

## ⛑ Available roles:
- **Front-end:** Works either on the `partner-dashboard`, `micro-storefront`, `shared-core` lib, or all of them with Angular, CSS, etc.
- **Designer:** Works in Figma/other tools to design new user stories, envision product features, etc.

## 👨‍💼 Who's involved?
Well, at the moment, I'm the only one involved in this project. However, I'm always looking for more contributors to join in and help make this project even better!

## 🧢 Maintainers
### The Team
| Name                | Role                       | Slack handle        | Github                                             | Weekly Availability | Joined   |
|---------------------| -------------------------- |---------------------|----------------------------------------------------|---------------------|----------|
| 🧢 Rayser Castrillo | Project Lead               | `@Rayser Castrillo` | [@raysercast1](https://github.com/raysercast1) | 25 hours            | Apr 2024 |

## 🔧 What can I work on?
I use a GitHub project to track the issues. Look for any issues that are not assigned or labelled `help wanted` and comment that you'd like to take it over, and I (a maintainer)
will assign it to you in case you can't auto-assign it.

You can view [the project tasks here](https://github.com/users/raysercast1/projects/8)

## 💬 Communication
To keep things organize, I've created a Slack workspace for discussions on the project. You can see and join it [here](https://smallcommercelatam.slack.com).
Or email me at [rayser.subscriptions@gmail.com](mailto:rayser.subscriptions@gmail.com) if you have any questions or need assistance.

I also post a **bi-weekly update at 8pm PST** (sometimes weekly) on the Slack channel.

## 🏃🏻‍♀️ Sprints
I do monthly sprints with bi-weekly (or weekly) updates at 8pm PST on a Slack channel. Although this does not means
that each month I deploy to master with all the PRs that were done that month. What it means is that I give myself that window (or deadline) to finish any tasks that I want to work on.
If more maintainers join, we can split the sprints and have more frequent updates.

## 🌳 Branches
At the moment I'm using a basic approach on branching strategy to maintain the project. `main` and `develop` branches are protected and only allow PRs to merge.
`develop` branch is the most updated branch, so you should always work on top of it.

- `main` Production branch. Limited access on who can deploy to this.
- `develop` Main development branch. I merge `feature/*` PRs into this branch.
- `feature/*` A feature branch aimed at addressing a SINGLE feature/fix. I try to keep these as SMALL AS POSSIBLE.
- `release/vX.X.X` Used to release the sprints work into production.

I use this strategy because it's a solo-owner project at the moment. If more maintainers join, I'll change it to something more scalable and easy to CD/CI.
Later I'll provide documentation of the branching strategy for future contributors.
