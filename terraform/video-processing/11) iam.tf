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

resource "aws_iam_role" "pi_kvs_producer" {
  provider = aws.customer_account
  name     = "${var.project}-pi-kvs-producer"

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
# Least-privilege S3 access for Kinesis producer
############################

resource "aws_iam_role_policy" "pi_kvs_producer" {
  provider = aws.customer_account
  name     = "${var.project}-pi-kvs-producer"
  role     = aws_iam_role.pi_kvs_producer.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "UseWebRTCSignalingChannel"
        Effect = "Allow"
        Action = [
          "kinesisvideo:DescribeSignalingChannel",
          "kinesisvideo:GetSignalingChannelEndpoint",
          "kinesisvideo:GetIceServerConfig",
          "kinesisvideo:ConnectAsMaster"
        ]
        Resource = awscc_kinesisvideo_signaling_channel.pi_channel.arn
      },
      {
        Sid    = "IngestToVideoStream"
        Effect = "Allow"
        Action = [
          "kinesisvideo:DescribeStream",
          "kinesisvideo:GetDataEndpoint",
          "kinesisvideo:PutMedia"
        ]
        Resource = aws_kinesis_video_stream.live_feed.arn
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
  role_arns        = [aws_iam_role.pi_kvs_producer.arn]
  duration_seconds = 3600

  tags = local.common_tags
}

##################################
## React App role
##################################

resource "aws_iam_role" "kvs_viewer" {
  provider = aws.customer_account
  name     = "${var.project}-kvs-viewer"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "sts:AssumeRole"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.customer.account_id}:root"
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "kvs_viewer" {
  provider = aws.customer_account
  name     = "${var.project}-kvs-viewer"
  role     = aws_iam_role.kvs_viewer.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ReadPlaybackFromSpecificVideoStream"
        Effect = "Allow"
        Action = [
          "kinesisvideo:DescribeStream",
          "kinesisvideo:GetDataEndpoint",
          "kinesisvideo:GetHLSStreamingSessionURL"
        ]
        Resource = aws_kinesis_video_stream.live_feed.arn
      }
    ]
  })
}