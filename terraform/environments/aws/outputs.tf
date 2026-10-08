output "public_ip" {
  value = module.k3s.public_ip
}

output "kubeconfig_instructions" {
  value = module.k3s.kubeconfig_instructions
}
