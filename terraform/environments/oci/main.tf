module "network" {
  source = "../../modules/oci-network"

  compartment_id = var.compartment_id
}

module "oke" {
  source = "../../modules/oci-oke"

  compartment_id     = var.compartment_id
  vcn_id             = module.network.vcn_id
  worker_subnet_id   = module.network.worker_subnet_id
  lb_subnet_id       = module.network.lb_subnet_id
  ssh_public_key     = file(pathexpand(var.ssh_public_key_path))
  create_node_pool   = var.enable_oke_node_pool
  node_ocpus         = var.node_ocpus
  node_memory_in_gbs = var.node_memory_in_gbs
}

module "k3s" {
  source = "../../modules/oci-k3s"

  create_instance = var.enable_k3s
  compartment_id  = var.compartment_id
  subnet_id       = module.network.worker_subnet_id
  ssh_public_key  = file(pathexpand(var.ssh_public_key_path))
  instance_shape  = var.k3s_instance_shape
}
