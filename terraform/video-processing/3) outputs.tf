output "kinesis_video_stream_name" {
  value = aws_kinesis_video_stream.live_feed.name
}

output "kinesis_video_stream_arn" {
  value = aws_kinesis_video_stream.live_feed.arn
}

output "rolesanywhere_trust_anchor_arn" {
  value = awscc_rolesanywhere_trust_anchor.pi_ca.trust_anchor_arn
}

output "rolesanywhere_profile_arn" {
  value = aws_rolesanywhere_profile.pi_profile.arn
}

output "pi_kvs_producer_role_arn" {
  value = aws_iam_role.pi_kvs_producer.arn
}

output "kvs_viewer_role_arn" {
  value = aws_iam_role.kvs_viewer.arn
}