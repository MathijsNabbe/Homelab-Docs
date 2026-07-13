# Homelab Docs
A GitHub-Pages-powered automatic visualization of your Docker homelab configuration.

This repository contains:

- A .NET parser that scans Docker Compose files and generates a service mapping.
- A web-based visualizer that displays your infrastructure.
- GitHub Actions automation to build the parser, generate the mapping, build the website, and deploy it to GitHub Pages.

The repository is designed to be forked. Your own Docker Compose repository can be connected as a private submodule, allowing you to keep infrastructure details private while still using this visualization.

## Table of Contents

- [1. Forking the Repository](#1-forking-the-repository)
- [2. Configure Your Own Services Repository](#2-configure-your-own-services-repository)
- [3. Replace the Submodule with your Source-Of-Truth](#3-replace-the-submodule-with-your-source-of-truth)
- [4. Run The Project Locally](#4-run-the-project-locally)
  - [4.1 Run Parser (Generate `mapping.json`)](#41-run-parser-generate-mappingjson)
  - [4.2 Run The Visualizer](#42-run-the-visualizer)
- [5. Configure GitHub Actions Access to Your Private Submodule](#5-configure-github-actions-access-to-your-private-submodule)
  - [5.1 Create a Personal Access Token](#51-create-a-personal-access-token)
  - [5.2 Add the Token to Repository Secrets](#52-add-the-token-to-repository-secrets)
- [6. Enable Github Pages](#6-enable-github-pages)
  - [6.1 Enable Pages Deployment & Active workflows](#61-enable-pages-deployment--active-workflows)
- [7. Updating Your Source-Of-Truth](#7-updating-your-source-of-truth)

---

## 1. Forking the Repository

1. Open the repository on GitHub.
2. Click **Fork** in the top-right corner.
3. Select your GitHub account as the destination.
4. Clone your new (forked) repository on your local machine:

```bash
git clone https://github.com/<your-username>/<your-fork>.git
cd <your-fork>
```

---

## 2. Configure Your Own Services Repository
This repository uses a Git submodule as a Source-Of-Truth for your Docker Compose files. This decision keeps sensitive infrastructure details in a private repository while allowing you to update this visualization repository without risking accidental overwrites of your Docker Compose configuration. The default submodule points to the original author's private repository. After forking, you should replace it with your own repository.

The parser will recursively find all compose files in your repository and map them based on the 2 parent-folders:

```
<repo-root>/
├── <device>/
│   └── <service>/
│       └── compose.yml
```
Example:
```
<repo-root>/
├── server01/
│   ├── portainer/
│   │   └── docker-compose.yml
│   └── prometheus/
│       └── compose.yaml
│
└── server02/
    └── minecraft/
        └── docker-compose.yml
```
Create a new repository, or rebuild your existing Source-Of-Truth to apply to this format before continuing.

---

## 3. Replace the Submodule with your Source-Of-Truth

On your machine where you just cloned your fork of the repo, remove the existing submodule:

```bash
git submodule deinit -f Services
git rm Services
rm -rf .git/modules/Services
```

Add your own repository:

```bash
git submodule add https://github.com/<your-username>/<your-services-repo>.git Services
```

Commit & Push the change:

```bash
git add .gitmodules Services
git commit -m "Replace Services submodule"
git push
```

If all steps have been executed correctly and you have access to the repository used as submodule, update the local branch with the submodule:

```bash
git submodule update --init --recursive
```

---

## 4. Run The Project Locally

### 4.1 Run Parser (Generate `mapping.json`)

1. Make sure the correct .NET SDK is installed.
2. Build the Parser:

```bash
dotnet build Parser/src/Parser/Parser.csproj
```

3. Execute the generated DLL:

```bash
dotnet run --project Parser/src/Parser/Parser.csproj
``` 

This will generate mapping.json, a static map of all compose files in your submodule.

### 4.2 Run The Visualizer

1. Make sure the correct Node.js version is installed.
2. Install dependencies:

```bash
cd Visualizer
npm install
```

3. Start the server:

```bash
npm run dev
```

The URL will be displayed in the terminal. The page should correctly visualize your Source-Of-Truth.

---

## 5. Configure GitHub Actions Access to Your Private Submodule

If your Source-Of-Truth repository is private (recommended), GitHub Actions needs permission to clone it.

### 5.1 Create a Personal Access Token

1. On Github.com, go to **GitHub → Settings → Developer settings → Personal access tokens**.
2. Create a **Fine-grained token**.
3. Configure **Repository access --> Only select repositories --> Your Source-Of-Truth-Repo**.
4. Configure **Permissions --> Repository permissions --> Contents [Read-only]**.
5. Generate the token and copy the value.

### 5.2 Add the Token to Repository Secrets

1. Navigate to your fork of Homelab-Docs (not your Source-Of-Truth) on github.com. Navigate to **Settings --> Secrets & variables --> Actions --> New repository secret**.
2. Name the token **HOMELAB_DOCS_SUBMODULE** and paste your PAT (Personal Access Token)

The GitHub Actions workflow will use this token to clone your private Source-Of-Truth during deployment.

---

## 6. Enable Github Pages

After forking, setting up your own submodule, and setting up submodule access through a PAT, enable GitHub Pages for your (forked) repository.

### 6.1 Enable Pages Deployment & Active workflows

on Github.com navigate to your fork and go to **Settings --> Pages**. Under **Build and deployment** select **Source: Github Actions**. Set a custom domain or use the predefined address. After that, navigate to **Settings --> Actions --> General**. Under **Workflow permissions** enable **Read and write permissions**. Do not forget to save.

After this step your Github Pages site will automatically update on every commit. This means it will automatically redeploy to Github Pages when updating your fork, either pulling updates from the source-repository or when manually updating your submodule. The initial trigger of the first deploy (or anytime a redeployment is needed) can be done via **Actions --> Build, Execute & Deploy to Github Pages --> Run Workflow**. When deployment is completed, your Github Pages url can be found when clicking on the run, under **deploy-pages**.

## 7. Updating Your Source-Of-Truth

When you add or modify compose files in your Source-of-Truth repository: 

1. Commit and push the changes:

```bash
git add .
git commit -m "Update services"
git push
```

2. Navigate to your forked Homelab-Docs repository and update the submodule:

```bash
git submodule update --remote Services
git add Services
git commit -m "Update services mapping"
git push
```
