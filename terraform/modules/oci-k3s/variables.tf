variable "create_instance" {
  description = "Cria a instância k3s"
  type        = bool
  default     = true
}

variable "compartment_id" {
  description = "OCID do compartment onde a instância será criada"
  type        = string
}

variable "subnet_id" {
  description = "OCID da subnet pública (saída do módulo oci-network)"
  type        = string
}

variable "ssh_public_key" {
  description = "Chave pública SSH para acesso à instância (conteúdo da chave, não o caminho)"
  type        = string
}

variable "instance_shape" {
  description = "Shape da instância. VM.Standard.E2.1.Micro é Always Free (2 instâncias por tenancy)"
  type        = string
  default     = "VM.Standard.E2.1.Micro"
}

variable "boot_volume_size_in_gbs" {
  description = "Tamanho do boot volume. O mínimo da OCI é 50GB; o Always Free dá 200GB no total"
  type        = number
  default     = 50
}

variable "label_prefix" {
  description = "Prefixo usado no nome dos recursos"
  type        = string
  default     = "agrinexus"
}
