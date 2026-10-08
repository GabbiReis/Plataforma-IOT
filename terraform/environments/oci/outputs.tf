output "oke_cluster_id" {
  value = module.oke.cluster_id
}

output "oke_kubeconfig_command" {
  value = module.oke.kubeconfig_command
}

output "k3s_public_ip" {
  value = module.k3s.public_ip
}

output "k3s_kubeconfig_instructions" {
  value = module.k3s.kubeconfig_instructions
}
