Email Client
This is a web-based email client application built using Django and JavaScript. The application allows users to send, receive, and manage emails in their browser.

Features
Send Mail: Compose and send emails to recipients.
Mailbox: View emails in different mailboxes such as Inbox, Sent, and Archive.
View Email: Click on an email to view its content, sender, recipients, subject, timestamp, and body.
Archive and Unarchive: Archive or unarchive emails.
Reply: Reply to emails with pre-filled recipient, subject line, and body.

Usage
Sign up for an account or log in if you already have one.
Navigate between mailboxes: Inbox, Sent, and Archive.
Click on an email to view its details.
Compose a new email by clicking on the "Compose" button.
Reply to an email by clicking on the "Reply" button.
Archive or unarchive emails by clicking on the corresponding button.

API Endpoints
GET /emails/<mailbox>: Get emails in a specific mailbox.
GET /emails/<email_id>: Get details of a specific email.
POST /emails: Send a new email.
PUT /emails/<email_id>: Update the status of an email.

Technologies Used
Django
Python
JavaScript
HTML
CSS

Credits
This project is part of the CS50W course by Harvard University.
