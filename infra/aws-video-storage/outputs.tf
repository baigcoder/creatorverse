output "s3_bucket" {
  description = "Set this as S3_BUCKET."
  value       = var.bucket_name
}

output "s3_region" {
  description = "Set this as S3_REGION."
  value       = var.aws_region
}

output "s3_endpoint" {
  description = "Set S3_ENDPOINT to this value for AWS S3."
  value       = ""
}

output "access_key_id" {
  description = "Set this as S3_ACCESS_KEY."
  value       = aws_iam_access_key.video_storage.id
}

output "secret_access_key" {
  description = "Set this as S3_SECRET_KEY. It is stored in Terraform state; protect the state file."
  value       = aws_iam_access_key.video_storage.secret
  sensitive   = true
}

output "api_env_example" {
  description = "Copy these values into apps/api/.env or your production secret manager."
  value = {
    S3_BUCKET     = var.bucket_name
    S3_REGION     = var.aws_region
    S3_ENDPOINT   = ""
    S3_ACCESS_KEY = aws_iam_access_key.video_storage.id
  }
}
