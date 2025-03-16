terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
  }
}

provider "aws" {
  region = "ap-south-1"  # Hardcoded for Mumbai region
}

resource "aws_key_pair" "quizspark_key" {
  key_name   = "quizspark-key"
  public_key = file("C:\Users\akash\.ssh\id_rsa.pub")
}

resource "aws_security_group" "quizspark_sg" {
  name        = "quizspark-sg"
  description = "Allow web and SSH access"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "quizspark_server" {
  ami           = "ami-05c179eced2eb9b5b"  # Mumbai region AMI
  instance_type = "t2.micro"
  key_name      = aws_key_pair.quizspark_key.key_name
  vpc_security_group_ids = [aws_security_group.quizspark_sg.id]

  provisioner "remote-exec" {
    inline = [
      "sudo apt-get update -y",
      "sudo apt-get install -y nodejs npm git",
      "sudo npm install -g pm2",
      "git clone https://github.com/AkashChintaluri/quizspark.git || true",
      "cd quizspark && npm install --production",
      "npm run build",
      "cd server && npm install --production",
      "pm2 start pgServer.js --update-env"
    ]
  }

  connection {
    type        = "ssh"
    user        = "ubuntu"
    private_key = file("C:\Users\akash\.ssh\id_rsa")
    host        = self.public_ip
    timeout     = "5m"
    agent       = false
  }

  tags = {
    Name = "QuizSpark-Server"
  }
}

output "public_ip" {
  value = aws_instance.quizspark_server.public_ip
}
