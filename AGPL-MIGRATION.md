# AGPL Migration Guide

This document explains the changes made to create a fully AGPL-licensed fork of Papermark.

## Summary of Changes

### Removed (Commercial License)
All code in the `/ee` directory has been removed (83 files, 808KB):
- **Stripe Billing**: Payment processing, subscriptions, webhooks
- **Conversations**: In-document chat and FAQ system
- **Templates**: Dataroom templates and generation
- **Advanced Permissions**: Enterprise permission UI components
- **Plan Limits**: Commercial plan enforcement

### Added (AGPL License)
New clean-room AGPL implementations:

#### Storage Configuration (`lib/storage/config.ts`)
- S3/MinIO storage configuration
- Multi-region support
- Team-specific storage (extensible)
- **Compatible with existing MinIO Docker setup**

#### Security (`lib/security/`)
- `access-notifications.ts`: Logs denied access attempts
- `index.ts`: Rate limiting and fraud prevention stubs

#### Limits System (`lib/limits/`)
- All features unlimited for self-hosted
- No plan restrictions
- Compatible with existing limit checks in UI

#### Stub Modules (`lib/ee-stubs/`)
- `stripe.ts`: Billing features disabled
- `billing.ts`: Cancellation/pause features disabled
- `conversations.ts`: Chat/FAQ features disabled
- `templates.ts`: Template features disabled
- `permissions.ts`: Advanced permission UI disabled

## What Still Works

✅ **Core Document Sharing**
- Upload and share documents
- Create shareable links
- Track views and analytics
- Email verification and OTP
- Password protection
- Custom domains

✅ **Datarooms**
- Create and manage datarooms
- Folder organization
- Access controls
- Viewer permissions
- Download tracking

✅ **Storage**
- MinIO S3-compatible storage
- Multi-region support (if configured)
- File encryption
- Document versioning

✅ **Analytics**
- View tracking
- Visitor analytics
- Link performance
- Document insights

✅ **Team Management**
- Multiple users
- Role-based access (Admin, Manager, Member)
- Team invitations
- User permissions

✅ **Security**
- Email verification
- OTP authentication
- Access logging
- IP tracking
- Email allowlists/denylists

## What's Different

### No Billing/Payments
- No Stripe integration
- No subscription management
- No payment processing
- **Impact**: All features are free and unlimited

### No Conversations
- No in-document chat
- No FAQ system
- **Alternative**: Use Slack, email, or external chat tools

### No Templates
- No pre-built dataroom templates
- **Alternative**: Create dataroom structures manually

### Unlimited Everything
- No user limits
- No document limits
- No link limits
- No dataroom limits
- All features enabled by default

## Deployment

### Environment Variables
The same environment variables from the original Papermark work:

```bash
# Required
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-domain.com
POSTGRES_PASSWORD=your-db-password
MINIO_ROOT_USER=papermark
MINIO_ROOT_PASSWORD=your-minio-password

# Storage (MinIO)
NEXT_PUBLIC_UPLOAD_TRANSPORT=s3
NEXT_PRIVATE_UPLOAD_ENDPOINT=http://minio:9000
NEXT_PRIVATE_UPLOAD_REGION=us-east-1
NEXT_PRIVATE_UPLOAD_BUCKET=papermark-documents
NEXT_PRIVATE_UPLOAD_ACCESS_KEY_ID=papermark
NEXT_PRIVATE_UPLOAD_SECRET_ACCESS_KEY=your-minio-password
NEXT_PRIVATE_UPLOAD_FORCE_PATH_STYLE=true

# Optional
RESEND_API_KEY=your-resend-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Docker Deployment
The existing `docker-compose.yml` works without changes:

```bash
docker-compose up -d
```

Services:
- PostgreSQL (database)
- MinIO (S3-compatible storage)
- Papermark (Next.js app)
- Nginx (optional, for SSL)

## Migration from Original Papermark

If migrating from original Papermark:

1. **Database**: Compatible, no schema changes needed
2. **Storage**: Files in MinIO/S3 work unchanged
3. **Team Data**: All team/user data preserved
4. **Documents**: All documents and links work unchanged

**Note**: Billing/subscription data will be ignored (no longer used).

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Troubleshooting

### "Feature disabled" errors
Some UI components may show "Feature disabled" for removed features (billing, conversations, templates). This is expected.

### Missing /ee imports
If you see TypeScript errors about missing `/ee` imports, they should all be redirected to stub modules in `lib/ee-stubs/`. If not, run:

```bash
grep -r "from \"@/ee" --include="*.ts" --include="*.tsx" .
```

To find any remaining imports and replace them.

### Storage not working
Ensure MinIO is running and environment variables are correctly set:
- `NEXT_PRIVATE_UPLOAD_ENDPOINT` should point to MinIO
- `NEXT_PRIVATE_UPLOAD_FORCE_PATH_STYLE=true` is required for MinIO
- Bucket should be created (docker-compose does this automatically)

## License

This fork is licensed under AGPLv3. See LICENSE file for details.

**Original Papermark**: Copyright (c) 2023-present Papermark, Inc.
**AGPL Modifications**: Copyright (c) 2025-present Regenerative Assets LLC

## Support

For issues specific to this AGPL fork, please file issues in the Regenerative Assets repository.

For general Papermark questions, see the original Papermark documentation.
