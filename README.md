# Next.js Project Setup Guide

## Prerequisites

Before running the project, ensure you have the following installed:

### 1. Install Node.js and npm (or yarn)

- **Linux**:
  ```sh
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
- **MacOS** (using Homebrew):
  ```sh
  brew install node
  ```
- **Windows**:
  - Download and install from [Node.js official site](https://nodejs.org/)

### 2. Install a Package Manager (Optional)

- Use `npm` (comes with Node.js) or install `yarn`:
  ```sh
  npm install -g yarn
  ```

### 3. Install Git

- **Linux**:
  ```sh
  sudo apt-get install git
  ```
- **MacOS**:
  ```sh
  brew install git
  ```
- **Windows**:
  - Download and install from [Git official site](https://git-scm.com/)

---

## Project Setup

### Clone the repository

```sh
git clone https://github.com/ice-pattanachai/deepseek.git
cd deepseek
```

### Install dependencies

```sh
npm install
# OR
yarn install
```

---

## Running the Project

### Start the development server

```sh
npm run dev
# OR
yarn dev
```

- The app will be available at `http://localhost:3000`

---

## Building for Production

### Create a production build

```sh
npm run build
# OR
yarn build
```

### Run the production server

```sh
npm run start
# OR
yarn start
```

---

## Additional Dependencies

- **Docker** (Optional, for containerization)

  ```sh
  sudo apt-get install docker.io    # Linux
  brew install docker               # MacOS
  ```

  - Windows: Install Docker Desktop from [Docker official site](https://www.docker.com/)

- **PM2** (Optional, for running in the background)

  ```sh
  npm install -g pm2
  pm2 start npm --name "next-app" -- run start
  ```

---

## Deployment

- Deploy using **Vercel** (Recommended):
  ```sh
  npm install -g vercel
  vercel
  ```
- Deploy manually:
  ```sh
  npm run build
  npm run start
  ```

---

## Troubleshooting

- If there are issues with dependencies, try:
  ```sh
  rm -rf node_modules package-lock.json
  npm install
  ```
- If port `3000` is in use:
  ```sh
  npx kill-port 3000
  ```
- Check logs:
  ```sh
  npm run build && npm run start
  ```
