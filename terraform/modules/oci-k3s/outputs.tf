output "public_ip" {
  value = var.create_instance ? oci_core_instance.k3s[0].public_ip : null
}

output "instance_id" {
  value = var.create_instance ? oci_core_instance.k3s[0].id : null
}

output "kubeconfig_instructions" {
  description = "Como obter o kubeconfig depois que a instância terminar de inicializar (~2-3 min)"
  value = var.create_instance ? format(
    "ssh ubuntu@%s 'sudo cat /etc/rancher/k3s/k3s.yaml' | sed 's/127.0.0.1/%s/' > kubeconfig-oci.yaml",
    oci_core_instance.k3s[0].public_ip,
    oci_core_instance.k3s[0].public_ip
  ) : null
}
