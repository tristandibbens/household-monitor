resource "awscc_kinesisvideo_signaling_channel" "pi_channel" {
  provider = awscc.customer_account_cc

  name = "${var.project}-pi-channel"
  type = "SINGLE_MASTER"

}

resource "aws_kinesis_video_stream" "live_feed" {
  provider = aws.customer_account

  name                    = "${var.project}-live-feed"
  data_retention_in_hours = 3

  tags = merge(local.common_tags, {
    Name = "${var.project}-live-feed"
  })
}
