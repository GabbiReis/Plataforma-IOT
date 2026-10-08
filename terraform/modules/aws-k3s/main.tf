data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_key_pair" "this" {
  key_name   = "${var.label_prefix}-key"
  public_key = var.ssh_public_key
}

resource "aws_eip" "this" {
  domain = "vpc"

  tags = {
    Name = "${var.label_prefix}-eip"
  }
}

resource "aws_instance" "k3s" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.security_group_id]
  key_name               = aws_key_pair.this.key_name

  user_data = templatefile("${path.module}/install-k3s.sh.tftpl", {
    public_ip = aws_eip.this.public_ip
  })

  tags = {
    Name = "${var.label_prefix}-k3s-node"
  }
}

resource "aws_eip_association" "this" {
  instance_id   = aws_instance.k3s.id
  allocation_id = aws_eip.this.id
}
