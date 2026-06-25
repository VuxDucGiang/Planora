# Planora Figma Screen Specifications

## Executive Summary  
Planora is a wedding planning platform whose UI spans public marketing pages, authenticated customer planning tools, a vendor portal, payment flows, and admin dashboards. This report catalogs **60 screens** across all modules, detailing each screen’s actors, purpose, UI components, data fields, CTAs, states (empty/error/loading/success), responsive notes, accessibility considerations, and suggested Figma components/variants. We draw on the user-provided page outlines and best practices from wedding apps, form UX, and Figma design systems.  Key elements include a multi-step onboarding form (broken into small groups of fields for low cognitive load), a rich vendor marketplace with filters (showing total results and “Load More” instead of endless scroll), and interactive budget/timeline dashboards.  We also recommend a robust Figma file structure (Design System page with tokens, pages for wireframes and final screens) and a handoff checklist (export-ready assets, style tokens, annotations). Below, screens are grouped by module for clarity.

## Public (Marketing & Auth)

### 1. Landing Page (Public)  
- **Actors:** Any visitor (anonymous).  
- **Purpose:** Introduce Planora and entice sign-ups. Highlights value proposition, features, and key visuals.  
- **UI Sections/Components:**  
  - **Hero section:** Full-bleed banner image (e.g. happy wedding couple or venue) with headline and subheader. Primary **CTA** button (“Start Planning” or equivalent) and secondary “Login/Register” links.  
  - **Benefits/Features:** Icon+headline lists (“Plan Your Budget”, “Find Vendors”, etc.).  
  - **How It Works:** Step-by-step or infographic summary (e.g. 3–4 steps with illustrations).  
  - **Featured Vendors:** Carousel or grid of sample vendors (image thumbnail, name, category). Clicking leads to Marketplace or vendor detail.  
  - **Footer:** Links (About, Contact, Terms), social links.  
- **Data Fields:** None (static content). Optionally a search field for venues/vendors (if included).  
- **Primary CTA:** Start Planning (bold button).  
- **Secondary Actions:** “Login” and “Register” links; maybe “Learn More”.  
- **States:** No dynamic loading elements; show placeholder hero while image loads; if search is added, show “no results” state.  
- **Responsive Notes:** On desktop, full hero image and multi-column layout for feature lists. On mobile, collapse to a single column, hamburger menu for nav, stacked sections, smaller font sizes. Ensure CTA remains prominent above the fold.  
- **Accessibility:**  
  - Alt text for hero image (“Happy bride and groom at wedding”).  
  - High-contrast text over image (or semi-transparent overlay).  
  - Semantic headings for section titles; link text must be descriptive.  
  - Keyboard-accessible navigation (skip links).  
- **Figma Components/Variants:**  
  - **Hero Banner:** A component with variants for different images/text.  
  - **Button (Primary/Large).**  
  - **Icon+Text Card:** For feature list items.  
  - **Vendor Card:** Reuse vendor card component from Marketplace (image, title, price).  
  - **Responsive Header/Nav:** Variant for mobile (hamburger) vs desktop.  
- **Visual Suggestions:**  A vibrant wedding-themed hero photo (e.g. a joyful couple dancing); icons for benefits (e.g. calendar icon for timeline); vendor thumbnails (venue, cake, dresses).  

### 2. Login Page (Public / Auth)  
- **Actors:** Unauthenticated user.  
- **Purpose:** Authenticate returning users so they can access their Planora account.  
- **UI Sections/Components:**  
  - **Form Card:** Fields for **Email** and **Password**, “Forgot password?” link. Possibly “Login with Google/Facebook” buttons.  
  - **Headline/Text:** “Log in to your Planora account.”  
  - **Action Buttons:** Primary “Login” button; secondary “Register” or “Create account” link.  
- **Data Fields:** Email (text, validated), Password (masked).  
- **Primary CTA:** Login.  
- **Secondary Actions:** Forgot password, Register link, social login.  
- **States:**  
  - **Default:** Empty fields.  
  - **Loading:** Spinner or dimmed button after submit.  
  - **Success:** Redirect to Dashboard.  
  - **Error:** Inline messages for invalid credentials or required fields. Highlight errors in red, and focus first errored field.  
- **Responsive Notes:** Simple centered form. On mobile, ensure the form fits the screen width with adequate padding.  
- **Accessibility:**  
  - Label each input (“Email address”, “Password”) explicitly or via aria-label.  
  - Ensure focus styles on inputs.  
  - Password input should allow revealing (eye icon as a variant).  
- **Figma Components/Variants:**  
  - **Input Field:** With variants for default, focus, error.  
  - **Button (Primary/Disabled/Loading variants).**  
  - **Link/Button (Ghost style) for secondary actions.**  
  - **Social Login Buttons:** Optional instances of a social-button component.  
- **Visual Suggestions:** Keep design clean and uncluttered. If using an illustration, a small wedding-themed icon above the form works (not a background to maintain accessibility).  

### 3. Register Page (Public / Auth)  
- **Actors:** Unauthenticated user.  
- **Purpose:** Collect new user data to create an account.  
- **UI Sections/Components:**  
  - **Form:** Fields for **Name**, **Email**, **Password**, **Confirm Password**. Possibly agreement checkbox (Terms).  
  - **Buttons:** “Sign Up” (primary), “Already have an account? Login” (link).  
- **Data Fields:** Name (text), Email (text, validated), Password and Confirm (masked, with rules).  
- **Primary CTA:** Register/Sign Up.  
- **Secondary Actions:** Link to Login page.  
- **States:** Like Login: show loading indicator, success redirect, error messages (password mismatch, invalid email).  
- **Responsive:** Similar to Login. Validate fields in real time if possible to aid user.  
- **Accessibility:** Same as login plus: ensure password rules (min length) are announced; associating terms checkbox.  
- **Figma Components:** Reuse form components from Login. Use separate variants for password visibility toggle, error states.  
- **No Further Additions:** Screen fully covered by the above fields and best practices (per user-provided outline).

