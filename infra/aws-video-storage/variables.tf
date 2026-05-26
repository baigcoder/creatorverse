variable "aws_region" {
  description = "AWS region where the existing S3 bucket lives."
  type        = string
}

variable "bucket_name" {
  description = "Existing S3 bucket name used by SkillMango video/media uploads."
  type        = string
}

variable "allowed_cors_origins" {
  description = "Browser origins allowed to PUT/GET media through presigned URLs."
  type        = list(string)
}

variable "iam_user_name" {
  description = "IAM user created for the SkillMango API to presign video upload and access URLs."
  type        = string
  default     = "skillmango-video-storage"
}

variable "creator_video_prefix" {
  description = "Primary S3 object prefix used for creator video uploads."
  type        = string
  default     = "videos/creators"
}

variable "allowed_object_prefixes" {
  description = "S3 object prefixes the API can read/write. Keep this aligned with MediaService folders."
  type        = list(string)
  default = [
    "videos/creators/*",
    "course-assets/creators/*",
    "products/creators/*",
    "uploads/creators/*",
    "videos/users/*",
    "course-assets/users/*",
    "products/users/*",
    "uploads/users/*"
  ]
}

variable "enable_incomplete_multipart_cleanup" {
  description = "Delete abandoned multipart uploads after 7 days."
  type        = bool
  default     = true
}

variable "tags" {
  description = "Extra tags for IAM resources."
  type        = map(string)
  default     = {}
}
