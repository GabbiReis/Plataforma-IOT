variable "tenancy_ocid" {
  description = "OCID da tenancy (encontrado em Governance & Administration > Tenancy Details)"
  type        = string
}

variable "user_ocid" {
  description = "OCID do usuário (encontrado em User Settings)"
  type        = string
}

variable "fingerprint" {
  description = "Fingerprint da API Signing Key (gerada em User Settings > API Keys)"
  type        = string
}

variable "private_key_path" {
  description = "Caminho local para a chave privada da API Signing Key (nunca commitar esse arquivo)"
  type        = string
}

variable "region" {
  description = "Home region da tenancy"
  type        = string
  default     = "sa-saopaulo-1"
}

variable "compartment_id" {
  description = "OCID do compartment onde os recursos do AgriNexus serão criados"
  type        = string
}

variable "ssh_public_key_path" {
  description = "Caminho local para a chave pública SSH usada nos nós do OKE"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "enable_oke_node_pool" {
  description = "Cria o node pool Ampere A1 do OKE. Mantenha false enquanto a região estiver sem capacidade A1"
  type        = bool
  default     = false
}

variable "enable_k3s" {
  description = "Cria a instância k3s. Mantido false: o shape Always Free E2.1.Micro (1/8 OCPU, 1GB) não sustenta o k3s"
  type        = bool
  default     = false
}

variable "k3s_instance_shape" {
  description = "Shape da instância que roda o k3s. VM.Standard.E2.1.Micro é Always Free"
  type        = string
  default     = "VM.Standard.E2.1.Micro"
}

variable "node_ocpus" {
  description = "OCPUs do nó Ampere A1. Reduza (ex: 1) se houver erro de 'Out of host capacity' com o valor padrão"
  type        = number
  default     = 2
}

variable "node_memory_in_gbs" {
  description = "Memória (GB) do nó Ampere A1. Reduza (ex: 6) se houver erro de 'Out of host capacity' com o valor padrão"
  type        = number
  default     = 12
}