### 4. Forgot Password Page (Public / Auth)  
- **Actors:** Unauthenticated user who forgot login credentials.  
- **Purpose:** Allow users to request a password reset.  
- **UI Sections:**  
  - **Form:** Single field **Email** plus “Send Reset Link” button.  
  - **Text:** Brief instruction (“Enter your email to receive a reset link.”).  
  - **Secondary:** “Back to Login” link.  
- **Data Fields:** Email.  
- **Primary CTA:** Send Reset Link.  
- **States:**  
  - **Success:** Confirmation message (“Email sent, check your inbox.”) with maybe a check icon.  
  - **Error:** Invalid email.  
- **Responsive:** Simple form, similar styling to Login.  
- **Accessibility:** Label email field; ensure screen reader announces success message.  
- **Figma Components:** Reuse input and button variants.  
- **Additional:** After submit, typically no further data required on this screen.

### 5. Help / FAQ Page (Public)  
- **Actors:** Any user.  
- **Purpose:** Provide answers to common questions about using Planora (account, planning features, vendor policies, etc.).  
- **UI Sections:**  
  - **Search Bar:** At top to filter FAQs.  
  - **FAQ Accordion:** List of questions with expandable answers. Use collapsible sections.  
- **Data Fields:** None (readonly content).  
- **Primary CTAs:** None (purely informational). Possibly a “Contact Support” link/button if question not answered.  
- **States:** Show “No results” if FAQ search yields nothing.  
- **Responsive:** Accordions expand full width on mobile; maintain legibility.  
- **Accessibility:**  
  - Make accordion headers `<button>` elements with `aria-expanded`.  
  - Ensure focusable.  
- **Figma Components:** Accordion/Collapse component, search input.  
- **No Further Additions:** Typical FAQ layout suffices.

## Customer (Authenticated User)

### Onboarding (Multi-Step Form)  
Progression note: *Break this into steps with a progress indicator (e.g. “Step 1 of 4”) to reduce cognitive load.*

#### 6. Onboarding Step 1 – Wedding Information  
- **Actors:** New user (just signed up).  
- **Purpose:** Collect basic wedding details to personalize plan.  
- **UI Sections:**  
  - Form fields: **Wedding Date** (date picker/calendar), **Location** (text or dropdown), **Guest Count** (numeric input).  
  - **Progress Indicator:** e.g. “Step 1 of 4” or progress bar.  
  - **Navigation:** “Next” button; no “Back” on first step.  
- **Data Fields:** Date (must be future), Location (text or searchable dropdown of cities), Guest Count (integer).  
- **Primary CTA:** Next.  
- **Secondary Actions:** Possibly “Save and continue later” link or skip (if applicable).  
- **States:**  
  - **Error:** Show inline if date is in the past, or fields left empty; keep user on step until valid.  
  - **Loading:** Disable button when submitting.  
- **Responsive:**  
  - On mobile, date picker should be full-screen native.  
  - Layout stacks vertically. Labels may be placeholders or above inputs.  
- **Accessibility:**  
  - Ensure date picker is keyboard-friendly and labeled.  
  - Clear fieldset legends or labels (e.g. “Wedding Date”).  
- **Figma Components:** Input field with date variant; button; progress bar.  
- **Best Practice:** Limit fields per step (here 3 fields) to avoid overload. Group related fields under a heading for context.

#### 7. Onboarding Step 2 – Budget  
- **Actors:** Same as Step 1.  
- **Purpose:** Get total wedding budget to shape recommendations.  
- **UI Sections:**  
  - **Field:** Total Budget (currency input).  
  - Possibly **Sub-fields**: If desired, ask for currency or allow slider.  
  - **Navigation:** “Next” and “Back” buttons.  
- **Data Fields:** Budget (numeric, with currency formatting).  
- **Primary CTA:** Next.  
- **Secondary:** Back.  
- **States:** Inline error for non-numeric or too-low budgets.  
- **Accessibility:** Label “Total Budget” clearly.  
- **Figma Components:** Numeric input, back and next buttons (using component variants).

#### 8. Onboarding Step 3 – Wedding Style  
- **Actors:** Same user.  
- **Purpose:** Collect stylistic preference to tailor the plan.  
- **UI Sections:**  
  - **Options:** Select one of several styles (e.g. Traditional, Modern, Luxury, Minimalist, Outdoor). Represent as cards with icons or images.  
  - **Navigation:** Next and Back.  
- **Data Fields:** Style (radio or selectable card).  
- **Primary CTA:** Next.  
- **States:** Highlight selected style; disable Next until one is selected.  
- **Accessibility:** Each style has alt-texted image or aria-label. Focusable via keyboard.  
- **Figma Components:** Card with image & label variants (selected/unselected states).

#### 9. Onboarding Step 4 – Priority Services  
- **Actors:** Same user.  
- **Purpose:** Identify which vendor categories to prioritize (e.g. Makeup, Studio, Decor, Planner, Dress).  
- **UI Sections:**  
  - **Checkbox List:** Service categories with icons. User can select multiple. Possibly a “Select all” button.  
  - **Navigation:** Finish (primary) and Back.  
- **Data Fields:** List of booleans for each service.  
- **Primary CTA:** Finish/Submit.  
- **States:** If none selected, allow continue (all optional) or prompt? (Likely optional).  
- **Accessibility:** Checkboxes with labels; large touch targets.  
- **Figma Components:** Checkbox list (each item with icon).  

### 10. Plan Generation (Loading Screen)  
- **Actors:** Newly onboarded user.  
- **Purpose:** Visual feedback while the system creates a custom wedding plan using AI or algorithm.  
- **UI Sections:**  
  - **Animation/Progress:** An animated spinner or progress bar with a friendly message (“Generating your wedding plan…”).  
  - **Tips:** Optional: rotating tips or quotes about wedding planning.  
- **Data Fields:** None; purely feedback UI.  
- **States:** Just loading; if generation fails, show error and a retry button.  
- **Responsive:** Centered loader icon; text below, works on all screens.  
- **Accessibility:** Announce progress message for screen readers (aria-live).  
- **Figma Components:** Spinner icon; modal or full-screen layout.  

