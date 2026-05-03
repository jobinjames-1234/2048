# Security Specification: 2048 Pro

## 1. Data Invariants
- A user profile must have a valid UID matching the authenticated user.
- A score entry must have a valid UID matching the authenticated user.
- Roles can only be updated by `super_admin`.
- `bestScore` can only be updated if the new score is greater than the existing one (client side checks first, but rules enforce ownership).
- Timestamps must be handled properly.

## 2. Dirty Dozen Payloads
1. Attempt to create a user profile with `role: 'super_admin'` (Identity Spoofing).
2. Attempt to update another user's `bestScore`.
3. Attempt to submit a score for another user.
4. Attempt to change one's own `role` from `player` to `admin`.
5. Attempt to delete the `leaderboard` collection.
6. Attempt to inject a 2MB string as a `username`.
7. Attempt to set `bestScore` to a negative value.
8. Attempt to update `createdAt` field after creation (Immutability).
9. Attempt to read PII (email) of all users without being an admin.
10. Attempt to list all users as a `player`.
11. Attempt to submit a score without being logged in.
12. Attempt to use a non-alphanumeric string as a document ID for user profile.

## 3. Conflict Report
| Collection | Identity Spoofing | State Shortcutting | Resource Poisoning |
| :--- | :--- | :--- | :--- |
| users | Protected by `request.auth.uid` | Role updates restricted | Strict size checks |
| leaderboard | Protected by `request.auth.uid` | Timestamp enforced | Strict size checks |
