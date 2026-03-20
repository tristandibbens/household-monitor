# Account settings
variable "account_role" {
  type        = string
  description = "The ARN of the role to assume for running Terraform in the account."
}

variable "account_role_external_id" {
  type        = string
  description = "The external ID to use when assuming the role for this account."
}

variable "region" {
  type        = string
  description = "The name of the region to create the resources."
  default     = "eu-west-2"
}

variable "envname" {
  type        = string
  description = "The name of the environment (master, dev, stage, prod)"
}

variable "envtype" {
  type        = string
  description = "The type of the environment (master, nonprod, prod)"
}

variable "project" {
  type        = string
  description = "The name of the project"
  default     = "household-monitor"
}

variable "stack" {
  type        = string
  description = "The name of the stack - for lineage"
  default     = "video-processing"
}

variable "sms_phone_number" {
  description = "Destination phone number in E.164 format, e.g. +447700900123"
  type        = string
}

variable "sns_sms_monthly_spend_limit_usd" {
  type    = string
  default = "5"
}


# variable "trust_anchor_ca_pem" {
#   description = "PEM-encoded CA certificate used to sign the Raspberry Pi device certificate"
#   type        = string
#   sensitive   = true
# }

variable "device_cert_common_name" {
  description = "Expected certificate common name for the Pi device certificate"
  type        = string
  default     = "pi-frontdoor-002"
}

variable "s3_transition_to_ia_days" {
  type    = number
  default = 30
}

variable "s3_expire_days" {
  type    = number
  default = 365
}

variable "tags" {
  type    = map(string)
  default = {}
}