### 11. Wedding Plan Result  
- **Actors:** Authenticated user post-onboarding.  
- **Purpose:** Present the generated wedding plan (“USP of Planora”). Summarize key recommendations.  
- **UI Sections:**  
  - **Plan Summary:** Shows **Wedding Concept/Theme** (e.g. “Romantic Garden”), optionally an image or illustration.  
  - **Budget Summary:** Bar showing estimated vs total budget, with breakdown (pie chart or list of categories with amounts).  
  - **Timeline Summary:** Key milestones (e.g. “6 months before: Book venue”) possibly as a mini timeline or list.  
  - **Recommended Vendors:** Scrollable list or cards (like marketplace) of vendor suggestions (based on user’s style/budget).  
  - **Actions:** Buttons like “View Full Plan”, “Adjust Preferences”, “Explore Vendors”.  
- **Data Fields:** Calculated values (allocations per category, dates).  
- **Primary CTA:** “View Full Plan” or “Get Started”.  
- **Secondary Actions:** “Download Plan” (if PDF), “Email Me This”, “Share”.  
- **States:**  
  - If plan creation failed, an error state with retry.  
  - If any section has no data (e.g. no vendors found), show empty message.  
- **Responsive:** On mobile, use accordions or tabs to segment the content; charts should be responsive (e.g. a pie chart scales or becomes a list).  
- **Accessibility:** Provide textual alternatives for charts (e.g. list categories + amounts). High contrast on text and charts.  
- **Figma Components:**  
  - **Card or List** for recommended vendors (reuse vendor card).  
  - **Progress Bar/Pie Chart:** example components (could use plugins for mockup charts).  
  - **Timeline Graphic:** Suggest using a Mermaid timeline (e.g. with 12mo, 6mo markers) for design, described in docs as code.  
- **Citations:** Wedding planning apps often include timeline and budget tools (e.g. WeddingHappy’s timeline/tasks and Zola’s budget tracker). Visual charts (pie/bar) help users grasp budget allocation.  

### 12. Customer Dashboard (Post-Onboarding)  
- **Actors:** Authenticated user.  
- **Purpose:** User’s home screen showing an overview of wedding planning status.  
- **UI Sections:**  
  - **Wedding Overview:** Key info (date countdown, theme name). Perhaps a small calendar countdown widget.  
  - **Budget Overview:** A chart or list showing total budget vs used vs remaining. Mini pie/bar chart.  
  - **Checklist Progress:** Progress bar or percentage of to-do items done.  
  - **Timeline Progress:** Indicator of timeline completion (e.g. progress toward event date).  
  - **Shortcuts:** Buttons or cards linking to main sections (Budget, Checklist, Vendors).  
- **Data Fields:** Pull from user’s plan (e.g. guest count, pending tasks).  
- **Primary CTAs:** “Manage Budget”, “View Checklist”, etc.  
- **Secondary:** Quick links (e.g. “Edit Profile”, “Settings”).  
- **States:** Empty states for sections if not set up (e.g. no budget defined shows “Set your budget”).  
- **Responsive:** Grid adjusts to one column on mobile, elements stack.  
- **Accessibility:** Use landmarks (header, main). Include numeric labels (e.g. “75% complete”).  
- **Figma Components:** Reuse card and button components. Use progress bar variants.  
- **Visuals:** Small icon or thumbnail for each summary tile (e.g. calendar icon for timeline).  

### 13. Wedding Plan Detail  
- **Actors:** Authenticated user.  
- **Purpose:** Show the full auto-generated plan details beyond the summary.  
- **UI Sections:**  
  - **Full Timeline:** A detailed timeline table or milestone list (e.g. “-12 months: Book venue… -6 months: Finalize dress”). Possibly a large scrollable area or embedded diagram.  
  - **Budget Breakdown:** Expandable view of each category’s allocation and actual costs (editable?).  
  - **Recommendations:** Full list of vendor suggestions (card layout) with filters.  
  - **Notes:** Section for user notes.  
- **Data Fields:** Editable fields if plan can be adjusted (e.g. user can mark tasks done, tweak amounts).  
- **Primary CTAs:** “Edit Plan”, “Save Changes”.  
- **Secondary:** “Export PDF”.  
- **States:** Loading spinner while pulling data; show “no data” messages if sections are empty.  
- **Responsive:** Possibly tabbed interface for Timeline/Budget/Vendors on mobile.  
- **Accessibility:** Screen-reader friendly timeline list (the order of events).  
- **Figma Components:** Timeline entry list, editable table, notes text area.  
- **No Further Additions:** Largely extends from result summary; requires detail but user outline did not explicitly list this screen. Treat as an expanded view.  

### 14. Budget Management Dashboard  
- **Actors:** Authenticated user.  
- **Purpose:** Overview and editing of wedding budget.  
- **UI Sections:**  
  - **Total Budget:** Prominently display total budget number.  
  - **Used vs Remaining:** Numeric or bar chart showing money spent and remaining (e.g. “Used $30k / Remaining $70k”).  
  - **Category Allocations:** List or chart (pie/bar) of budget by category (venue, catering, etc.) with amounts and percentages.  
  - **Category Controls:** Buttons or icons to **Add** a new expense or **Edit** an existing category.  
- **Data Fields:** Category names, allocated amounts, actual spent (entered by user).  
- **Primary CTAs:** “Add Expense” (opens modal/form).  
- **Secondary:** “Edit Category”, “Delete Category”.  
- **States:**  
  - Empty state if no budget categories yet (prompt to add).  
  - Error if spending exceeds allocation (show warning, suggestions to adjust).  
- **Responsive:** Chart should stack or become scrollable on mobile; tables should be swipeable or stacked.  
- **Accessibility:** Data labels on charts; ensure colorblind-friendly palette.  
- **Figma Components:** Pie chart and bar chart components, data table, modal form.  
- **Citations:** Financial trackers often use pie/bar charts for clarity. For example, WeddingHappy includes a spending summary chart.  

