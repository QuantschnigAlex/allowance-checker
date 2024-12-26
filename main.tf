provider "aws" {
  region = "eu-central-1"
}

resource "aws_security_group" "allow_ssh" {
  name = "allow_ssh"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "app_server" {
  ami           = "ami-0eddb4a4e7d846d6f"  #Amazon Linux 2023 AMI
  instance_type = "t2.micro"
  key_name      = "allowance_checker"
  vpc_security_groups = [aws_security_group.allow_ssh.id]

  tags = {
    Name = "AppServer"
  }
}

output "instance_ip" {
  value = aws_instance.app_server.public_ip
}