variable "vpc_cidr" {
  description = "CIDR block da VPC"
  type        = string
  default     = "10.1.0.0/16"
}

variable "subnet_cidr" {
  description = "CIDR da subnet pública"
  type        = string
  default     = "10.1.1.0/24"
}

variable "label_prefix" {
  description = "Prefixo usado no nome dos recursos"
  type        = string
  default     = "agrinexus"
}

variable "ssh_allowed_cidr" {
  description = "CIDR autorizado a acessar a porta 22 (SSH). Restrinja ao seu IP em produção"
  type        = string
  default     = "0.0.0.0/0"
}