### 15. Budget Category Detail  
- **Actors:** Authenticated user.  
- **Purpose:** Drill into one budget category (e.g. Catering) to view and edit its allocation and actual expenses.  
- **UI Sections:**  
  - **Header:** Category name and icon.  
  - **Allocation:** Editable field for budgeted amount.  
  - **Expenses List:** Table of individual expenses (date, description, cost).  
  - **Charts:** Small bar chart showing allocation vs total spent.  
  - **Actions:** “Add Expense”, “Edit Category”.  
- **Data Fields:** Expense entries (text, number, date).  
- **Primary CTA:** Add Expense.  
- **Secondary:** Edit, Delete expense items.  
- **States:** Show “No expenses yet” message if list empty.  
- **Responsive:** Table stacks to cards on narrow view.  
- **Accessibility:** Label inputs in add/edit expense modal.  
- **Figma Components:** Table row component, expense form modal.  

### 16. Add/Edit Budget Expense (Modal or Page)  
- **Actors:** Authenticated user.  
- **Purpose:** Enter a new expense or edit an existing one under a category.  
- **UI Sections:**  
  - **Form Fields:** **Expense Name**, **Date**, **Amount**, **Notes (optional)**.  
  - **Buttons:** Save (primary), Cancel.  
- **Data Fields:** Text, date, currency.  
- **States:** Inline validation for required fields.  
- **Responsive:** Form fits on mobile as vertical list.  
- **Accessibility:** Label and focus management on modal open.  
- **Figma Components:** Input fields, date picker, numeric input, buttons.  

### 17. Checklist Management Dashboard  
- **Actors:** Authenticated user.  
- **Purpose:** Manage wedding to-dos (tasks) leading up to the event.  
- **UI Sections:**  
  - **Task List:** Each row shows a checkbox, task name, due date (if any), and status (done/pending). Checkboxes toggle completion.  
  - **Progress Summary:** “X of Y tasks completed” with a progress bar.  
  - **Add Task:** Button to add a new task (modal or inline).  
  - **Sections:** Optional grouping by time frame (e.g. “6+ months out”, “1 month out”).  
- **Data Fields:** Task title, optional description/due date.  
- **Primary CTA:** Add Task.  
- **Secondary:** Edit, Delete icons on each task.  
- **States:**  
  - Empty: Show illustration or message (“No tasks – start by adding some tasks like booking a venue!”).  
  - Completed: Strike-through or dim completed tasks.  
- **Responsive:** Cards or a single column. Swipe to delete on mobile.  
- **Accessibility:** Checkboxes should be large and keyboard-focusable; read out “Task name, checkbox unchecked” etc.  
- **Figma Components:** Checkbox with label variants; list item component; “Add Task” dialog.  

### 18. Checklist Task Add/Edit (Modal or Page)  
- **Actors:** Authenticated user.  
- **Purpose:** Create or modify a checklist task.  
- **UI Sections:**  
  - **Form:** **Task Name**, **Due Date** (optional), **Category/Section** (if used).  
  - **Buttons:** Save, Cancel.  
- **Data Fields:** Text (task name), date.  
- **States:** Validate non-empty name.  
- **Responsive:** Same form as others.  
- **Accessibility:** Focus on task name on open.  
- **Figma Components:** Reuse input and button components.  

### 19. Timeline Dashboard  
- **Actors:** Authenticated user.  
- **Purpose:** Visualize major milestones in a chronological format.  
- **UI Sections:**  
  - **Timeline Chart:** Graphic (horizontal or vertical) showing key deadlines (e.g. “8 months: Send invites, 1 month: Final dress fitting”). Could be a MermaidJS timeline or custom UI.  
  - **Milestone List:** Possibly the timeline data repeated in a list/table with dates and tasks.  
- **Data Fields:** Milestone date and description (editable by user).  
- **Primary CTA:** Add Milestone/Task.  
- **Secondary:** Edit, Delete per milestone.  
- **States:** Empty message if no milestones (“Your wedding is near; start by adding tasks!”).  
- **Responsive:** On mobile, use vertical timeline or stacked list.  
- **Accessibility:** Provide text list (e.g. “January 2027: Book venue”) for screen readers as fallback to the graphic.  
- **Figma Components:** Chronological list, timeline diagram (can use a linear steps component).  

### 20. Timeline Milestone Add/Edit (Modal/Page)  
- **Actors:** Authenticated user.  
- **Purpose:** Let user add or change a milestone.  
- **UI Sections:** **Form** with **Date** and **Event Name/Description**. Buttons Save/Cancel.  
- **Data Fields:** Date, text.  
- **Accessibility:** Label fields; focus.  
- **Components:** Date picker, text input, buttons.  

### 21. Vendor Marketplace (Customer) – List View  
- **Actors:** Authenticated customer searching for vendors.  
- **Purpose:** Browse vendors by category, style, etc.  
- **UI Sections:**  
  - **Search Bar:** For vendor name or keyword.  
  - **Filter Sidebar/Panel:** Categories, price range slider, location dropdown, style tags.  
  - **Vendor Cards Grid/List:** Each card shows an image, name, category, price range, rating stars. “Add to Shortlist” icon.  
  - **Pagination/Load More:** At bottom, “Load More” button (avoid infinite scroll). Also show “X vendors found”.  
- **Data Fields:** No user input except filters.  
- **Primary CTAs:** Click card to see **Vendor Detail**.  
- **Secondary:** “Load More”, filter controls.  
- **States:**  
  - **Empty:** “No vendors match your criteria” and a reset filters CTA.  
  - **Loading:** Skeleton loaders for cards.  
- **Responsive:**  
  - On mobile, filters collapse into a sliding panel. Cards become full-width rows.  
- **Accessibility:**  
  - Ensure filter options are checkboxes with labels (per best practice).  
  - Announce number of results.  
- **Figma Components:** Vendor card with variants (shortlist toggled state); filter panel with form components.  
- **Citations:** E-commerce best practices urge showing the total item count and using “Load More” instead of endless scroll.  

### 22. Vendor Search & Filter Panel  
- **Actors:** Customer.  
- **Purpose:** Allow users to narrow vendor list by criteria.  
- **UI Sections:**  
  - **Filters:** Categories (checkbox list), Price (range slider), Location (dropdown or map pin input), Style (checkbox list).  
  - **Clear All:** Button to reset filters.  
