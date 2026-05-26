# SkillMango AWS Video Storage

This Terraform stack connects an existing Amazon S3 bucket to SkillMango media uploads.

It does not create a bucket. It configures the existing bucket for private creator media, browser CORS for presigned uploads, and a least-privilege IAM user for the API.

## What It Creates

- S3 public access block for the existing bucket.
- S3 server-side encryption with `AES256`.
- S3 CORS for browser `PUT`, `GET`, and `HEAD` requests from your frontend origins.
- Lifecycle cleanup for abandoned multipart uploads.
- IAM user, IAM policy, and access key for the SkillMango API.

Creator uploads are stored by the API under prefixes like:

```text
videos/creators/<creatorId>/<random>-lesson.mp4
```

## Setup

Authenticate Terraform with your AWS account first. Use one of these:

```powershell
$env:AWS_PROFILE="your-profile"
```

or:

```powershell
$env:AWS_ACCESS_KEY_ID="..."
$env:AWS_SECRET_ACCESS_KEY="..."
$env:AWS_REGION="us-east-1"
```

Then run:

```powershell
cd D:\BSSE\Projects\skil\infra\aws-video-storage
Copy-Item terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:

- `aws_region`: region of your existing bucket.
- `bucket_name`: exact bucket name you already created.
- `allowed_cors_origins`: local and production frontend URLs.

Apply:

```powershell
terraform init
terraform plan
terraform apply
```

## App Environment

Copy the outputs into `apps/api/.env` locally or your production secret manager:

```powershell
terraform output api_env_example
terraform output -raw secret_access_key
```

Use:

```env
S3_BUCKET="your-existing-skillmango-video-bucket"
S3_REGION="us-east-1"
S3_ENDPOINT=""
S3_ACCESS_KEY="terraform-output-access-key-id"
S3_SECRET_KEY="terraform-output-secret-access-key"
```

Keep `S3_ENDPOINT` empty for normal AWS S3. It is only needed for S3-compatible providers like Cloudflare R2.

## State Security

The generated IAM secret is stored in Terraform state. Do not commit `.tfstate`, `.tfvars`, or `.terraform/`. Use a secure remote backend before production team use.
