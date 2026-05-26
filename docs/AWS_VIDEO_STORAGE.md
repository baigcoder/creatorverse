# AWS Video Storage Integration

SkillMango uploads media through the API:

1. The creator requests `POST /api/v1/media/upload-policy`.
2. The API creates a presigned S3 `PUT` URL.
3. The browser uploads the file directly to S3.
4. The browser calls `POST /api/v1/media/complete-upload`.
5. SkillMango stores a `MediaAsset` row and uses signed URLs for protected access.

## Creator Prefixes

Creator uploads are stored in one private S3 bucket using per-creator prefixes:

```text
videos/creators/<creatorId>/<random>-lesson.mp4
```

This avoids creating one S3 bucket per creator while still keeping object ownership explicit in the app and IAM policy.

## Terraform

Use the stack in:

```text
infra/aws-video-storage
```

It expects an existing bucket and configures:

- private bucket access controls,
- CORS for browser presigned uploads,
- server-side encryption,
- incomplete multipart upload cleanup,
- IAM access keys scoped to SkillMango media prefixes.

```powershell
cd D:\BSSE\Projects\skil\infra\aws-video-storage
Copy-Item terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

Then copy outputs into `apps/api/.env` or your production secrets:

```env
S3_BUCKET="your-bucket"
S3_REGION="us-east-1"
S3_ENDPOINT=""
S3_ACCESS_KEY="..."
S3_SECRET_KEY="..."
```

Restart the API after changing these values.