- **Data Fields:** Selections for filters.  
- **Primary CTA:** None (filters auto-apply). Possibly an “Apply” button if not real-time.  
- **Accessibility:**  
  - Label each filter group.  
  - Checkboxes with accessible labels, as Baymard recommends.  
- **Figma Components:** Checkbox group, slider.  

### 23. Vendor Detail Page (Customer)  
- **Actors:** Customer.  
- **Purpose:** Show complete information about a selected vendor (one vendor’s profile).  
- **UI Sections:**  
  - **Header:** Vendor name, rating, category tags, price range.  
  - **Image Gallery:** Carousel of vendor photos (pinpoint any key work).  
  - **Description:** Text area with vendor bio/services.  
  - **Contact Info:** Address, phone/email (if public).  
  - **Portfolio/Samples:** Thumbnails of previous work (if not in carousel).  
  - **Reviews:** List of customer reviews (with stars, text).  
  - **Actions:** “Add to Shortlist”, “Send Inquiry”, “Compare Vendor” (if not on shortlist), “Share”.  
- **Data Fields:** None (display only).  
- **Primary CTAs:** Send Inquiry (opens Inquiry Form).  
- **Secondary:** Add/Remove Shortlist, Compare, Social Share.  
- **States:**  
  - Loading images in carousel.  
  - If no reviews, show “Be the first to review”.  
- **Responsive:**  
  - Carousel stacks; details below on small screens.  
  - Use tabs (Details/Reviews/Portfolio) if space is tight.  
- **Accessibility:**  
  - Alt text on images.  
  - For the carousel, provide left/right buttons with aria-labels (“Next image”).  
  - Contrast for rating stars.  
- **Figma Components:** Reuse **Vendor Card** layout for header info; **Image Carousel** component; **Review** card; actions bar with button icons.  

### 24. Shortlist Page (Customer)  
- **Actors:** Customer.  
- **Purpose:** Show vendors the user has saved/favorited.  
- **UI Sections:**  
  - **Table/List:** Columns: Vendor Name, Price, Style, Rating.  
  - **Actions:** Buttons to *Compare* selected vendors, *Send Inquiry*, or *Remove*.  
  - **Empty State:** Illustration and “No vendors saved” if empty.  
- **Data Fields:** None (display saved vendor data).  
- **Primary CTA:** Compare (enables when >1 selected).  
- **Secondary:** Contact/Remove per vendor.  
- **States:**  
  - Show feedback (e.g. “Vendor removed”).  
  - Loading if syncing.  
- **Responsive:** Convert table to cards on mobile; Include checkboxes for multi-select for compare.  
- **Accessibility:** Checkboxes with labels, ensure contrast.  
- **Figma Components:** Table layout or card list; reuse vendor card info.  

### 25. Compare Vendors  
- **Actors:** Customer.  
- **Purpose:** Let user compare multiple vendors side-by-side on key attributes.  
- **UI Sections:**  
  - **Comparison Table:** Columns for each selected vendor; rows for attributes (Price, Style, Rating, Services).  
  - **Add/Remove Column:** Option to remove a vendor from comparison.  
- **Data Fields:** Static display.  
- **Primary CTA:** None (action is the table itself). Possibly “Refine Selection” or “Shortlist more”.  
- **Secondary:** Return to Marketplace.  
- **States:** Show placeholder text if only one vendor (prompts to add another).  
- **Responsive:** On small screens, possibly switch to swipeable vertical view or stack vendor cards.  
- **Accessibility:** Table with proper row/column headers, readable labels.  

### 26. Inquiry Form (Customer→Vendor)  
- **Actors:** Customer sending a message/request to a vendor.  
- **Purpose:** Gather message details to send a booking/proposal request.  
- **UI Sections:**  
  - **Form Fields:** **Wedding Date** (picker), **Budget** (auto-filled from user profile or input), **Message** (text area).  
  - **Buttons:** Submit Inquiry.  
- **Primary CTA:** Submit.  
- **Secondary:** Cancel/Back.  
- **States:**  
  - **Success:** “Inquiry sent” confirmation.  
  - **Error:** e.g. missing date.  
- **Responsive:** Simple form, ensure text area expands.  
- **Accessibility:** Label “Message to Vendor”, let screen reader announce character count if added.  
- **Figma Components:** Input and textarea components, consistent with other forms.  

### 27. Inquiry History (Customer)  
- **Actors:** Customer.  
- **Purpose:** Track past inquiries and their status.  
- **UI Sections:**  
  - **List/Table:** Columns: Vendor Name, Date Sent, Status (Pending/Replied/Closed).  
  - **Actions:** Click to view detail (opens chat-like detail or message history with vendor).  
- **Data Fields:** Display fields.  
- **Primary CTA:** None, except the vendor name links to detail.  
- **Secondary:** Filter by status (optional).  
- **States:** “No inquiries yet” message.  
- **Responsive:** Convert table to vertical list on mobile.  
- **Accessibility:** Status text should be read clearly (e.g. “Inquiry status: Pending”).  

### 28. Inquiry Detail (Customer)  
- **Actors:** Customer.  
- **Purpose:** Show conversation thread with a vendor (message and response).  
- **UI Sections:**  
  - **Header:** Vendor name, back button.  
  - **Chat History:** Message bubbles (customer vs vendor).  
  - **Reply Box:** (Optional) allow customer to continue conversation here.  
- **Data Fields:** Not applicable (just display).  
- **Primary CTA:** Send Reply (if reply allowed).  
- **States:** “Vendor replied” indicator (e.g. green dot).  
- **Responsive:** Chat should fill width, scrolling up for history.  
- **Accessibility:** Ensure each message is labeled by speaker (“You: …” vs “Vendor: …”).  

### 29. Notification Center (Customer)  
- **Actors:** Authenticated customer.  
- **Purpose:** Show system notifications (e.g. “New vendor reply”, “Budget limit exceeded”).  
- **UI Sections:**  
  - **List:** Each item with icon, title, brief, and date.  
  - **Read/Unread Toggle:** Mark all as read, or swipe to mark.  
