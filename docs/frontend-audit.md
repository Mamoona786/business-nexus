| Page/Component        | Current Status                     | Data Source                | Backend Needed                      |
| --------------------- | ---------------------------------- | -------------------------- | ----------------------------------- |
| LoginPage             | Static login form                  | None / local state         | Login API                           |
| RegisterPage          | Static registration form           | None / local state         | Register API                        |
| ForgotPasswordPage    | Static form                        | None                       | Forgot password API                 |
| ResetPasswordPage     | Static form                        | None                       | Reset password API                  |
| InvestorDashboard     | Mock cards and overview            | Local/mock                 | Dashboard summary API               |
| EntrepreneurDashboard | Mock cards and overview            | Local/mock                 | Dashboard summary API               |
| InvestorsPage         | List rendering from local data     | `users.ts`                 | Get investors API                   |
| EntrepreneursPage     | List rendering from local data     | `users.ts`                 | Get entrepreneurs API               |
| MessagesPage          | Static/mock conversations          | `messages.ts`              | Get conversations API               |
| ChatPage              | Static/mock chat                   | `messages.ts`              | Send/get messages API + Socket.IO   |
| DealsPage             | Static/mock collaboration requests | `collaborationRequests.ts` | Collaboration/deals API             |
| DocumentsPage         | Static/mock UI                     | None/mock                  | Upload/list/view documents API      |
| NotificationsPage     | Static/mock notifications          | None/mock                  | Notifications API                   |
| InvestorProfile       | Static/mock profile                | `users.ts` or local state  | Get/update profile API              |
| EntrepreneurProfile   | Static/mock profile                | `users.ts` or local state  | Get/update profile API              |
| SettingsPage          | Static settings UI                 | None                       | Update settings/change password API |
| HelpPage              | Static help/support UI             | None                       | Support/contact API                 |










| Mock File                  | Used In                                    | Purpose                     | Future Backend Replacement |
| -------------------------- | ------------------------------------------ | --------------------------- | -------------------------- |
| `users.ts`                 | InvestorsPage, EntrepreneursPage, Profiles | User/profile list           | Users/Profile API          |
| `messages.ts`              | MessagesPage, ChatPage                     | Chat data                   | Messages API + Socket      |
| `collaborationRequests.ts` | DealsPage, CollaborationRequestCard        | Deal/collaboration requests | Collaboration API          |
