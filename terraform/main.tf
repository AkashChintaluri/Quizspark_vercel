provider "aws" {
  region = var.region
}

resource "aws_key_pair" "quizspark_key" {
  key_name   = "quizspark-key"
  public_key = file("~/.ssh/id_rsa.pub")
}

resource "aws_security_group" "quizspark_sg" {
  name        = "quizspark-sg"
  description = "Allow HTTP, HTTPS, and SSH"

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

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "quizspark_server" {
  ami           = "ami-0c55b159cbfafe1f0" # Ubuntu 22.04 LTS
  instance_type = "t2.micro"
  key_name      = aws_key_pair.quizspark_key.key_name
  vpc_security_group_ids = [aws_security_group.quizspark_sg.id]

  # Install dependencies and deploy application
  provisioner "remote-exec" {
    inline = [
      "sudo apt-get update -y",
      "sudo apt-get install -y nodejs npm git",
      "sudo npm install -g pm2",
      "git clone https://github.com/AkashChintaluri/quizspark.git",
      "cd quizspark && npm install",
      "npm run build",
      "cd server && npm install",
      "pm2 start pgServer.js"
    ]
  }

  connection {
    type        = "ssh"
    user        = "ubuntu"
    private_key = file("~/.ssh/id_rsa") # Replace with your private key path
    host        = self.public_ip
  }

  tags = {
    Name = "QuizSpark-Server"
  }
}

output "public_ip" {
  value = aws_instance.quizspark_server.public_ip
}
