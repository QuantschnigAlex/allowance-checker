provider "aws" {
  region = "eu-central-1"
}

resource "aws_instance" "app_server" {
  ami           = "ami-071f0796b00a3a89d"
  instance_type = "t2.micro"
  key_name      = "allowance_checker"
  vpc_security_group_ids = [aws_security_group.app_server.id]
  
  tags = {
    Name = "AppServer"
  }
}

resource "aws_security_group" "app_server" {
   name        = "app_server_${formatdate("YYYYMMDD_HHmmss", timestamp())}"  
   description = "Allow inbound traffic"

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
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

output "instance_ip" {
  value = aws_instance.app_server.public_ip
}