# CI/CD Pipeline Documentation

CI/CD pipeline setup for deploying a web application to AWS using GitHub Actions, Terraform, and Docker.

## Overview

The Pipeline implements a complete CI/CD workflow:

1. Linting
2. Build
3. Execute tests
4. Deploy to AWS EC2 (tagged releases only)

## Pipeline Components

The Pipeline is triggered on:

* Push to main branch
* Pull requests to main branch
* Tags starting with "v" (for releases)

### Job Structure

1. **Lint**

    * ESLint checks
    * Node.js v20.11.1
    * Upload test results as artifact if failed
    * Retention: 14 days

2. **Build**

    * Builds the application
    * Node.js v20.11.1
    * Outputs stored in `dist/` directory
    * Uploads build artifacts

3. **Test**

    * Depends on build job
    * Runs test suite
    * Uploads test coverage reports
    * Retention: 14 days

4. **Deploy**

    * Triggered only for version tags (v*)
    * Depends on build and test jobs
    * Handles AWS deployment

### Infrastructure as Code (Terraform)

#### AWS Resources

**EC2 Instance:**

* Region: eu*central*1
* Instance Type: t2.micro
* AMI: ami*071f0796b00a3a89d
* Key Pair: allowance_checker

**Security Group:**

Inbound Rules:

* HTTP (80)
* SSH (22)

Outbound Rules:

* All traffic

#### User Data Script

The EC2 instance is initialized with:

* Docker installation
* System updates
* Docker service configuration
* Application directory setup

### Docker Configuration

#### Base Image

* nginx:alpine

#### Container Setup

* Static files location: /usr/share/nginx/html/
* Port: 80
* Custom nginx configuration for SPA support

## Deployment Process

1. **Infrastructure Provisioning**
   * Terraform initializes and creates AWS resources
   * EC2 instance is provisioned with Docker

2. **Application Deployment**
   * Build artifacts are downloaded
   * Docker image is built locally
   * Image is transferred to EC2
   * Container is deployed with auto*restart policy

### Security Measures

Required AWS credentials:

* AWS_ACCESS_KEY_ID
* AWS_SECRET_ACCESS_KEY
* SSH_KEY (for EC2 access)

These should be configured as GitHub repository secrets.

## Error Handling

The pipeline includes several error handling mechanisms:

* Lint failures are captured and archived
* Test results are always uploaded regardless of success
* Docker deployment includes health checks
* EC2 initialization verification with timeout
