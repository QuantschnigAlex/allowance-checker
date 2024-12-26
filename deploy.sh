#!/bin/bash
ssh -i key.pem ubuntu@${EC2_IP} 'sudo rm -rf /var/www/html/* && sudo mkdir -p /var/www/html'
scp -i key.pem -r dist/* ubuntu@${EC2_IP}:/var/www/html/