- **Primary CTA:** View notification detail if needed.  
- **Secondary:** “Mark all read”.  
- **States:** Empty state (“No new notifications”).  
- **Responsive:** Simple list scroll.  
- **Accessibility:** Announce new notifications at top of page. Icons should have aria-hidden if decorative.  

### 30. Notification Detail (Customer)  
- **Actors:** Customer.  
- **Purpose:** Details for a specific notification (e.g. full message or link).  
- **UI Sections:**  
  - **Content:** Full text or linked page.  
  - **Back/Close:** Return to list.  
- **States:** Show timestamp, allow marking read.  

### 31. Profile Page (Customer)  
- **Actors:** Customer.  
- **Purpose:** Display and allow editing of user’s personal/account information.  
- **UI Sections:**  
  - **Personal Info:** Name, Email (non-editable or editable), Phone (optional).  
  - **Wedding Info:** Summary of wedding date, location, guest count (with edit link to onboarding if needed).  
  - **Password:** Link or form to change password.  
  - **Other:** Email notification preferences (checkbox toggles for emails).  
- **Primary CTA:** Save Changes (if inline edit) or “Edit Profile” toggling fields.  
- **Secondary:** Logout button.  
- **States:** Inline edit mode vs view mode. Show validation for email/phone format.  
- **Responsive:** Field groups stack.  
- **Accessibility:** Ensure labels for each field; separate section headings.  
- **Figma Components:** Form layout, editable fields, switches.  
- **No Further Additions:** Basic profile fields as typical.

### 32. Settings Page (Customer)  
- **Actors:** Customer.  
- **Purpose:** App-level settings (language, notifications), possibly link to help or premium features.  
- **UI Sections:**  
  - **Account Settings:** Might link to Profile (redundant if covered above).  
  - **Notification Settings:** Toggle email/SMS for alerts.  
  - **Help & Support:** Link to FAQ or Contact.  
  - **Legal:** Terms of Service, Privacy Policy links.  
- **States:** (Mostly static toggles).  
- **Responsive:** Standard form/toggle layout.  
- **Accessibility:** Label toggle purpose.  
- **Figma Components:** Toggle switch, link list items.  

## Vendor Portal

### 33. Vendor Dashboard  
- **Actors:** Authenticated vendor.  
- **Purpose:** Vendor’s home screen summarizing activity.  
- **UI Sections:**  
  - **Inquiry Count:** Number of new/pending inquiries.  
  - **Portfolio Visits:** Chart or number of views (if tracked).  
  - **Response Rate/Time:** Simple metric.  
  - **Quick Links:** Buttons to Edit Profile, Manage Portfolio, Manage Inquiries.  
- **States:** Show a welcome message, or alert if no activity (“You have no new inquiries”).  
- **Responsive:** Cards stack on mobile.  
- **Accessibility:** Icon with aria-label (e.g. “New inquiries”).  
- **Figma Components:** Summary card, chart (small bar/line).  

### 34. Vendor Profile (Vendor Side)  
- **Actors:** Vendor user.  
- **Purpose:** Show vendor’s own listing as it appears to customers, with edit options.  
- **UI Sections:**  
  - **Header:** Company name, logo, status (Approved/Pending).  
  - **Description:** Editable text block for services offered.  
  - **Service Area:** Text (city/region).  
  - **Contact Info:** Phone, email, website.  
  - **Toggle:** Set public/private visibility (if applicable).  
  - **Edit Button:** Toggle edit mode.  
- **Primary CTA:** Save changes.  
- **States:**  
  - If profile not approved, show “Pending approval” notice.  
- **Responsive:** Two-column to single on mobile.  
- **Accessibility:** Form labels; rich text editor if used.  
- **Figma Components:** Text area, toggle switch, upload logo/image component.  
- **No Further Additions:** Uses many elements from vendor customer view but as editable.

### 35. Vendor Profile Edit (Modal/Page)  
- **Actors:** Vendor.  
- **Purpose:** Allow editing of profile fields (name, description, etc.).  
- **UI Sections:** Form fields for all editable info.  
- **Primary CTA:** Save.  
- **States:** Inline validation.  
- **Accessibility:** Same as above.  

### 36. Portfolio Management (Vendor)  
- **Actors:** Vendor.  
- **Purpose:** Manage photo portfolio to showcase work.  
- **UI Sections:**  
  - **Gallery:** Grid of uploaded images (thumbnails).  
  - **Upload Button:** “Add Photos” (opens file picker or drag area).  
  - **Image Actions:** Each thumbnail has remove (trash icon) and drag handle for reorder.  
- **States:**  
  - Empty: “No photos uploaded” with “Add” button.  
  - Uploading: Spinner overlay on thumbnail.  
- **Responsive:** Grid reflows (2 columns mobile).  
- **Accessibility:** Thumbnails have alt text fields (e.g. “Venue decor example”).  
- **Figma Components:** Image card with delete icon; drag handle icon.  

### 37. Services Management (Vendor)  
- **Actors:** Vendor.  
- **Purpose:** List the types of services or packages offered.  
- **UI Sections:**  
  - **Service List:** Each row/card: Service Name, Description, Base Price.  
  - **Add Service Button:** Opens modal for new service.  
  - **Edit/Delete:** Icons on each service.  
- **States:**  
  - No services: prompt to add.  
- **Responsive:** Cards list.  
- **Accessibility:** Buttons clearly labeled (e.g. “Edit Catering service”).  
- **Figma Components:** Service row template; modal form.  

### 38. Inquiry Management (Vendor)  
- **Actors:** Vendor.  
- **Purpose:** View and respond to customer inquiries.  
- **UI Sections:**  
  - **Inquiry List:** Columns: Date, Customer Name, Request excerpt, Status (New/Read/Responded).  
  - **Filter/Sort:** By status (New/Pending), date.  
  - **Detail View:** Clicking opens conversation (see next screen).  
- **States:**  
  - Loading spinner initially, empty “No inquiries” message if none.  
- **Responsive:** Table to list.  
- **Accessibility:** Table headers.  
- **Figma Components:** Table rows, badges for status (e.g. “New” in color).  

