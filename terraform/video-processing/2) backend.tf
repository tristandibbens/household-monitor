terraform {
  backend "s3" {
    encrypt = true
  }
  required_version = "~> 1.14.7"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 6.36.0"
    }
    awscc = {
      source  = "hashicorp/awscc"
      version = "~> 1.75.0"
    }
  }
}

provider "aws" {
  alias  = "customer_account"
  region = var.region
  assume_role {
    role_arn     = var.account_role
    external_id  = var.account_role_external_id
    session_name = "terraform"
  }
}

provider "awscc" {
  alias  = "customer_account_cc"
  region = var.region
  assume_role = { # note the provider acts differently and we have an equals sign here
    role_arn     = var.account_role
    external_id  = var.account_role_external_id
    session_name = "terraform_cc"
  }
}
