variable "compartment_id" {
  description = "OCID do compartment onde os recursos de rede serão criados"
  type        = string
}

variable "vcn_cidr" {
  description = "CIDR block da VCN"
  type        = string
  default     = "10.0.0.0/16"
}

variable "worker_subnet_cidr" {
  description = "CIDR da subnet pública dos nós do OKE"
  type        = string
  default     = "10.0.1.0/24"
}

variable "lb_subnet_cidr" {
  description = "CIDR da subnet pública do Load Balancer (Ingress)"
  type        = string
  default     = "10.0.2.0/24"
}

variable "label_prefix" {
  description = "Prefixo usado no nome dos recursos de rede"
  type        = string
  default     = "agrinexus"
}

variable "k8s_api_allowed_cidr" {
  description = "CIDR autorizado a acessar a porta 6443 (API do Kubernetes). Restrinja ao seu IP em produção"
  type        = string
  default     = "0.0.0.0/0"
}
