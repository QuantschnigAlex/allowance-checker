provider "aws" {
  region = "eu-central-1"
}

resource "aws_instance" "app_server" {
  ami           = "ami-071f0796b00a3a89d"
  instance_type = "t2.micro"
  key_name      = "allowance_checker"
  tags = {
    Name = "AppServer"
  }
}

output "instance_ip" {
  value = aws_instance.app_server.public_ip
}