
# OneDrive Explorer App

A simple interface to connect with OneDrive and present the files and folders that a user has, along with the permissions granted for the files.

## Tech Stack
**Client:** Server Side Rendered using Handlebars(hbs view engine)

**Server:** Node, Express, Microsoft Graph SDK

## Features

 **List Files** - The app fetches the files and folders in the root directory upon successful login. The user can then navigate in subdirectories by clicking on any folder.

 **Download Files** - In the directory view, upon click of a file, the file gets downloaded into the user's device. Upon click of a folder, it navigates into the folder and returns the contents within selected folder.

 **Permissions** - User can view the permissions granted to each file. Click on the "user" icon present beside files to view permissions. These permissions are the latest. If permissions are added/ removed, these are reflected in the permissions modal.

## Prerequisites

 **An Azure Application**
  - Set `Supported Account Types` as **Accounts in any organizational directory**
  - Save the `client_id` and `client_secret`(create a new client_secret if not saved).

 **App Permissions**:
   - `Files.Read.All` - Delegated
   - `Sites.FullControl.All` - Application
   - `User.Read` - Delegated

 **Configure the Callback URL in App Settings**
   - Navigate to your Azure app on the portal.
   - In the Overview menu, select **Redirect URIs**.
   - Create a Web URI and paste `http://localhost:3000/auth/callback`.


## Run Locally

Clone the project, and navigate to directory

```bash
  git clone https://github.com/ritvikPuranik/OneDriveApp.git
  cd OneDriveApp
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm start
```
On a browser window, launch http://localhost:3000 and watch the magic!

## Demo

https://www.loom.com/share/c037141c4b0a46e2a17f6e696f46e869


## Authors

- [@ritvikPuranik](https://github.com/ritvikPuranik)

