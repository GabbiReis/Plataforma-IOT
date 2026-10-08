output "vcn_id" {
  value = oci_core_vcn.this.id
}

output "worker_subnet_id" {
  value = oci_core_subnet.workers.id
}

output "lb_subnet_id" {
  value = oci_core_subnet.load_balancer.id
}
