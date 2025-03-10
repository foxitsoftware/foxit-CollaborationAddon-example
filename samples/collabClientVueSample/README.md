# collabClientVueSample

## Project Structure

``` js

├── public (Default document and ico)
├── src
      ├── assets (project related image resources)
      ├── common 
      ├── components
           ├── CollaborationModal (Collaboration business modal)
           ├── CreateCollaboration (Create Collaboration)
           ├── CreatorOperationModal (Creators collaboration on related operations)
           ├── FileList (File list and collaboration list)
           ├── InviteUser (Invite User)
           ├── ParticipantModal (Participant business modal)
           ├── ParticipantOperationPopover  (Participant collaboration on related operations)
           ├── Participants (Collaboration members)
           ├── PDFViewer  (Init pdfviewer by websdk)
           ├── ScreenSync (Online memebers and screenSync)
           ├── SetCommentPermission  (Select can comment component)
           ├── SetPublicPermission  (Select can public component)
           ├── TopNav  (Collaboration top bar view component)
      ├── locales 
      ├── pages
           ├── CollabView
           ├── StartPage
      ├── router (Routing configuration)
      ├── service
      ├── store
      ├── types
      ├── utils (Method encapsulation)
      ├── App.less
      ├── App.vue
      ├── config.ts (Server address configuration)
      ├── main.ts
      ├── shim-vue.d.ts
├── env.d.ts
├── index.html (Framework template)
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts (Project scaffold configuration)
```

## Development environment setup  

### Setup Nodejs

1. install Nodejs, preferred version: nodejs 20 and 22+ lts. (Base on Vite 6)

``` sh
node -v 
# v20.10.0
```

## Quick Start

Install Dependencies: `npm install`.

Start the dev server: `npm run start` .

The application will be running on <http://localhost:5173>.

This sample shows a simple demo application covering the use scenarios of collaboration module.

1. The pdf viewer component is based on the websdk package,
   implements the container for pdf document display, and configures some toolbars and left toolbars.
2. The business component mainly implements some business scenarios about how users call the collab sdk api.
