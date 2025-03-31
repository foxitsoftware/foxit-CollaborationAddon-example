## Project Structure

```
collabClientReactSample
├── public
      ├── assets (Default document and project related image resources)
      ├── index.html (Framework template)
├── script (Project scaffold configuration)
├── src
      ├── components
           ├── CollaborationModal (Collaboration business modal)
           ├── CreateCollaboration (Create Collaboration)
           ├── CreatorOperationModal (Creators collaboration on related operations)
           ├── FileList (File list and collaboration list)
           ├── InviteUser (Invite User)
           ├── ScreenSync (Online memebers and screenSync)
           ├── ParticipantModal (Participant business modal)
           ├── ParticipantOperationPopover  (Participant collaboration on related operations)
           ├── Participants (Collaboration members)
           ├── PDFViewer  (Init pdfviewer by websdk)
           ├── SetCommentPermission  (Select can comment component)
           ├── SetPublicPermission  (Select can public component)
           ├── TopNav  (Collaboration top bar view component)
      ├── pages
           ├── CollabView
           ├── StartPage
      ├── utils (Method encapsulation)
      ├── App.tsx (Routing configuration)
      ├── config.ts (Server address configuration)
├── .env (Local configuration connection server address)
├── package.json
└── tsconfig.client.json
```

## Quick Start

Install Dependencies: `npm install`.

Start the dev server: `npm run start` .

The application will be running on http://localhost:3000.

This sample shows a simple demo application covering the use scenarios of collaboration module.

1. The pdf viewer component is based on the websdk package,
   implements the container for pdf document display, and configures some toolbars and left toolbars.
2. The business component mainly implements some business scenarios about how users call the collab sdk api.


