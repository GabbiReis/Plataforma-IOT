variable "subnet_id" {
  description = "Subnet pública onde a instância será lançada (saída do módulo aws-network)"
  type        = string
}

variable "security_group_id" {
  description = "Security Group da instância (saída do módulo aws-network)"
  type        = string
}

variable "instance_type" {
  description = "Tipo da instância EC2. t3.micro/t2.micro são elegíveis ao Free Tier (12 meses, contas novas)"
  type        = string
  default     = "t3.micro"
}

variable "ssh_public_key" {
  description = "Chave pública SSH para acesso à instância (conteúdo da chave, não o caminho)"
  type        = string
}

variable "label_prefix" {
  description = "Prefixo usado no nome dos recursos"
  type        = string
  default     = "agrinexus"
}
