provider "aws" {
  region = "eu-central-1"
}

resource "aws_instance" "app_server" {
  ami           = "ami-0eddb4a4e7d846d6f"  #Amazon Linux 2023 AMI
  instance_type = "t2.micro"
  key_name      = "allowance_checker"

  tags = {
    Name = "AppServer"
  }
}