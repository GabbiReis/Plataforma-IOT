#!/bin/bash
set -eux

PUBLIC_IP=$(curl -s -H "Authorization: Bearer Oracle" \
  http://169.254.169.254/opc/v2/vnics/ \
  | grep -o '"publicIp"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | cut -d'"' -f4)

iptables -I INPUT 1 -p tcp --dport 6443 -j ACCEPT
iptables -I INPUT 1 -p tcp --dport 80 -j ACCEPT
iptables -I INPUT 1 -p tcp --dport 443 -j ACCEPT
iptables -I INPUT 1 -s 10.42.0.0/16 -j ACCEPT
iptables -I INPUT 1 -s 10.43.0.0/16 -j ACCEPT
netfilter-persistent save || true

curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="server --tls-san $PUBLIC_IP --write-kubeconfig-mode 644" sh -
