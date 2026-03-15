# AWS: RDS PostgreSQL + EC2 + GET API

Push insurance customer JSON data into RDS PostgreSQL, launch an EC2 instance, and deploy a Node.js GET API.

---

## Architecture

```
┌──────────────────┐     ┌───────────────────┐     ┌───────────────┐
│ demo_customers.js│────▶│ RDS PostgreSQL    │◀────│  Express API  │
│ (local seed)     │seed │ (ap-south-1)      │query│  on EC2       │
└──────────────────┘     └───────────────────┘     └──────┬────────┘
                                                         │ HTTP :3000
                                                   ┌─────▼──────┐
                                                   │ Browser /  │
                                                   │ Postman    │
                                                   └────────────┘
```

---

## Phase 0 — Prerequisites

> [!IMPORTANT]
> You need the **AWS CLI v2** installed. Download from https://awscli.amazonaws.com/AWSCLIV2.msi and run the installer. Then:
> ```bash
> aws configure
> # Access Key ID: <your key>
> # Secret Access Key: <your secret>
> # Default region: ap-south-1
> # Output format: json
> ```

---

## Phase 1 — AWS Resources (via CLI scripts)

### 1a. Create SSH Key Pair

#### [NEW] [create-keypair.sh](file:///c:/Users/AJITH/Desktop/zurichKotakFinal/scripts/create-keypair.sh)
Creates a new EC2 key pair, saves the `.pem` file locally.

### 1b. Create Security Group

#### [NEW] [create-security-group.sh](file:///c:/Users/AJITH/Desktop/zurichKotakFinal/scripts/create-security-group.sh)
Creates a VPC security group allowing:
- **SSH (22)** — your IP only
- **HTTP (3000)** — public (for the API)
- **PostgreSQL (5432)** — within the security group (EC2 → RDS)

### 1c. Launch EC2 Instance

#### [NEW] [launch-ec2.sh](file:///c:/Users/AJITH/Desktop/zurichKotakFinal/scripts/launch-ec2.sh)
Launches a `t2.micro` (free-tier) Amazon Linux 2023 instance in `ap-south-1` with the key pair and security group above.

### 1d. Create RDS PostgreSQL

#### [NEW] [create-rds.sh](file:///c:/Users/AJITH/Desktop/zurichKotakFinal/scripts/create-rds.sh)
Creates an RDS PostgreSQL instance:
- Engine: PostgreSQL 15
- Instance class: `db.t4g.micro` (free-tier eligible, t4g as requested)
- Storage: 20 GB gp3
- Same security group so EC2 can connect

---

## Phase 2 — Database Schema

#### [NEW] [db/schema.sql](file:///c:/Users/AJITH/Desktop/zurichKotakFinal/db/schema.sql)

Three normalized tables, with JSONB columns for deeply nested data:

| Table | Key Columns | JSONB Columns |
|-------|------------|---------------|
| `customers` | id, name, age, gender, email, phone, occupation, annual_income, location, pincode, marital_status, customer_since, preferred_channel, digital_engagement | `risk_profile` (stores the whole nested object) |
| `policies` | policy_id (PK), customer_id (FK), product_id, product_name, category, status, start_date, end_date, premium, sum_insured, renewal_date, telemer_outcome, ppc_outcome | `coverage_details`, `vehicle_details` (nullable) |
| `claims` | claim_id (PK), customer_id (FK), policy_id (FK ref policies), type, description, date_of_incident, claim_amount, approved_amount, status, cashless | — |

> [!NOTE]
> Using JSONB for `risk_profile`, `coverage_details`, and `vehicle_details` avoids creating 10+ additional tables while still allowing efficient queries via PostgreSQL JSON operators.

---

## Phase 3 — Seed Script

#### [NEW] [scripts/seed-data.js](file:///c:/Users/AJITH/Desktop/zurichKotakFinal/scripts/seed-data.js)
Node.js script using the `pg` library:
1. Reads [demo_customers.js](file:///c:/Users/AJITH/Desktop/zurichKotakFinal/demo_customers.js) (requires the module)
2. Connects to RDS PostgreSQL
3. Creates tables using `schema.sql`
4. Iterates over each customer, inserting into `customers`, then each policy into `policies`, then each claim into `claims`
5. Uses a transaction for data integrity

---

## Phase 4 — Express.js GET API

#### [NEW] [api/package.json](file:///c:/Users/AJITH/Desktop/zurichKotakFinal/api/package.json)
Dependencies: `express`, `pg`, `dotenv`, `cors`

#### [NEW] [api/.env](file:///c:/Users/AJITH/Desktop/zurichKotakFinal/api/.env)
Database connection string (template — user fills in actual RDS endpoint).

#### [NEW] [api/server.js](file:///c:/Users/AJITH/Desktop/zurichKotakFinal/api/server.js)
Endpoints:
| Endpoint | Description |
|----------|-------------|
| `GET /api/customers` | Paginated list of all customers |
| `GET /api/customers/:id` | Single customer with policies + claims |
| `GET /health` | Health check |

---

## Phase 5 — EC2 Deployment

After EC2 is running:
1. SSH in → install Node.js 20
2. Upload/clone the `api/` folder
3. `npm install` → set `.env` with RDS endpoint → `node server.js`

---

## Verification Plan

### Automated
```bash
# Verify RDS data
psql -h <RDS_ENDPOINT> -U admin -d customers_db -c "SELECT count(*) FROM customers;"

# Verify API locally
curl http://localhost:3000/api/customers?limit=2
curl http://localhost:3000/api/customers/1
```

### Manual
- Hit `http://<EC2_PUBLIC_IP>:3000/api/customers` from browser/Postman
- Confirm JSON response contains seeded customer data with policies and claims
