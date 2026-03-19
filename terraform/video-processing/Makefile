# http://clarkgrubb.com/makefile-style-guide
TF_LOG=INFO
MAKEFLAGS += --warn-undefined-variables --no-print-directory
SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := all
.DELETE_ON_ERROR:
.SUFFIXES:
CUSTOMER=catseyedata
REGION=eu-west-2
ENVNAME=prod
ENVTYPE=prod
PROJECT=household-monitor
STACK=video-processing
TFSTATE_BUCKET=$(CUSTOMER)-$(PROJECT)-master-terraform-state
TF_LOCK_TABLE=$(CUSTOMER)-$(PROJECT)-master-tflock-$(CUSTOMER)-$(ENVTYPE)-$(ENVNAME)-$(REGION)-$(STACK)
RESOURCES_PATH="$(CUSTOMER)/$(REGION)/$(ENVTYPE)/$(ENVNAME)"
TF_PARALLELISM=20
export AWS_DEFAULT_REGION=$(REGION)
# TARGETS="aws_s3_bucket.my_bucket aws_iam_role.app"
TARGETS ?=
# helper to turn TARGETS into repeated -target flags (works with 0, 1, or many)
TARGET_ARGS := $(if $(TARGETS),$(addprefix -target=,$(TARGETS)),)

.PHONY: all
all: clean init fmt tfplan

.PHONY: plan
plan: tfplan

.PHONY: apply
apply: clean init fmt tfapply

.PHONY: applynoprompt
applynoprompt: clean init fmt tfapplynoprompt

.PHONY: destroy
destroy: clean init fmt tfdestroy

.PHONY: refresh
refresh: clean init fmt
	@terraform refresh -parallelism=$(TF_PARALLELISM) -var-file=params/$(RESOURCES_PATH)/params.tfvars

.PHONY: clean
clean:
	@rm -fr .terraform/modules
	@rm -fr .terraform/terraform.tfstate*
	@rm -fr .terraform/*zip
.PHONY: init
init:
	@AWS_SDK_LOAD_CONFIG=1 AWS_PROFILE=catseyedata_dev terraform init \
		-backend=true \
		-backend-config="bucket=$(TFSTATE_BUCKET)" \
		-backend-config="key=$(RESOURCES_PATH)/$(STACK).tfstate" \
		-backend-config="use_lockfile=true" \
		-get=true
.PHONY: fmt
fmt:
	@terraform fmt
.PHONY: tfplan
tfplan:
	@terraform plan -parallelism=$(TF_PARALLELISM) -var-file=params/$(RESOURCES_PATH)/params.tfvars $(TARGET_ARGS)

.PHONY: tfapply
tfapply:
	@terraform apply -parallelism=$(TF_PARALLELISM) -var-file=params/$(RESOURCES_PATH)/params.tfvars $(TARGET_ARGS)

.PHONY: tfapplynoprompt
tfapplynoprompt:
	@terraform apply -auto-approve -parallelism=$(TF_PARALLELISM) -var-file=params/$(RESOURCES_PATH)/params.tfvars $(TARGET_ARGS)
.PHONY: tfdestroy
tfdestroy:
	@terraform destroy -parallelism=$(TF_PARALLELISM) -var-file=params/$(RESOURCES_PATH)/params.tfvars
.PHONY: onetime
# Sets up
onetime:
	@aws s3api create-bucket \
		--bucket $(CUSTOMER)-$(PROJECT)-master-terraform-state \
		--create-bucket-configuration LocationConstraint=$(REGION) \
		--acl private
	@aws s3api put-bucket-versioning \
		--bucket $(CUSTOMER)-$(PROJECT)-master-terraform-state \
		--versioning-configuration Status=Enabled
	@aws s3api put-public-access-block \
		--bucket $(CUSTOMER)-$(PROJECT)-master-terraform-state \
		--public-access-block-configuration BlockPublicAcls=True,IgnorePublicAcls=True,BlockPublicPolicy=True,RestrictPublicBuckets=True