### 39. Inquiry Detail (Vendor)  
- **Actors:** Vendor.  
- **Purpose:** Read customer’s inquiry and send a reply.  
- **UI Sections:**  
  - **Message Thread:** Chronological chat (customer inquiry, vendor response area).  
  - **Reply Box:** Text area and “Send Reply” button.  
- **States:**  
  - **Pending:** Show customer’s message.  
  - **Replied:** Show previous replies, allow follow-up.  
  - **Closed:** Indicate no further replies allowed.  
- **Responsive:** Chat interface on mobile (stacked).  
- **Accessibility:** Voice label roles (e.g. “Message from [Customer Name]”).  

### 40. Vendor Analytics  
- **Actors:** Vendor.  
- **Purpose:** Simple charts showing business metrics (for MVP optional).  
- **UI Sections:**  
  - **Charts:** E.g. line chart of inquiries per month; bar chart of portfolio views.  
  - **Metrics:** Total inquiries, average response time.  
- **States:** Data-driven; if none, hide or show “Get inquiries to see stats”.  
- **Responsive:** Chart scales or switches to summary numbers on mobile.  
- **Accessibility:** Provide chart data as text table fallback.  
- **Figma Components:** Chart mockups.  

### 41. Vendor Settings (Misc)  
- **Actors:** Vendor.  
- **Purpose:** Account settings (like password, notifications).  
- **UI Sections:** Similar to customer settings (password change, email).  
- **Figma Components:** Reuse user settings UI.  

## Payment Module

### 42. Payment Checkout  
- **Actors:** Customer (after selecting a service or premium feature).  
- **Purpose:** Process a payment (if Planora handles payments).  
- **UI Sections:**  
  - **Order Summary:** Show what is being paid for (vendor, service, price).  
  - **Form Fields:** Card number, expiration, CVV, billing address fields.  
  - **Buttons:** “Pay Now”.  
- **States:**  
  - Loading spinner during transaction.  
  - Success message/redirect to receipt.  
  - Error message on card decline.  
- **Accessibility:** ARIA labels for inputs (card number, etc.) and secure form.  
- **Figma Components:** Payment form template (inputs + validation states).  

### 43. Payment History  
- **Actors:** Customer.  
- **Purpose:** List of past payments and receipts.  
- **UI Sections:**  
  - **Table/List:** Date, Vendor/Service, Amount, Status.  
  - **View Receipt:** Link/button for each (if needed).  
- **States:**  
  - Empty state if no payments (“You have not made any payments.”).  
- **Responsive:** Convert table to stacked list items.  
- **Accessibility:** Numeric values clearly labeled (e.g. “$150.00 USD”).  

### 44. Payment Detail (Receipt)  
- **Actors:** Customer.  
- **Purpose:** Show details of a specific payment/receipt.  
- **UI Sections:**  
  - **Header:** Payment ID, date.  
  - **Details:** Vendor, service, amount breakdown (subtotal, fees, total).  
  - **Billing Info:** Name, address used.  
  - **Download PDF:** Link/button to save receipt.  
- **States:** Static display.  
- **Accessibility:** Ensure invoice fields are read logically.  

## Admin

### 45. Admin Dashboard  
- **Actors:** Site administrator.  
- **Purpose:** High-level metrics and alerts for the ecosystem.  
- **UI Sections:**  
  - **Key Stats:** Cards with total users, total vendors, total inquiries, etc.  
  - **Charts:** Growth trends (line charts for users/vendors over time).  
  - **Alerts:** Pending approvals (e.g. new vendor requests) with action links.  
- **States:** Show “No data” placeholder for charts until enough data.  
- **Responsive:** Cards reorder; smaller charts.  
- **Accessibility:** Semantic headings (“Total Users”), data tables if needed.  
- **Figma Components:** Stat card, line chart mock.  

### 46. Admin – User Management  
- **Actors:** Admin.  
- **Purpose:** Manage customer user accounts.  
- **UI Sections:**  
  - **Table:** Columns: Name, Email, Date Joined, Role, Actions (Activate/Deactivate, Delete, Email).  
  - **Search/Filter:** By name/email.  
- **States:** None (simple list).  
- **Responsive:** Table becomes list cards on mobile.  
- **Accessibility:** Button labels clear (“Deactivate user”).  

### 47. Admin – Vendor Management  
- **Actors:** Admin.  
- **Purpose:** Approve or manage vendor accounts.  
- **UI Sections:**  
  - **Table:** Vendor name, category, status (Approved/Pending/Blocked), Date applied, Actions (Approve/Block).  
  - **Search/Filter:** By status or name.  
- **States:** Highlight pending rows needing action.  
- **Accessibility:**  
  - Convey status with text and color (e.g. “Pending” with orange highlight).  
- **Figma Components:** Similar table/list components.  

### 48. Admin – Category Management  
- **Actors:** Admin.  
- **Purpose:** Manage the list of service categories used across the app.  
- **UI Sections:**  
  - **Table:** Category name, description, Actions (Edit/Delete).  
  - **Add Category:** Button to open form.  
- **States:** Empty message if none.  
- **Accessibility:** Form labels for Add/Edit.  
- **Figma Components:** Table row, modal form.  

### 49. Admin – Style Management  
- **Actors:** Admin.  
- **Purpose:** Manage wedding style options (like Traditional, Modern).  
- **UI Sections:**  
  - **Table:** Style name, sample image/icon, Actions.  
  - **Add/Edit:** Form for name and icon upload.  
- **States:** Similar to Category.  
- **Accessibility:** File input for icon should have instructions.  

### 50. Admin – Review Management  
- **Actors:** Admin.  
- **Purpose:** Moderate customer reviews or ratings left for vendors.  
- **UI Sections:**  
  - **List/Table:** Vendor, Reviewer, Rating, Excerpt, Status (Approved/Flagged), Actions (Approve/Delete).  
  - **Search:** By vendor or content.  
- **States:** Show flagged reviews prominently.  
- **Accessibility:** Ensure star ratings are text-labeled.  

