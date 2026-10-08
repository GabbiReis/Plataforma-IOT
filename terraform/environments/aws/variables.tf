variable "region" {
  description = "Região AWS onde a instância será criada"
  type        = string
  default     = "us-east-1"
}

variable "ssh_public_key_path" {
  description = "Caminho local para a chave pública SSH usada na instância k3s"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "instance_type" {
  description = "Tipo da instância EC2 (t3.micro/t2.micro são elegíveis ao Free Tier de 12 meses)"
  type        = string
  default     = "t3.micro"
}
