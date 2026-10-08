variable "compartment_id" {
  description = "OCID do compartment onde o cluster será criado"
  type        = string
}

variable "vcn_id" {
  description = "OCID da VCN (saída do módulo oci-network)"
  type        = string
}

variable "worker_subnet_id" {
  description = "OCID da subnet dos nós (saída do módulo oci-network)"
  type        = string
}

variable "lb_subnet_id" {
  description = "OCID da subnet do Load Balancer (saída do módulo oci-network)"
  type        = string
}

variable "label_prefix" {
  description = "Prefixo usado no nome dos recursos"
  type        = string
  default     = "agrinexus"
}

variable "kubernetes_version" {
  description = "Versão do Kubernetes. Se null, usa a versão mais recente disponível na região"
  type        = string
  default     = null
}

variable "create_node_pool" {
  description = "Cria o node pool Ampere A1. Deixe false quando a região estiver sem capacidade A1 (o cluster/control plane continua existindo)"
  type        = bool
  default     = true
}

variable "node_pool_size" {
  description = "Número de nós no node pool. Mantenha baixo para caber no Always Free (2 OCPU / 12GB total de Ampere A1)"
  type        = number
  default     = 1
}

variable "node_ocpus" {
  description = "OCPUs por nó (Ampere A1 Flex). Always Free = 2 OCPU total"
  type        = number
  default     = 2
}

variable "node_memory_in_gbs" {
  description = "Memória (GB) por nó (Ampere A1 Flex). Always Free = 12GB total"
  type        = number
  default     = 12
}

variable "ssh_public_key" {
  description = "Chave pública SSH para acesso aos nós (conteúdo da chave, não o caminho)"
  type        = string
}
