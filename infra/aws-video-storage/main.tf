data "aws_partition" "current" {}

data "aws_s3_bucket" "video" {
  bucket = var.bucket_name
}

locals {
  bucket_arn              = "arn:${data.aws_partition.current.partition}:s3:::${var.bucket_name}"
  managed_prefixes        = distinct(concat(var.allowed_object_prefixes, ["${trimsuffix(var.creator_video_prefix, "/")}/*"]))
  object_arns             = [for prefix in local.managed_prefixes : "${local.bucket_arn}/${prefix}"]
  list_prefixes           = local.managed_prefixes
  incomplete_upload_abort = var.enable_incomplete_multipart_cleanup ? [1] : []
  tags = merge(var.tags, {
    Application = "SkillMango"
    ManagedBy   = "Terraform"
    Component   = "VideoStorage"
  })
}

resource "aws_s3_bucket_public_access_block" "video" {
  bucket = data.aws_s3_bucket.video.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "video" {
  bucket = data.aws_s3_bucket.video.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "video" {
  bucket = data.aws_s3_bucket.video.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD", "PUT"]
    allowed_origins = var.allowed_cors_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "video" {
  bucket = data.aws_s3_bucket.video.id

  rule {
    id     = "skillmango-abort-incomplete-multipart-uploads"
    status = var.enable_incomplete_multipart_cleanup ? "Enabled" : "Disabled"

    filter {
      prefix = ""
    }

    dynamic "abort_incomplete_multipart_upload" {
      for_each = local.incomplete_upload_abort
      content {
        days_after_initiation = 7
      }
    }
  }
}

data "aws_iam_policy_document" "video_storage" {
  statement {
    sid     = "ListCreatorMediaPrefixes"
    effect  = "Allow"
    actions = ["s3:ListBucket"]

    resources = [local.bucket_arn]

    condition {
      test     = "StringLike"
      variable = "s3:prefix"
      values   = local.list_prefixes
    }
  }

  statement {
    sid    = "ReadWriteCreatorMediaObjects"
    effect = "Allow"
    actions = [
      "s3:AbortMultipartUpload",
      "s3:GetObject",
      "s3:ListMultipartUploadParts",
      "s3:PutObject"
    ]

    resources = local.object_arns
  }
}

resource "aws_iam_user" "video_storage" {
  name = var.iam_user_name
  tags = local.tags
}

resource "aws_iam_policy" "video_storage" {
  name        = "${var.iam_user_name}-policy"
  description = "Least-privilege S3 access for SkillMango creator video uploads."
  policy      = data.aws_iam_policy_document.video_storage.json
  tags        = local.tags
}

resource "aws_iam_user_policy_attachment" "video_storage" {
  user       = aws_iam_user.video_storage.name
  policy_arn = aws_iam_policy.video_storage.arn
}

resource "aws_iam_access_key" "video_storage" {
  user = aws_iam_user.video_storage.name
}
