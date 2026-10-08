data "oci_identity_availability_domains" "ads" {
  compartment_id = var.compartment_id
}

data "oci_containerengine_cluster_option" "this" {
  cluster_option_id = "all"
  compartment_id    = var.compartment_id
}

locals {
  latest_k8s_version = element(
    sort(data.oci_containerengine_cluster_option.this.kubernetes_versions),
    length(data.oci_containerengine_cluster_option.this.kubernetes_versions) - 1
  )
  kubernetes_version = coalesce(var.kubernetes_version, local.latest_k8s_version)
}

resource "oci_containerengine_cluster" "this" {
  compartment_id     = var.compartment_id
  name               = "${var.label_prefix}-oke"
  vcn_id             = var.vcn_id
  kubernetes_version = local.kubernetes_version
  type               = "BASIC_CLUSTER"

  endpoint_config {
    is_public_ip_enabled = true
    subnet_id            = var.worker_subnet_id
  }
}

data "oci_containerengine_node_pool_option" "this" {
  node_pool_option_id = "all"
  compartment_id      = var.compartment_id
}

locals {
  a1_images = [
    for src in data.oci_containerengine_node_pool_option.this.sources : src
    if can(regex("Oracle-Linux-8", src.source_name)) && can(regex("aarch64", src.source_name))
  ]
  a1_image_names_sorted = sort([for s in local.a1_images : s.source_name])
  latest_a1_image_name  = element(local.a1_image_names_sorted, length(local.a1_image_names_sorted) - 1)
  latest_a1_image_id    = [for s in local.a1_images : s.image_id if s.source_name == local.latest_a1_image_name][0]
}

resource "oci_containerengine_node_pool" "this" {
  count = var.create_node_pool ? 1 : 0

  cluster_id         = oci_containerengine_cluster.this.id
  compartment_id     = var.compartment_id
  name               = "${var.label_prefix}-pool"
  node_shape         = "VM.Standard.A1.Flex"
  kubernetes_version = local.kubernetes_version
  ssh_public_key     = var.ssh_public_key

  node_shape_config {
    ocpus         = var.node_ocpus
    memory_in_gbs = var.node_memory_in_gbs
  }

  node_source_details {
    source_type = "IMAGE"
    image_id    = local.latest_a1_image_id
  }

  node_config_details {
    size = var.node_pool_size

    placement_configs {
      availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
      subnet_id           = var.worker_subnet_id
    }
  }
}