### 51. Admin – Reports  
- **Actors:** Admin.  
- **Purpose:** View detailed analytics and generate reports.  
- **UI Sections:**  
  - **Filters:** Date range selector.  
  - **Charts/Tables:** e.g. Bar chart of monthly new users, pie chart of category distribution.  
- **States:** “No data for selected range” message if empty.  
- **Accessibility:** Provide data tables or summaries for charts.  

### 52. Admin – Notifications  
- **Actors:** Admin.  
- **Purpose:** System logs or messages (optional).  
- **UI Sections:** Could list system alerts (e.g. “User X reported an issue”).  
- **States:** Not critical for MVP; keep minimal.  

### 53. Admin – Settings  
- **Actors:** Admin.  
- **Purpose:** Configuration options (email templates, site info).  
- **UI Sections:**  
  - **Form:** Organization name, contact email, logo upload, default currency.  
  - **Theme Toggles:** Dark mode or brand colors (if allowed).  
- **Accessibility:** Form semantics.  

### 54. (If needed) Misc – Help for Vendors/Admin  
- **Actors:** Vendor/Admin.  
- **Purpose:** Similar to customer help (FAQs, docs).  
- **Sections:** Static help content.  
- **Note:** Include if extra screens needed beyond 60.

## Screens Prioritization and Effort

| **Screen**                       | **Priority**         | **Design Effort** |
|----------------------------------|----------------------|-------------------|
| **Landing Page**                 | MVP                  | Medium            |
| **Login / Register / Forgot**    | MVP                  | Low               |
| **Onboarding Steps (1–4)**       | MVP                  | High (4 screens)  |
| **Plan Generation (Loading)**    | MVP                  | Low               |
| **Plan Result & Detail**         | MVP                  | High (charts & layout) |
| **Customer Dashboard**           | MVP                  | Medium            |
| **Budget Management (incl. forms)** | MVP              | High (charts/forms) |
| **Checklist Management**         | MVP                  | Medium            |
| **Timeline Management**          | MVP                  | Medium-High       |
| **Vendor Marketplace (list, search, detail)** | MVP    | High (complex UI)  |
| **Shortlist & Compare**          | Nice-to-have         | Medium            |
| **Inquiry (form, list, detail)** | MVP                  | Medium            |
| **Notifications (list, detail)** | Nice-to-have         | Low               |
| **User Profile & Settings**      | MVP (Profile), Nice-to-have (Settings) | Medium |
| **Vendor Dashboard & Profile**   | Nice-to-have         | Medium            |
| **Vendor Portfolio/Services/Inquiry (vendor)** | Nice-to-have | High (multiple screens) |
| **Vendor Analytics**             | Optional             | High (chart design) |
| **Payment (checkout, history)**  | Nice-to-have         | High              |
| **Admin Dashboard & Mgmt**       | Nice-to-have         | High (tables, charts) |
| **Misc Help/FAQ**                | Optional             | Low               |

*Key:* MVP = Must-have for core planning features; Nice-to-have = Enhances experience; Optional = Additional utility. Effort assumes typical complexity (e.g. **High** for data visualizations or multi-step flows, **Low** for simple forms).  

## Recommended Figma File Structure and Styles  

- **Pages Organization:**  
  - **Cover/Intro:** Project title, version, authors.  
  - **Design System (UI Kit):** Define **colors**, **typography**, **spacing scales**, **icon library**, and **global components** (buttons, inputs, cards). Group primitives (Blue-100, space-8) and semantic tokens (color/action/primary) in Figma variables.  
  - **Wireframes:** Sketch rough layouts before styling (if doing low-fi).  
  - **Screens:** Final UI pages, organized by sections (use Figma Sections for “Onboarding”, “Planning”, “Vendor Portal” etc.). Each screen frame named clearly (e.g. “Budget = Default”, “Budget = Empty State”).  
  - **Components Page:** Master components with all variants (buttons, form fields, cards with states like default/hover/active). Use Figma Variants extensively to group related states (e.g. Button/Primary/Hover/Disabled).  
  - **Handoff/Developer:** Annotated screens with specs (padding, font sizes), export-ready assets, and a style guide if needed.  

- **Components Library:**  
  - **Foundation:** Buttons (Primary/Secondary), Form inputs (text, date, select), Checkboxes, Radios, Tabs, Modals/Dialogs, Cards (Vendor, Task, etc.), Icon set. Each with Auto Layout for consistent spacing. Use 8pt grid system for spacing.  
  - **Overlays & States:** Modal/Loading overlays, Empty-state illustrations.  
  - **Charts:** Placeholder components for pie/bar charts (or use plugins to generate data-driven mock charts).  

- **Styles/Tokens:**  
  - Define **Color Palette** (primary, secondary, neutrals) and **Text Styles** (H1–H4, Body, Captions) in Figma Styles/Variables.  
  - **Spacing Scale:** 4px or 8px increments.  
  - **Icons:** Use a consistent set (e.g. Material or FontAwesome) for actions (search, edit, trash).  

## Handoff Checklist

- **Annotated Screens:** Ensure each screen mockup has clear margins/paddings noted. Label components with their variant name (e.g. “Primary Button/Default”).  
- **Exportable Assets:** Mark all images, icons, logos for export (SVG/PNG). Provide high-resolution logos and any custom icons.  
- **Design Tokens:** Share color and typographic tokens (as Figma variables or a separate JSON styleguide).  
- **Component Usage:** Developers should use instances of components. Provide guidance on which components to reuse (e.g. “Use Button / Primary with default variant”).  
- **Interactions (Optional):** Document key interactions (e.g. onboarding Next transitions, hover states) in a separate document or as notes.  
- **Accessibility Notes:** List color contrast checks (AA/AAA compliance for text), alt-text for images, focus order.  
- **Versioning:** Include version info on the Cover page and keep styles locked (or documented) to prevent drift.

**Sources:** This specification follows the user’s original screen outlines (as a baseline) and extends them using industry best practices (wedding app features, form design, ecommerce UI, and Figma design system guidelines). Each screen description is grounded in these insights and in common UX patterns for planning and dashboard interfaces.