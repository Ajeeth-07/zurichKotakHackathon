# AWS Infrastructure Setup — Task List

## Phase 0: Prerequisites & AWS CLI Setup
- [ ] Confirm user's JSON data structure
- [ ] Confirm AWS credentials availability (Access Key, Secret Key, Region)
- [ ] Install & configure AWS CLI
- [ ] Confirm database choice (DynamoDB vs RDS)

## Phase 1: Database Setup (DynamoDB)
- [ ] Create DynamoDB table via AWS CLI
- [ ] Write a script to push JSON data into DynamoDB
- [ ] Verify data is in DynamoDB

## Phase 2: EC2 Instance Setup
- [ ] Create a security group (allow SSH + HTTP)
- [ ] Launch EC2 instance via AWS CLI
- [ ] SSH into EC2 and install Node.js
- [ ] Deploy API application on EC2

## Phase 3: GET API Endpoint
- [ ] Build Express.js API with GET endpoint to fetch DynamoDB data
- [ ] Test locally
- [ ] Deploy to EC2

## Phase 4: Verification
- [ ] Hit the GET endpoint from browser/Postman to confirm data is returned
