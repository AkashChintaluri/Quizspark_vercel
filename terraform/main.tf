terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
resource "aws_vpc" "quizspark_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "quizspark-vpc"
    Environment = var.environment
  }
}

# Public Subnet
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.quizspark_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name        = "quizspark-public-subnet"
    Environment = var.environment
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.quizspark_vpc.id

  tags = {
    Name        = "quizspark-igw"
    Environment = var.environment
  }
}

# Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.quizspark_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name        = "quizspark-public-rt"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# Security Group
resource "aws_security_group" "quizspark_sg" {
  name        = "quizspark-sg"
  description = "Security group for QuizSpark application"
  vpc_id      = aws_vpc.quizspark_vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Application port"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "quizspark-sg"
    Environment = var.environment
  }
}

# EC2 Instance
data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

resource "aws_instance" "quizspark_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  subnet_id     = aws_subnet.public.id
  key_name      = var.key_name

  vpc_security_group_ids = [aws_security_group.quizspark_sg.id]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y nodejs npm git nginx
              npm install -g pm2
              git clone ${var.repository_url} /app
              cd /app
              npm install --production
              npm run build
              cd server
              npm install --production
              pm2 start pgServer.js --update-env
              EOF

  tags = {
    Name        = "QuizSpark-Server"
    Environment = var.environment
  }
}

# Outputs
output "public_ip" {
  value = aws_instance.quizspark_server.public_ip
}

output "vpc_id" {
  value = aws_vpc.quizspark_vpc.id
}
