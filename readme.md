# Reward Server

A distributed reward system service designed to calculate and distribute rewards among operators' hotspots (WUBI/WUPI) based on device scores and multipliers. This server integrates with external APIs for score calculation and uses Solana blockchain for reward distribution.

## 📋 Table of Contents

* [Overview](#overview)
* [Features](#features)
* [Architecture](#architecture)
* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Configuration](#configuration)
* [Usage](#usage)
* [Project Structure](#project-structure)
* [API Integration](#api-integration)
* [Docker Deployment](#docker-deployment)
* [Kubernetes Deployment](#kubernetes-deployment)
* [Development](#development)
* [Contributing](#contributing)
* [License](#license)

## 🎯 Overview

Reward Server is a TypeScript-based microservice that:

* **Calculates rewards** based on device scores and multipliers
* **Distributes rewards** via Solana blockchain (mainnet/devnet)
* **Processes scores** from external APIs:
  + **NAS API** for WUPI devices
  + **WiFi API** for WUBI devices
* **Manages reward pools** and epochs
* **Handles asynchronous processing** via RabbitMQ message queues
* **Automates reward cycles** using cron jobs

## ✨ Features

* 🚀 **Koa.js** web framework for HTTP server
* 📊 **PostgreSQL** database for data persistence
* 🐰 **RabbitMQ** integration for asynchronous message processing
* ⛓️ **Solana blockchain** integration for reward distribution
* 🔄 **Automated cron jobs** for reward processing
* 🎯 **Rate limiting** for API requests
* 📈 **Network score calculation** for reward distribution
* 🔍 **Error handling and recovery** mechanisms
* 🐳 **Docker** support for containerized deployment
* ☸️ **Kubernetes** manifests for orchestration

## 🏗️ Architecture

The server follows a modular architecture:

```
┌─────────────────┐
│   HTTP Server   │ (Koa.js)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│RabbitMQ│ │PostgreSQL│
└───┬───┘ └───┬────┘
    │         │
┌───▼─────────▼───┐
│  Reward Engine  │
│  - Score Calc   │
│  - Pool Mgmt    │
│  - Epoch Proc   │
└───┬─────────────┘
    │
┌───▼────┐
│ Solana │
│Blockchain│
└────────┘
```

### Core Services

* **Rewards Per Epoch**: Processes and distributes rewards for each epoch
* **Pool Per Epoch**: Manages reward pools and network score calculations
* **RabbitMQ Consumers**: Handles asynchronous message processing from WUBI/WUPI APIs
* **Solana Services**: Manages blockchain transactions for reward distribution
* **Event Hub**: Centralized event management system
* **Cron Jobs**: Automated reward processing and status updates

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js** (v18 or higher)
* **npm** or **yarn**
* **PostgreSQL** (v12 or higher)
* **RabbitMQ** (v3.8 or higher)
* **TypeScript** (v5.4 or higher)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd reward-server
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp env.example.env .env
```

Edit `.env` with your configuration (see [Configuration](#configuration) section).

### 4. Set Up Database

Ensure PostgreSQL is running and create the database:

```bash
createdb your_database_name
```

### 5. Build the Project

```bash
npm run build
```

## ⚙️ Configuration

### Environment Variables

Key environment variables to configure:

#### Database Configuration

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=your_database_name
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_SSL=false
```

#### RabbitMQ Configuration

```env
RABBIT_USER=your_rabbitmq_user
RABBIT_PASS=your_rabbitmq_password
RABBIT_HOST=your_rabbitmq_host:5672
RABBIT_RATE_LIMIT_PER_SECOND=40
```

#### Queue Names

```env
WUBI_API_QUEUE=wifi_api_queue
WUBI_API_QUEUE_RESPONSE=reward_server_local
WUPI_API_QUEUE=wupi_score_queue_local
WUPI_API_QUEUE_RESPONSE=reward_server_local_wupi
```

#### Solana Configuration

```env
SOLANA_ENV=devnet  # or 'mainnet'
SOLANA_API_KEY=your_solana_api_key
SOLANA_API_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=your_solana_private_key
```

#### NAS API Configuration

```env
NAS_API=http://nas-api
NAS_API_KEY=your_nas_api_key
```

#### Server Configuration

```env
PORT=1339
NODE_ENV=development
REWARDS_MODE=production  # or 'test'
ENABLE_ERROR_SIMULATION=false
REWARDS_PERIOD=mainnet  # or 'devnet'
```

### Rate Limiting

The server includes rate limiting for RabbitMQ consumers to prevent RPC errors. Configure it using:

```env
RABBIT_RATE_LIMIT_PER_SECOND=40
```

See [README-RATE-LIMITER.md](./README-RATE-LIMITER.md) for detailed information.

## 💻 Usage

### Development Mode

Run the server in development mode with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:1339` (or your configured PORT).

### Production Mode

1. Build the project:

```bash
npm run build
```

2. Start the server:

```bash
npm start
```

### Docker Deployment

Build and run with Docker:

```bash
# Build the image
docker build -t reward-server .

# Run the container
docker run -p 1339:80 --env-file .env reward-server
```

### Kubernetes Deployment

Deploy to Kubernetes using the provided manifests:

```bash
kubectl apply -f kubernetes/
```

## 📁 Project Structure

```
reward-server/
├── src/
│   ├── bootstrap/          # Service initialization
│   ├── config/             # Configuration files
│   ├── constants/          # Application constants
│   ├── controllers/        # HTTP route controllers
│   ├── crons/              # Cron job definitions
│   ├── helpers/            # Utility helpers
│   ├── interfaces/         # TypeScript interfaces
│   ├── middlewares/        # Koa middlewares
│   ├── services/           # Business logic services
│   │   ├── depin-stake-rewards/
│   │   ├── nfnodes/
│   │   ├── pool-per-epoch/
│   │   ├── rabbitmq-wrapper/
│   │   ├── rewards-per-epoch/
│   │   ├── solana/
│   │   └── ...
│   ├── utils/              # Utility functions
│   └── server.ts           # Main server entry point
├── dist/                   # Compiled JavaScript output
├── kubernetes/             # Kubernetes manifests
├── Dockerfile              # Docker configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── env.example.env         # Environment variables template
```

## 🔌 API Integration

### WUBI Integration

The server communicates with the WiFi API (WUBI) via RabbitMQ:

* **Request Queue**: `WUBI_API_QUEUE`
* **Response Queue**: `WUBI_API_QUEUE_RESPONSE`

The API calculates scores for WUBI devices.

### WUPI Integration

The server communicates with the NAS API (WUPI) via RabbitMQ:

* **Request Queue**: `WUPI_API_QUEUE`
* **Response Queue**: `WUPI_API_QUEUE_RESPONSE`

The API calculates scores for WUPI devices.

### Score Processing Flow

1. Server sends requests to WUBI/WUPI APIs via RabbitMQ
2. APIs calculate device scores
3. APIs send responses back via RabbitMQ
4. Server processes responses and calculates rewards
5. Rewards are distributed via Solana blockchain

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t reward-server:latest .
```

### Run Container

```bash
docker run -d \
  --name reward-server \
  -p 1339:80 \
  --env-file .env \
  reward-server:latest
```

## ☸️ Kubernetes Deployment

The project includes Kubernetes manifests in the `kubernetes/` directory. Deploy using:

```bash
kubectl apply -f kubernetes/prod/
```

Ensure you have:
* ConfigMaps for configuration
* Secrets for sensitive data
* Persistent volumes for database (if needed)

## 🛠️ Development

### Available Scripts

* `npm run dev` - Start development server with hot reload
* `npm run build` - Build TypeScript to JavaScript
* `npm start` - Start production server

### Code Style

The project uses TypeScript with strict type checking. Ensure your code follows the existing patterns and interfaces.

### Adding New Features

1. Create interfaces in `src/interfaces/`
2. Implement services in `src/services/`
3. Add routes in `src/controllers/` (if needed)
4. Update bootstrap if new services need initialization

## 🤝 Contributing

This project is now **open source** and welcomes contributions from the community. Since WAYRU no longer exists and cannot provide support, contributions are essential for maintaining and improving this project.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Reporting Issues

Please report bugs and request features through GitHub Issues. Note that there is **no official support** from WAYRU, but the community can help.

## 📄 License

This project is open source and available under the ISC License.

## 🔗 Related Documentation

* [Rate Limiter Documentation](./README-RATE-LIMITER.md) - Detailed information about rate limiting configuration

---

## 💙 Farewell Message

With gratitude and love, we say goodbye.

WAYRU is closing its doors, but we are leaving these repositories open and free for the community.

May they continue to inspire builders, dreamers, and innovators.

With love, 
WAYRU

---

**Note**: This project is now open source. WAYRU no longer exists and cannot provide support. The community is encouraged to maintain and improve this project.
