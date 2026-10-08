output "public_ip" {
  value = aws_eip.this.public_ip
}

output "instance_id" {
  value = aws_instance.k3s.id
}

output "kubeconfig_instructions" {
  description = "Como obter o kubeconfig depois que a instância terminar de inicializar (~1-2 min)"
  value       = "ssh ubuntu@${aws_eip.this.public_ip} 'sudo cat /etc/rancher/k3s/k3s.yaml' | sed 's/127.0.0.1/${aws_eip.this.public_ip}/' > kubeconfig-aws.yaml"
}
