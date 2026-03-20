############################
# IAM Roles Anywhere trust anchor
############################

resource "awscc_rolesanywhere_trust_anchor" "pi_ca" {
  provider = awscc.customer_account_cc
  name     = "${var.project}-trust-anchor"
  enabled  = true

  source = {
    source_type = "CERTIFICATE_BUNDLE"
    source_data = {
      x509_certificate_data = file("/home/tristanyoga/pi2-pki/certs/root-ca.crt") #TODO - not best practice, need to address if growing up
    }
  }
}

############################
# IAM role assumed via Roles Anywhere
############################

resource "aws_iam_role" "pi_uploader" {
  provider = aws.customer_account
  name     = "${var.project}-pi-uploader"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "rolesanywhere.amazonaws.com"
        }
        Action = [
          "sts:AssumeRole",
          "sts:SetSourceIdentity",
          "sts:TagSession"
        ]
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = awscc_rolesanywhere_trust_anchor.pi_ca.trust_anchor_arn
          }
          StringEquals = {
            "aws:PrincipalTag/x509Subject/CN" = var.device_cert_common_name
          }
        }
      }
    ]
  })

  tags = local.common_tags
}

############################
# Least-privilege S3 access for clip uploads
############################

resource "aws_iam_role_policy" "pi_uploader_s3" {
  provider = aws.customer_account
  name     = "${var.project}-pi-uploader-s3"
  role     = aws_iam_role.pi_uploader.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ListBucketForPrefix"
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = aws_s3_bucket.video_archive.arn
        Condition = {
          StringLike = {
            "s3:prefix" = [
              "clips/*"
            ]
          }
        }
      },
      {
        Sid    = "WriteClips"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:AbortMultipartUpload",
          "s3:ListBucketMultipartUploads",
          "s3:ListMultipartUploadParts"
        ]
        Resource = [
          "${aws_s3_bucket.video_archive.arn}/clips/*"
        ]
      }
    ]
  })
}

############################
# Roles Anywhere profile
############################

resource "aws_rolesanywhere_profile" "pi_profile" {
  provider         = aws.customer_account
  name             = "${var.project}-profile"
  enabled          = true
  role_arns        = [aws_iam_role.pi_uploader.arn]
  duration_seconds = 3600

  # session_policy = jsonencode({
  #   Version   = "2012-10-17"
  #   Statement = []
  # })

  tags = local.common_tags
}