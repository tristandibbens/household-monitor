locals {
  common_tags = {
    owner   = "tristan-catseyedata"
    envtype = var.envtype
    envname = var.envname
    project = var.project
    stack   = var.stack
  }
}

# data "terraform_remote_state" "vpc" {
#   backend = "s3"

#   config = {
#     bucket = "${var.customer}-${var.project}-master-terraform-state"
#     key    = "${var.customer}/${var.region}/${var.envtype}/${local.runtime_env}/vpc.tfstate"
#     region = var.region
#   }
# }

data "aws_caller_identity" "customer" {
  provider = aws.customer_account
}

data "aws_availability_zones" "available" {}
