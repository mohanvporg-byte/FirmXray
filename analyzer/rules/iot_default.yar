rule Hardcoded_Credentials {
  meta: severity = "high"
  strings:
    $a = "admin:admin" nocase
    $b = "root:root" nocase
    $c = /password\s*=\s*["'][^"']{3,}["']/ nocase
  condition: any of them
}
rule Private_Key_Embedded {
  meta: severity = "critical"
  strings: $k = "-----BEGIN RSA PRIVATE KEY-----"
  condition: $k
}
rule Telnet_Enabled {
  meta: severity = "medium"
  strings: $t = "telnetd" $u = "utelnetd"
  condition: any of them
}
rule Debug_Backdoor_Strings {
  meta: severity = "high"
  strings: $d = "debug_shell" nocase $e = "/bin/sh -i"
  condition: any of them
}
