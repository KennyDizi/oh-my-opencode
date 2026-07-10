---
id: 83fc1f98-14d7-4015-904d-a509c4ebf982
created: '2026-07-09T17:39:20.559Z'
modified: '2026-07-09T17:39:20.559Z'
memory_type: context
tags:
  - workflow
  - codegraph
  - verification
  - user-preference
---
User preference: after each succeeded implementation task, run `codegraph index`. The user corrected an earlier phrasing: it should happen after the implementation task succeeds, not before it. If additional implementation edits are made before finalizing, run `codegraph index` again after those edits are green.
