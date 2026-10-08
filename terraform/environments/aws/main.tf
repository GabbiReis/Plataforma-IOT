module "network" {
  source = "../../modules/aws-network"
}

module "k3s" {
  source = "../../modules/aws-k3s"

  subnet_id         = module.network.subnet_id
  security_group_id = module.network.security_group_id
  ssh_public_key    = file(pathexpand(var.ssh_public_key_path))
  instance_type     = var.instance_type
}
