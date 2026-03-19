#Storage bucket for data repo where required
resource "aws_s3_bucket" "video_archive" {
  provider = aws.customer_account
  bucket   = "${var.project}-${var.envname}-video-archive"

  tags = merge(
    local.common_tags,
    {
      Name = "${var.project}-video_archive"
    }
  )
}

resource "aws_s3_bucket_versioning" "video_archive" {
  provider = aws.customer_account
  bucket   = aws_s3_bucket.video_archive.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "video_archive" {
  provider = aws.customer_account
  bucket   = aws_s3_bucket.video_archive.bucket

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "video_archive" {
  provider                = aws.customer_account
  bucket                  = aws_s3_bucket.video_archive.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "video_archive" {
  provider = aws.customer_account
  bucket   = aws_s3_bucket.video_archive.id

  rule {
    id     = "archive-management"
    status = "Enabled"

    filter {}

    transition {
      days          = var.s3_transition_to_ia_days
      storage_class = "STANDARD_IA"
    }

    expiration {
      days = var.s3_expire_days
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}