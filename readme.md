# Reward Server

Reward Server is a service designed to distribute rewards among operators' hotspots (WUBI/WUPI).  
The amount of rewards is assigned based on the **score** and **multipliers** that each device possesses.  

* The **score** is calculated by the **NAS API** for WUPI.  
* The **score** is calculated by the **WiFi API** for WUBI.  

---

## 🚀 Getting Started with Koa.js

This project uses [Koa.js](https://koajs.com/) as its backend framework.  

### Installation

```bash

# Create project folder

mkdir reward-server
cd reward-server

# Initialize Node.js project

npm init -y

# Install dependencies

npm install koa koa-router koa-bodyparser
📂 Project Structure
Código
reward-server/
├── index.js
├── package.json
└── README.md
📝 Example index.js
javascript
const Koa = require('koa'); 
const Router = require('koa-router'); 
const bodyParser = require('koa-bodyparser'); 

const app = new Koa(); 
const router = new Router(); 

// Sample route
router.get('/', async (ctx) => {
  ctx.body = 'Reward Server is running 🚀'; 
}); 

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods()); 

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000'); 
}); 
▶️ Run the Server
bash
node index.js
📖 Notes
Rewards distribution logic should be implemented based on score and multipliers.

Integration with NAS API (WUPI) and WiFi API (WUBI) is required for score calculation.
